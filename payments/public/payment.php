<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
require dirname(__DIR__, 4) . '/course-payments/lib.php';
$c = settings();
$action = $_GET['action'] ?? '';
if ($action === 'health' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(['mode' => 'test-only', 'course_ready' => ready($c, 'course'),
        'consultation_ready' => ready($c, 'consultation')]); exit;
}
if ($action !== 'webhook' || $_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(404); echo '{}'; exit; }
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 16384) { http_response_code(413); exit; }
if (!($c['enabled'] ?? false)) { http_response_code(503); echo '{"error":"disabled"}'; exit; }
try {
    $body = json_decode(file_get_contents('php://input', false, null, 0, 16385), true, 32, JSON_THROW_ON_ERROR);
    $id = $body['object']['id'] ?? '';
    if (!is_string($id) || strlen($id) > 100 || ($body['type'] ?? '') !== 'notification') throw new InvalidArgumentException();
    if (!in_array($body['event'] ?? '', ['payment.succeeded','payment.canceled'], true)) { echo '{}'; exit; }
    $q = db()->prepare('SELECT * FROM orders WHERE payment_id=?'); $q->execute([$id]);
    $o = $q->fetch(PDO::FETCH_ASSOC);
    // Unknown payments never trigger API calls or delivery. The worker reconciles a lost create response.
    if ($o) refreshPayment($c, $o);
    echo '{"ok":true}'; // durable paid state; delivery is performed by the cron worker
} catch (InvalidArgumentException | JsonException $e) { http_response_code(400); echo '{}'; }
catch (Throwable $e) { http_response_code(503); echo '{"error":"retry"}'; }
