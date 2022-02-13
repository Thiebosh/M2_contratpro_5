<?php
class DirectoryManager {
    private string $emplacement = "projects";

    public function create_folder() : string {
        if (!isset($_GET['project_name'])) return $BAD_REQUEST; # $_POST

        $post['project_name'] = filter_input(INPUT_GET, 'project_name', FILTER_SANITIZE_STRING); # INPUT_POST
        if (in_array(false, $post, true)) return $BAD_REQUEST;

        // return success if folder already exists

        $result = mkdir("{$this->emplacement}/{$post['project_name']}", 0777, true);

        return $result ? $SUCCESS : $ERROR;
    }

    public function create_file() : string {
        if (!isset($_GET['project_name'], $_GET['file_name'], $_GET['file_content'])) return $BAD_REQUEST; # $_POST

        $post['project_name'] = filter_input(INPUT_GET, 'project_name', FILTER_SANITIZE_STRING); # INPUT_POST
        $post['file_name'] = filter_input(INPUT_GET, 'file_name', FILTER_SANITIZE_STRING); # INPUT_POST
        $post['file_content'] = filter_input(INPUT_GET, 'file_content', FILTER_SANITIZE_STRING); # INPUT_POST
        if (in_array(false, $post, true)) return $BAD_REQUEST;

        // return error if folder does not exist

        $result = file_put_contents("{$this->emplacement}/{$post['project_name']}/{$post['file_name']}", $post['file_content']);

        return $result !== false ? $SUCCESS : $ERROR;
    }

    public function remove_files() : string {
        if (!isset($_GET['project_name'])) return $BAD_REQUEST; # $_POST

        $post['project_name'] = filter_input(INPUT_GET, 'project_name', FILTER_SANITIZE_STRING); # INPUT_POST
        if (in_array(false, $post, true)) return $BAD_REQUEST;

        // return error if folder does not exist

        // remove all files in folder

        return $result ? $SUCCESS : $ERROR;
    }
}
