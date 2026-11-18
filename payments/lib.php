<?php
declare(strict_types=1);

function products(): array {
    return [
        'course' => ['title' => 'Как выйти из личностного кризиса', 'amount' => '2900.00'],
        'consultation' => ['title' => 'Консультация с Дмитрием — 30 минут', 'amount' => '5000.00'],
    ];
}
function settings(): array { return require __DIR__ . '/config.php'; }
function ready(array $c, string $product): bool {
    $common = ($c['enabled'] ?? false) === true && !empty($c['shop_id'])
        && str_starts_with($c['secret_key'] ?? '', 'test_')
        && str_starts_with($c['base_url'] ?? '', 'https://');
    if (!$common) return false;
    return $product === 'course'
        ? validDriveUrl($c['course_url'] ?? '') && !empty($c['smtp_host']) && !empty($c['smtp_username'])
            && !empty($c['smtp_password']) && (bool)filter_var($c['mail_from'] ?? '', FILTER_VALIDATE_EMAIL)
        : $product === 'consultation' && !empty($c['telegram_token']) && !empty($c['telegram_chat_id']);
}
function validDriveUrl(string $url): bool {
    return filter_var($url, FILTER_VALIDATE_URL) && parse_url($url, PHP_URL_SCHEME) === 'https'
        && parse_url($url, PHP_URL_HOST) === 'drive.google.com';
}
function db(): PDO {
    static $db;
    if ($db) return $db;
    umask(0077);
    $db = new PDO('sqlite:' . __DIR__ . '/orders.sqlite', null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $db->exec('PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL;');
    $db->exec('CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY, product TEXT NOT NULL, amount TEXT NOT NULL,
        email TEXT NOT NULL, name TEXT NOT NULL, phone TEXT NOT NULL,
        payment_id TEXT UNIQUE, payment_url TEXT, state TEXT NOT NULL DEFAULT "new",
        created INTEGER NOT NULL, checked INTEGER NOT NULL DEFAULT 0,
        delivered INTEGER, attempts INTEGER NOT NULL DEFAULT 0, next_attempt INTEGER NOT NULL DEFAULT 0,
        last_error TEXT
    ); CREATE TABLE IF NOT EXISTS limits (bucket TEXT PRIMARY KEY, count INTEGER NOT NULL);');
    return $db;
}
function order(string $id): ?array {
    $q = db()->prepare('SELECT * FROM orders WHERE id=?'); $q->execute([$id]);
    return $q->fetch(PDO::FETCH_ASSOC) ?: null;
}
function updateOrder(string $id, array $values): void {
    $allowed = ['payment_id','payment_url','state','checked','delivered','attempts','next_attempt','last_error'];
    foreach (array_keys($values) as $key) if (!in_array($key, $allowed, true)) throw new RuntimeException('Invalid field');
    $q = db()->prepare('UPDATE orders SET ' . implode(',', array_map(fn($k) => "$k=?", array_keys($values))) . ' WHERE id=?');
    $q->execute([...array_values($values), $id]);
}
function limited(string $ip): bool {
    $bucket = hash('sha256', $ip) . ':' . gmdate('YmdH');
    db()->prepare('INSERT INTO limits(bucket,count) VALUES (?,1) ON CONFLICT(bucket) DO UPDATE SET count=count+1')->execute([$bucket]);
    $q = db()->prepare('SELECT count FROM limits WHERE bucket=?'); $q->execute([$bucket]);
    return (int)$q->fetchColumn() > 10;
}
function api(array $c, string $method, string $path, ?array $body = null, ?string $key = null): array {
    if (!str_starts_with($c['secret_key'] ?? '', 'test_')) throw new RuntimeException('Only test credentials are allowed');
    $curl = curl_init('https://api.yookassa.ru/v3/' . $path);
    $headers = ['Content-Type: application/json'];
    if ($key) $headers[] = 'Idempotence-Key: ' . $key;
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_USERPWD => $c['shop_id'] . ':' . $c['secret_key'], CURLOPT_HTTPHEADER => $headers,
        CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 20, CURLOPT_FOLLOWLOCATION => false]);
    if ($body !== null) curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($body, JSON_THROW_ON_ERROR));
    $raw = curl_exec($curl); $code = curl_getinfo($curl, CURLINFO_HTTP_CODE); curl_close($curl);
    if ($raw === false || $code < 200 || $code >= 300) throw new RuntimeException('Payment provider unavailable');
    return json_decode($raw, true, 32, JSON_THROW_ON_ERROR);
}
function checkoutUrl(string $url): bool {
    return parse_url($url, PHP_URL_SCHEME) === 'https'
        && in_array(parse_url($url, PHP_URL_HOST), ['yoomoney.ru', 'yookassa.ru'], true);
}
function createPayment(array $c, array $o, ?callable $transport = null): array {
    if (!ready($c, $o['product'])) throw new RuntimeException('Payments are not configured');
    // Retry an ambiguous API timeout with the SAME order ID and identical payload, within 24h.
    if (time() - (int)$o['created'] > 82800) throw new RuntimeException('Order expired');
    if ($o['payment_id']) return $o;
    $payload = ['amount' => ['value' => $o['amount'], 'currency' => 'RUB'], 'capture' => true,
        'confirmation' => ['type' => 'redirect', 'return_url' => $c['base_url'] . '/checkout.php?order=' . $o['id']],
        'description' => products()[$o['product']]['title'], 'metadata' => ['order_id' => $o['id']]];
    $p = $transport ? $transport($payload, $o['id']) : api($c, 'POST', 'payments', $payload, $o['id']);
    if (($p['test'] ?? null) !== true || empty($p['id']) || !checkoutUrl($p['confirmation']['confirmation_url'] ?? ''))
        throw new RuntimeException('Unexpected payment response');
    updateOrder($o['id'], ['payment_id' => $p['id'], 'payment_url' => $p['confirmation']['confirmation_url'], 'state' => 'pending']);
    return order($o['id']);
}
function validPayment(array $c, array $o, array $p): bool {
    return ($p['id'] ?? '') === $o['payment_id'] && ($p['metadata']['order_id'] ?? '') === $o['id']
        && ($p['amount']['value'] ?? '') === $o['amount'] && ($p['amount']['currency'] ?? '') === 'RUB'
        && (string)($p['recipient']['account_id'] ?? '') === (string)$c['shop_id'] && ($p['test'] ?? null) === true;
}
function refreshPayment(array $c, array $o, ?callable $transport = null): array {
    if (!$o['payment_id']) return $o;
    $p = $transport ? $transport($o['payment_id']) : api($c, 'GET', 'payments/' . rawurlencode($o['payment_id']));
    if (!validPayment($c, $o, $p)) throw new RuntimeException('Payment verification failed');
    $values = ['checked' => time()];
    if (($p['status'] ?? '') === 'succeeded' && ($p['paid'] ?? false) === true) $values['state'] = 'paid';
    elseif (($p['status'] ?? '') === 'canceled') $values['state'] = 'canceled';
    updateOrder($o['id'], $values);
    return order($o['id']);
}
function deliver(array $c, array $o): void {
    if ($o['state'] !== 'paid' || $o['delivered']) return;
    if (!ready($c, $o['product'])) throw new RuntimeException('Delivery configuration missing');
    if ($o['product'] === 'course') {
        require_once __DIR__ . '/vendor/PHPMailer/src/Exception.php';
        require_once __DIR__ . '/vendor/PHPMailer/src/PHPMailer.php';
        require_once __DIR__ . '/vendor/PHPMailer/src/SMTP.php';
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP(); $mail->Host = $c['smtp_host']; $mail->Port = (int)$c['smtp_port'];
        $mail->SMTPAuth = true; $mail->Username = $c['smtp_username']; $mail->Password = $c['smtp_password'];
        $mail->SMTPSecure = $c['smtp_security']; $mail->Timeout = 15; $mail->CharSet = 'UTF-8';
        $mail->setFrom($c['mail_from'], $c['mail_from_name']); $mail->addAddress($o['email']);
        $mail->Subject = '[ТЕСТ] Доступ к курсу — Личный путь';
        $mail->Body = "Это тестовая покупка. Деньги не списывались.\n\nКурс: " . products()['course']['title']
            . "\nМатериалы: " . $c['course_url'] . "\n\nЗаказ: " . $o['id'];
        $mail->send();
    } else {
        $curl = curl_init('https://api.telegram.org/bot' . $c['telegram_token'] . '/sendMessage');
        curl_setopt_array($curl, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 20, CURLOPT_POSTFIELDS => http_build_query(['chat_id' => $c['telegram_chat_id'],
            'text' => "[ТЕСТ — деньги не списывались]\nОплачена консультация: 5000 ₽\nИмя: " . $o['name']
                . "\nТелефон: " . $o['phone'] . "\nЗаказ: " . $o['id']])]);
        $raw = curl_exec($curl); $code = curl_getinfo($curl, CURLINFO_HTTP_CODE); curl_close($curl);
        if ($code !== 200 || !(json_decode($raw ?: '{}', true)['ok'] ?? false)) throw new RuntimeException('Telegram unavailable');
    }
    updateOrder($o['id'], ['delivered' => time(), 'last_error' => null]);
}
function processQueue(array $c, ?callable $sender = null): int {
    $lock = fopen(__DIR__ . '/delivery.lock', 'c');
    if (!flock($lock, LOCK_EX | LOCK_NB)) { fclose($lock); return 0; }
    $count = 0;
    try {
        $q = db()->prepare('SELECT * FROM orders WHERE state="paid" AND delivered IS NULL AND next_attempt<=? LIMIT 10');
        $q->execute([time()]);
        foreach ($q->fetchAll(PDO::FETCH_ASSOC) as $o) {
            try {
                if ($sender) { $sender($o); updateOrder($o['id'], ['delivered' => time(), 'last_error' => null]); }
                else deliver($c, $o);
                $count++;
            } catch (Throwable $e) {
                $attempts = (int)$o['attempts'] + 1;
                updateOrder($o['id'], ['attempts' => $attempts, 'next_attempt' => time() + min(3600, 60 * 2 ** min($attempts, 6)),
                    'last_error' => 'Delivery failed; check configuration and provider']);
            }
        }
    } finally { flock($lock, LOCK_UN); fclose($lock); }
    return $count;
}
