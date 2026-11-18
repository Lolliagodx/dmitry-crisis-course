<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') exit;
$temp = sys_get_temp_dir() . '/course-payments-test-' . bin2hex(random_bytes(6));
mkdir($temp, 0700); copy(__DIR__ . '/lib.php', $temp . '/lib.php'); require $temp . '/lib.php';
$checks=0;
function check(bool $condition, string $label): void { global $checks; if (!$condition) throw new RuntimeException($label); $checks++; }
function fixture(string $id, string $product): array {
    db()->prepare('INSERT INTO orders(id,product,amount,email,name,phone,created) VALUES (?,?,?,?,?,?,?)')
        ->execute([$id,$product,products()[$product]['amount'],'test@example.com','Тест','+79990000000',time()]);
    return order($id);
}
$c=['enabled'=>true,'base_url'=>'https://example.com','shop_id'=>'123','secret_key'=>'test_example',
    'course_url'=>'https://drive.google.com/drive/folders/test','smtp_host'=>'smtp.example.com',
    'smtp_username'=>'user','smtp_password'=>'test','mail_from'=>'test@example.com',
    'telegram_token'=>'test','telegram_chat_id'=>'123'];
check(ready($c,'course') && ready($c,'consultation'),'configured products');
check(!ready([...$c,'secret_key'=>'live_example'],'course'),'live key blocked');
check(!ready([...$c,'enabled'=>false],'course'),'disabled blocked');
check(!validDriveUrl('https://drive.google.com.evil.example/folder'),'drive hostname validation');
check(!checkoutUrl('https://yoomoney.ru.evil.example/'),'payment redirect validation');
$o=fixture(str_repeat('a',32),'course'); $calls=0;
$o=createPayment($c,$o,function($body,$key)use(&$calls,$o){
    check($body['amount']['value']==='2900.00' && $body['amount']['currency']==='RUB','fixed course price');
    check($key===$o['id'],'stable idempotence key'); $calls++;
    return ['test'=>true,'id'=>'payment-test','confirmation'=>['confirmation_url'=>'https://yoomoney.ru/checkout/test']];
});
createPayment($c,$o,function()use(&$calls){$calls++;}); check($calls===1,'create retry reuses payment');
$p=['id'=>'payment-test','metadata'=>['order_id'=>$o['id']],'recipient'=>['account_id'=>'123'],
    'amount'=>['value'=>'2900.00','currency'=>'RUB'],'test'=>true,'status'=>'succeeded','paid'=>true];
foreach ([['test'=>false],['paid'=>false],['status'=>'pending'],['amount'=>['value'=>'1.00','currency'=>'RUB']],
    ['metadata'=>['order_id'=>'other']],['recipient'=>['account_id'=>'other']],['id'=>'other']] as $bad) {
    try { refreshPayment($c,$o,fn()=>array_replace($p,$bad)); } catch(RuntimeException $e) {}
    check(order($o['id'])['state']!=='paid','unverified payment does not grant access');
}
$o=refreshPayment($c,$o,fn()=>$p); check($o['state']==='paid','verified payment grants access');
refreshPayment($c,$o,fn()=>$p);
$sent=0; processQueue($c,function()use(&$sent){$sent++;}); processQueue($c,function()use(&$sent){$sent++;});
check($sent===1,'duplicate notification does not repeat completed delivery');
$consult=fixture(str_repeat('b',32),'consultation'); check($consult['amount']==='5000.00','fixed consultation price');
updateOrder($consult['id'],['state'=>'paid']);
processQueue($c,function(){throw new RuntimeException('simulated outage');});
check(order($consult['id'])['delivered']===null && (int)order($consult['id'])['attempts']===1,'failed delivery persists for retry');
updateOrder($consult['id'],['next_attempt'=>0]); processQueue($c,function()use(&$sent){$sent++;});
check(order($consult['id'])['delivered']!==null,'retry delivers paid consultation');
for($i=0;$i<10;$i++) check(!limited('test-ip'),'rate allowance');
check(limited('test-ip'),'rate limit');
echo "$checks checks passed; no external API calls, email or Telegram messages were made.\n";
// Only remove files in this freshly created test directory.
foreach(glob($temp.'/*') as $file) unlink($file); rmdir($temp);
