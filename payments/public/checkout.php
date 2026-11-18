<?php
declare(strict_types=1);
require dirname(__DIR__, 3) . '/course-payments/lib.php';
header('Cache-Control: no-store'); header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer'); header('X-Frame-Options: DENY');
// Chromium also checks a form submission's redirect destination against form-action.
// Keep the allowlist aligned with checkoutUrl() rather than allowing arbitrary HTTPS sites.
header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; form-action 'self' https://yoomoney.ru https://yookassa.ru; frame-ancestors 'none'; base-uri 'none'");
$c = settings();
umask(0077);
if (!is_dir(dirname(__DIR__, 3) . '/course-payments/sessions')) mkdir(dirname(__DIR__, 3) . '/course-payments/sessions', 0700);
session_save_path(dirname(__DIR__, 3) . '/course-payments/sessions');
session_name('course_test_session');
session_start(['cookie_secure' => true, 'cookie_httponly' => true, 'cookie_samesite' => 'Lax', 'use_strict_mode' => true]);
$_SESSION['csrf'] ??= bin2hex(random_bytes(32));
$product = is_string($_GET['product'] ?? null) ? $_GET['product'] : 'course';
if (!isset(products()[$product])) $product = 'course';
$error = ''; $o = null;
$id = $_GET['order'] ?? '';
if (is_string($id) && preg_match('/^[a-f0-9]{32}$/D', $id) && in_array($id, $_SESSION['orders'] ?? [], true)) {
    $o = order($id);
    if ($o) $product = $o['product'];
    if ($o && $o['payment_id'] && ready($c, $product) && time() - (int)$o['checked'] > 10) {
        try { $o = refreshPayment($c, $o); } catch (Throwable $e) { $error = 'Проверка оплаты временно недоступна. Попробуйте ещё раз.'; }
    }
} elseif ($id !== '') { http_response_code(404); $error = 'Заказ недоступен в этом браузере.'; }
$enabled = ready($c, $product) && ($_SERVER['HTTP_HOST'] ?? '') === parse_url($c['base_url'], PHP_URL_HOST)
    && (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if (!$enabled) throw new InvalidArgumentException('Тестовая оплата пока не настроена.');
        if (!hash_equals($_SESSION['csrf'], (string)($_POST['csrf'] ?? ''))) throw new InvalidArgumentException('Обновите страницу формы.');
        if (!empty($_POST['website'])) throw new InvalidArgumentException('Не удалось создать заказ.');
        $email = trim((string)($_POST['email'] ?? ''));
        $name = trim((string)($_POST['name'] ?? '')); $phone = trim((string)($_POST['phone'] ?? ''));
        if ($product === 'course' && (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254)) throw new InvalidArgumentException('Укажите корректный email.');
        if ($product === 'consultation' && (mb_strlen($name) < 2 || mb_strlen($name) > 100
            || !preg_match('/^[+0-9 ()-]{7,30}$/D', $phone) || preg_match_all('/[0-9]/', $phone) < 7)) throw new InvalidArgumentException('Проверьте имя и номер телефона.');
        if (($_POST['consent'] ?? '') !== 'yes') throw new InvalidArgumentException('Подтвердите передачу данных для тестового заказа.');
        $fingerprint = hash('sha256', json_encode([$product,$email,$name,$phone]));
        $last = $_SESSION['active'][$fingerprint] ?? '';
        $o = $last ? order($last) : null;
        if (!$o || in_array($o['state'], ['paid','canceled'], true) || time()-(int)$o['created']>82800) {
            if (limited($_SERVER['REMOTE_ADDR'] ?? 'unknown')) throw new InvalidArgumentException('Слишком много попыток. Попробуйте позже.');
            $id = bin2hex(random_bytes(16));
            db()->prepare('INSERT INTO orders(id,product,amount,email,name,phone,created) VALUES (?,?,?,?,?,?,?)')
                ->execute([$id,$product,products()[$product]['amount'],$product==='course'?$email:'',$product==='consultation'?$name:'',$product==='consultation'?$phone:'',time()]);
            $_SESSION['orders'][] = $id; $_SESSION['active'][$fingerprint] = $id; $o = order($id);
        }
        $o = createPayment($c, $o);
        session_write_close(); header('Location: ' . $o['payment_url'], true, 303); exit;
    } catch (Throwable $e) {
        $error = $e instanceof InvalidArgumentException ? $e->getMessage() : 'Не удалось открыть оплату. Повторите попытку — заказ сохранён.';
    }
}
function h(string $s): string { return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
?>
<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Тестовая покупка — Личный путь</title>
<style>body{margin:0;background:#f1f7f2;color:#24352a;font:16px/1.65 Arial,sans-serif}main{max-width:520px;margin:50px auto;padding:30px;background:#fff;border:1px solid #d9e6dc;border-radius:20px}h1{font-size:27px;line-height:1.3}a{color:#456e50}label{display:block;margin-top:16px}input:not([type=checkbox]){box-sizing:border-box;width:100%;padding:13px;border:1px solid #789580;border-radius:8px;font:inherit}button,.button{display:block;margin-top:24px;padding:15px 22px;background:#456e50;color:white;border:0;border-radius:12px;font:inherit;text-align:center;text-decoration:none}button:disabled{background:#edf3ee;color:#637168;cursor:not-allowed}.note{color:#637168;font-size:14px}.error{color:#a32626}.trap{position:absolute;left:-10000px}.price{font-size:26px}small{display:block}@media(max-width:600px){main{margin:20px;padding:24px}}</style>
<main><a href="/">← На сайт</a><p class="note">ТЕСТОВЫЙ МАГАЗИН · Деньги не списываются</p><h1><?=h(products()[$product]['title'])?></h1><p class="price"><?= $product==='course'?'2 900':'5 000' ?> ₽</p>
<?php if ($error): ?><p class="error" role="alert"><?=h($error)?></p><?php endif ?>
<?php if ($o && $o['state']==='paid'): ?>
<h2>Тестовая оплата подтверждена</h2>
<?php if ($product==='course'): ?><p>Ссылка на материалы <?= $o['delivered']?'отправлена':'будет отправлена' ?> на <?=h($o['email'])?>.</p><?php if(validDriveUrl($c['course_url'])): ?><a class="button" href="<?=h($c['course_url'])?>" rel="noreferrer">Открыть курс</a><?php endif ?>
<?php else: ?><p><?= $o['delivered']?'Заявка отправлена Дмитрию.':'Заявка сохранена и ожидает отправки Дмитрию.' ?> Он свяжется с вами для согласования времени.</p><?php endif ?>
<p class="note">Номер заказа: <?=h($o['id'])?></p>
<?php elseif ($o && $o['payment_id']): ?>
<h2><?= $o['state']==='canceled'?'Оплата отменена':'Ожидаем подтверждение оплаты' ?></h2>
<p>Если вы уже оплатили, проверьте состояние заказа. Повторно платить не нужно.</p>
<a class="button" href="?order=<?=h($o['id'])?>">Проверить статус</a>
<?php if($o['state']==='pending' && checkoutUrl($o['payment_url'])): ?><a class="button" href="<?=h($o['payment_url'])?>">Вернуться к тестовой оплате</a><?php endif ?>
<a href="?product=<?=h($product)?>">Новая покупка</a>
<?php else: ?>
<?php if(!$enabled): ?><p class="note">Тестовые платежи ещё не подключены. Форма станет доступна после настройки магазина и отправки уведомлений.</p><?php endif ?>
<form method="post" action="?product=<?=h($product)?>"><input type="hidden" name="csrf" value="<?=h($_SESSION['csrf'])?>"><fieldset <?=!$enabled?'disabled':''?> style="border:0;padding:0;margin:0">
<?php if($product==='course'): ?><label>Email для получения курса<input name="email" type="email" maxlength="254" required autocomplete="email"></label><p class="note">После подтверждения оплаты отправим ссылку на папку Google Диска.</p>
<?php else: ?><label>Ваше имя<input name="name" maxlength="100" minlength="2" required autocomplete="name"></label><label>Номер телефона<input name="phone" type="tel" maxlength="30" required autocomplete="tel"></label><p class="note">После подтверждения оплаты передадим имя и телефон Дмитрию через Telegram для согласования созвона.</p><?php endif ?>
<label class="trap" aria-hidden="true">Сайт<input name="website" tabindex="-1" autocomplete="off"></label>
<label><input type="checkbox" name="consent" value="yes" required> Разрешаю использовать указанные данные для тестового заказа и <?= $product==='course'?'отправки письма':'передачи заявки Дмитрию в Telegram' ?>.</label>
<button type="submit" <?=!$enabled?'disabled':''?>>Перейти к тестовой оплате</button></fieldset></form>
<?php endif ?><p class="note">Это проверка интеграции. Реальные продажи не включены.</p></main></html>
