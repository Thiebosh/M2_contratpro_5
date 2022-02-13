<?php
session_start();

require_once("controllers/directory_manager.php")

// a mettre dans un fichier "return_codes.php" et a inclure ici et dans les controleurs
$SUCCESS = "200";
$BAD_REQUEST = "400";
$ERROR = "500";

if (isset($_GET['action'])) {
    switch ($action = filter_input(INPUT_GET, 'action', FILTER_SANITIZE_STRING)) {
        case 'generate':
            //return false if folder does not exist
            //return false if index does not exist in folder
            //require index in folder
            echo($SUCCESS);
            exit();

        case 'create_folder': //localhost:80/index.php?action=create_folder&project_name=test
            echo((new DirectoryManager)->create_folder());
            exit();

        case 'create_file': //localhost:80/index.php?action=create_file&project_name=test&file_name=exemple.html&file_content="un peu de texte"
            echo((new DirectoryManager)->create_folder());
            exit();

        case 'remove_files': //localhost:80/index.php?action=remove_files&project_name=test
            echo((new DirectoryManager)->remove_files());
            exit();

        case "probe":
            echo("alive");
            exit();

        default:
            echo($BAD_REQUEST); // error msg
            exit();
    }
}

echo($BAD_REQUEST); // error msg
exit();

// //affichage de la page
// if (file_exists('view/' . $variablePage['page'] . '.php')) {
//     require('view/' . $variablePage['page'] . '.php');
// }
// else {
//     require('view/erreur.php');
// }
