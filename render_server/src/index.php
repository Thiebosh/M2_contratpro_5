<?php
session_start();

require_once("controllers/directory_manager.php");

$SUCCESS = "200";
$BAD_REQUEST = "400";
$ERROR = "500";

$directoryManager = new DirectoryManager(__DIR__."/projects");
if (isset($_GET['action'])) {
    switch ($action = filter_input(INPUT_GET, 'action', FILTER_SANITIZE_STRING)) {
        case 'generate':
            if (!isset($_POST['project_name'], $_POST['page'])) {
                http_response_code($BAD_REQUEST);
                exit();
            }

            $post['project_name'] = filter_input(INPUT_POST, 'project_name', FILTER_SANITIZE_STRING);
            $post['page'] = filter_input(INPUT_POST, 'page', FILTER_SANITIZE_STRING);
            if (in_array(false, $post, true)) {
                http_response_code($BAD_REQUEST);
                exit();
            }

            $result = $directoryManager->include_file($post['project_name'], "routeur.php");
            http_response_code($result ? $SUCCESS : $ERROR);
            exit();

        case 'create_folder':
            if (!isset($_POST['project_name'])) {
                http_response_code($BAD_REQUEST);
                exit();
            }

            $post['project_name'] = filter_input(INPUT_POST, 'project_name', FILTER_SANITIZE_STRING);
            if (in_array(false, $post, true)) {
                http_response_code($BAD_REQUEST);
                exit();
            }

            $result = $directoryManager->create_folder($post['project_name']);
            http_response_code($result ? $SUCCESS : $ERROR);
            exit();

        case 'create_file':
            if (!isset($_POST['project_name'], $_POST['file_name'], $_POST['file_content'])) {
                http_response_code($BAD_REQUEST);
                exit();
            }

            $post['project_name'] = filter_input(INPUT_POST, 'project_name', FILTER_SANITIZE_STRING);
            $post['file_name'] = filter_input(INPUT_POST, 'file_name', FILTER_SANITIZE_STRING);
            $post['file_content'] = $_POST["file_content"];
            if (in_array(false, $post, true)) {
                http_response_code($BAD_REQUEST);
                exit();
            }

            $result = $directoryManager->create_file("{$post['project_name']}/{$post['file_name']}", $post['file_content']);
            http_response_code($result ? $SUCCESS : $ERROR);
            exit();

        case 'remove_files':
            if (!isset($_POST['project_name'])) {
                http_response_code($BAD_REQUEST);
                exit();
            }

            $post['project_name'] = filter_input(INPUT_POST, 'project_name', FILTER_SANITIZE_STRING);
            if (in_array(false, $post, true)) {
                http_response_code($BAD_REQUEST);
                exit();
            }

            $result = $directoryManager->remove_files($post['project_name']);
            http_response_code($result ? $SUCCESS : $ERROR);
            exit();

        case 'remove_folder':
            if (!isset($_POST['project_name'])) {
                http_response_code($BAD_REQUEST);
                exit();
            }

            $post['project_name'] = filter_input(INPUT_POST, 'project_name', FILTER_SANITIZE_STRING);
            if (in_array(false, $post, true)) {
                http_response_code($BAD_REQUEST);
                exit();
            }

            $result = $directoryManager->remove_folder($post['project_name']);
            http_response_code($result ? $SUCCESS : $ERROR);
            exit();

        case "probe":
            echo("alive");
            http_response_code($SUCCESS);
            exit();
    }
}

http_response_code($BAD_REQUEST);
exit();
