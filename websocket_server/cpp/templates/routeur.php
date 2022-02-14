<?php
$default_page = ""
$dir = __DIR__

if (file_exists("{$project_name}/{$post['page']}")) {
    require_once("{$dir}/{$post['page']}")
    exit()
}

if (file_exists("{$project_name}/{$default_page}")) {
    require_once("{$dir}/{$default_page}")
    exit()
}

echo("Generation error : No page found")
exit()
