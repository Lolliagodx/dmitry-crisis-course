<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/lib.php';
$c = settings();
if (!($c['enabled'] ?? false) || !str_starts_with($c['secret_key'] ?? '', 'test_')) exit;
$lock = fopen(__DIR__ . '/worker.lock', 'c');
if (!flock($lock, LOCK_EX | LOCK_NB)) exit;
$q = db()->prepare('SELECT * FROM orders WHERE state IN ("new","pending") AND created>? AND checked<? ORDER BY checked LIMIT 20');
$q->execute([time()-82800, time()-60]);
foreach ($q->fetchAll(PDO::FETCH_ASSOC) as $o) {
    try {
        updateOrder($o['id'], ['checked' => time()]);
        if (!$o['payment_id']) $o = createPayment($c, $o);
        refreshPayment($c, $o);
    } catch (Throwable $e) { /* retry next scheduled run; never log credentials or buyer data */ }
}
processQueue($c);
db()->exec('DELETE FROM limits WHERE substr(bucket,-10) < "' . gmdate('YmdH', time()-172800) . '"');
// Pending abandoned orders contain buyer data; remove after 7 days. Paid orders retained for support.
db()->prepare('DELETE FROM orders WHERE state!="paid" AND created<?')->execute([time()-604800]);
flock($lock, LOCK_UN); fclose($lock);
