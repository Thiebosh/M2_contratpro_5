<?php
$default_page = "";
echo("\ndans le routeur du projet !");

if (file_exists("{$project_name}/{$post['page']}")) {
    echo("la page demandée existe!");
    include_once(__DIR__."/{$post['page']}");
    exit();
}

if (file_exists("{$project_name}/{$default_page}")) {
    echo("la page par défaut existe!");
    include_once(__DIR__."/{$default_page}");
    exit();
}

echo("Generation error : No page found");
exit();
