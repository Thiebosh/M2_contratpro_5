<?php
$default_page = "";

// modifier la selection de la page par défaut : fonctionne mais pb à tous les niveaux

if (file_exists(__DIR__."/{$page_call}")) {
    include_once(__DIR__."/{$page_call}");
    http_response_code($RESP_CODE["success"]);
    exit();
}

if (file_exists(__DIR__."/{$default_page}")) {
    include_once(__DIR__."/{$default_page}");
    http_response_code($RESP_CODE["success"]);
    exit();
}

http_response_code($RESP_CODE["not_found"]);
exit();
