<?php
function call_page($page) {
    try {
        ob_start(); // mise en cache de tous les futurs echo
        include($page);
        $result = ob_get_clean(); // recuperation du cache
    } catch(Exception $e) {
        return false;
    }
    echo($result); // n'affiche rien si erreur
    return true;
}

$page_call = trim($page_call);

if ($page_call !== '' && is_readable(__DIR__."/{$page_call}")) {
    http_response_code($RESP_CODE[call_page(__DIR__."/{$page_call}") ? "success" : "error"]);
    exit();
}

http_response_code($RESP_CODE["not_found"]);
exit();
