<?php
$default_page = "";

// modifier la selection de la page par défaut : fonctionne mais pb à tous les niveaux

function call_page($page) {
    try {
        ob_start(); // mise en cache de tous les futurs echo
        include_once($page);
        $result = ob_get_clean(); // recuperation du cache
    } catch(Exception $e) {
        return false;
    }
    echo($result); // n'affiche rien si erreur
    return true;
}

if (file_exists(__DIR__."/{$page_call}")) {
    http_response_code($RESP_CODE[call_page(__DIR__."/{$page_call}") ? "success" : "error"]);
    exit();
}

if (file_exists(__DIR__."/{$default_page}")) {
    http_response_code($RESP_CODE[call_page(__DIR__."/{$default_page}") ? "success" : "error"]);
    exit();
}

http_response_code($RESP_CODE["not_found"]);
exit();
