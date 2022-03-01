<?php
$default_page = "";

if (file_exists("{$project_name}/{$post['page']}")) {
    echo("la page demandée existe!");
    include_once(__DIR__."/{$post['page']}");
    http_response_code($SUCCESS);
    exit();
}

if (file_exists("{$project_name}/{$default_page}")) {
    echo("la page par défaut existe!");
    include_once(__DIR__."/{$default_page}");
    http_response_code($SUCCESS);
    exit();
}

http_response_code($NOT_FOUND);
exit();
