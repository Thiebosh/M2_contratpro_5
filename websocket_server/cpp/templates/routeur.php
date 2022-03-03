<?php
$default_page = "";

// echo("hello world!");
// exit();

if (file_exists(__DIR__."/{$page_call}")) {
    echo("la page demandée {$page_call} existe!");
    //include_once(__DIR__."/{$page_call}");
    http_response_code($RESP_CODE["success"]);
    exit();
}

if (file_exists(__DIR__."/{$default_page}")) {
    echo("la page par défaut {$page_call} existe!");
    //include_once(__DIR__."/{$default_page}");
    http_response_code($RESP_CODE["success"]);
    exit();
}

http_response_code($RESP_CODE["not_found"]);
exit();
