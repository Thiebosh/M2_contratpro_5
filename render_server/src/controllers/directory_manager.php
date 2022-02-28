<?php
class DirectoryManager {
    private static string $emplacement;

    public function __construct($emplacement) {
        $this->$emplacement = $emplacement;
    }

    public static function folder_exist($path) : bool {
        return true ? true : false; // test existence
    }

    public static function file_exist($path) : bool {
        return file_exists("{DirectoryManager::emplacement}/{$path}") ? true : false; // test existence
    }

    public function create_folder() : string {
        if (!isset($_GET['project_name'])) return $BAD_REQUEST; # $_POST

        $post['project_name'] = filter_input(INPUT_GET, 'project_name', FILTER_SANITIZE_STRING); # INPUT_POST
        if (in_array(false, $post, true)) return $BAD_REQUEST;

        $path = "{DirectoryManager::emplacement}/{$post['project_name']}";

        if (self::folder_exist($path)) return $SUCCESS;

        $result = mkdir($path, 0777, true);

        return $result ? $SUCCESS : $ERROR;
    }

    public function create_file() : string {
        if (!isset($_GET['project_name'], $_GET['file_name'], $_GET['file_content'])) return $BAD_REQUEST; # $_POST

        $post['project_name'] = filter_input(INPUT_GET, 'project_name', FILTER_SANITIZE_STRING); # INPUT_POST
        $post['file_name'] = filter_input(INPUT_GET, 'file_name', FILTER_SANITIZE_STRING); # INPUT_POST
        $post['file_content'] = filter_input(INPUT_GET, 'file_content', FILTER_SANITIZE_STRING); # INPUT_POST
        if (in_array(false, $post, true)) return $BAD_REQUEST;

        if (!self::folder_exist($path)) return $ERROR;

        $result = file_put_contents("{DirectoryManager::emplacement}/{$post['project_name']}/{$post['file_name']}", $post['file_content']);

        return $result !== false ? $SUCCESS : $ERROR;
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
