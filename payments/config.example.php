<?php
// Copy to /home/davidovd/course-payments/config.php, never public_html.
return [
    'enabled' => false,
    'base_url' => 'https://xn--h1acejlsg2a1bo.xn--p1ai',
    'shop_id' => '',
    'secret_key' => '', // ONLY test_ keys; live payments are deliberately unsupported.
    'course_url' => '', // Google Drive folder, shared with anyone who has the link.
    'smtp_host' => '',
    'smtp_port' => 465,
    'smtp_security' => 'ssl', // ssl (465) or tls (587)
    'smtp_username' => '',
    'smtp_password' => '',
    'mail_from' => '',
    'mail_from_name' => 'Дмитрий Давыдов — Личный путь',
    'telegram_token' => '',
    'telegram_chat_id' => '',
];
