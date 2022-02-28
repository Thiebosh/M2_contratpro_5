<?php
class DirectoryManager {
    private static string $emplacement;

    public function __construct($emplacement) {
        $this->$emplacement = $emplacement;
    }

    public function create_folder($path) : boolval {
        $path = "{DirectoryManager::emplacement}/{$path}";
        return (is_dir($path)) ? true : mkdir($path, 0777, true);
    }

    public function create_file($path, $content) : boolval {
        $path = "{DirectoryManager::emplacement}/{$path}";
        return (!is_dir($path)) ? false : file_put_contents($path, $content) !== false;
    }

    public function remove_files() : string {
        if (!isset($_GET['project_name'])) return $BAD_REQUEST; # $_POST

        $post['project_name'] = filter_input(INPUT_GET, 'project_name', FILTER_SANITIZE_STRING); # INPUT_POST
        if (in_array(false, $post, true)) return $BAD_REQUEST;

        if (!self::folder_exist($path)) return $ERROR;

        // remove all files in folder

        return $result ? $SUCCESS : $ERROR;
    }

    public function remove_folder() : string {
        if (!isset($_GET['project_name'])) return $BAD_REQUEST; # $_POST

        $post['project_name'] = filter_input(INPUT_GET, 'project_name', FILTER_SANITIZE_STRING); # INPUT_POST
        if (in_array(false, $post, true)) return $BAD_REQUEST;

        if (self::folder_exist($path)) return $SUCCESS;

        // remove all files in folder (or folder deletion recursive ?)
        // remove folder

        return $result ? $SUCCESS : $ERROR;
    }
}
