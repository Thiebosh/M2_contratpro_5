<?php
$default_page = ""
$project_name = __DIR__

if (isset($_GET["page"])) {
    $page = filter_input(INPUT_GET, "page", FILTER_SANITIZE_STRING);
    
    if ($page && file_exists("{$project_name}/{$page}")) {
        require_once("{$project_name}/{$page}")
        exit()
    }
}

if (file_exists("{$project_name}/{$default_page}")) {
    require_once("{$project_name}/{$default_page}")
    exit()
}

echo("Generation error : No page found")
exit()
