<?php
$default_page = ""
$dir = __DIR__
echo("dans le routeur du projet !");

if (file_exists("{$project_name}/{$post['page']}")) {
    echo("la page demandée existe!");
    require_once("{$dir}/{$post['page']}")
    exit()
}

if (file_exists("{$project_name}/{$default_page}")) {
    echo("la page par défaut existe!");
    require_once("{$dir}/{$default_page}")
    exit()
}

echo("Generation error : No page found")
exit()
