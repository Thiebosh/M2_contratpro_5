<?php
/*header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");*/

session_start();

$RESP_CODE = array(
    "success"=>"200",
    "bad_request"=>"400",
    "not_found"=>"404",
    "error"=>"500"
);

if (isset($_GET['action'])) {
    require_once("controllers/directory_manager.php");

    $directoryManager = new DirectoryManager(__DIR__."/projects");

    switch ($action = filter_input(INPUT_GET, 'action', FILTER_SANITIZE_STRING)) {
        case 'execute':
            if (!isset($_POST['project_name'], $_POST['page'])) {
                http_response_code($RESP_CODE["bad_request"]);
                exit();
            }

            $post['project_name'] = filter_input(INPUT_POST, 'project_name', FILTER_SANITIZE_STRING);
            $post['page'] = filter_input(INPUT_POST, 'page', FILTER_SANITIZE_STRING);
            if (in_array(false, $post, true)) {
                http_response_code($RESP_CODE["bad_request"]);
                exit();
            }

            $result = $directoryManager->include_file($post['project_name'], "routeur.php", $post['page']);
            http_response_code($result ? $RESP_CODE["success"] : $RESP_CODE["error"]);
            exit();

        case 'create_folder':
            if (!isset($_POST['project_name'])) {
                http_response_code($RESP_CODE["bad_request"]);
                exit();
            }

            $post['project_name'] = filter_input(INPUT_POST, 'project_name', FILTER_SANITIZE_STRING);
            if (in_array(false, $post, true)) {
                http_response_code($RESP_CODE["bad_request"]);
                exit();
            }

            $result = $directoryManager->create_folder($post['project_name']);
            http_response_code($result ? $RESP_CODE["success"] : $RESP_CODE["error"]);
            exit();

        case 'create_file':
            if (!isset($_POST['project_name'], $_POST['file_name'], $_POST['file_content'])) {
                http_response_code($RESP_CODE["bad_request"]);
                exit();
            }

            $post['project_name'] = filter_input(INPUT_POST, 'project_name', FILTER_SANITIZE_STRING);
            $post['file_name'] = filter_input(INPUT_POST, 'file_name', FILTER_SANITIZE_STRING);
            $post['file_content'] = $_POST["file_content"];
            if (in_array(false, $post, true)) {
                http_response_code($RESP_CODE["bad_request"]);
                exit();
            }

            $result = $directoryManager->create_file("{$post['project_name']}/{$post['file_name']}", $post['file_content']);
            http_response_code($result ? $RESP_CODE["success"] : $RESP_CODE["error"]);
            exit();

        case 'remove_files':
            if (!isset($_POST['project_name'])) {
                http_response_code($RESP_CODE["bad_request"]);
                exit();
            }

            $post['project_name'] = filter_input(INPUT_POST, 'project_name', FILTER_SANITIZE_STRING);
            if (in_array(false, $post, true)) {
                http_response_code($RESP_CODE["bad_request"]);
                exit();
            }

            $result = $directoryManager->remove_files($post['project_name']);
            http_response_code($result ? $RESP_CODE["success"] : $RESP_CODE["error"]);
            exit();

        case 'remove_folder':
            if (!isset($_POST['project_name'])) {
                http_response_code($RESP_CODE["bad_request"]);
                exit();
            }

            $post['project_name'] = filter_input(INPUT_POST, 'project_name', FILTER_SANITIZE_STRING);
            if (in_array(false, $post, true)) {
                http_response_code($RESP_CODE["bad_request"]);
                exit();
            }

            $result = $directoryManager->remove_folder($post['project_name']);
            http_response_code($result ? $RESP_CODE["success"] : $RESP_CODE["error"]);
            exit();

        case 'get_session':
            echo((!isset($_SESSION["data"]) || empty($_SESSION["data"])) ? "{}" : json_encode($_SESSION["data"]));
            exit();

        case 'set_session':
            if(!isset($_POST['session'])) {
                http_response_code($RESP_CODE["bad_request"]);
                exit();
            }

            $post['session'] = $_POST['session'];
            if (in_array(false, $post, true)) {
                http_response_code($RESP_CODE["bad_request"]);
                exit();
            }

            $_SESSION["data"] = json_decode($post['session'], true);
            http_response_code($RESP_CODE["success"]);
            exit();

        case "probe":
            echo("alive");
            http_response_code($RESP_CODE["success"]);
            exit();
    }
}

http_response_code($RESP_CODE["bad_request"]);
exit();
