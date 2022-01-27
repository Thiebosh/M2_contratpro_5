<?php
session_start();

//reçoit une action à exécuter ou une page à charger
//filtrage variables
if (isset($_GET['action'])) {
    switch ($variablePage['action'] = filter_input(INPUT_GET, 'action', FILTER_SANITIZE_STRING)) {
        // case 'connexion'://connexion plus fréquente qu'inscription
        //     if (isset($_POST['email'], $_POST['pass'])) {
        //         $variablePage['postConnexion']['email'] = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
        //         $variablePage['postConnexion']['pass'] = filter_input(INPUT_POST, 'pass', FILTER_SANITIZE_STRING);
        //         // $variablePage['postInscription']['civil'] = filter_input(INPUT_POST, 'civil', FILTER_CALLBACK,
        //         //     ['options' => function($civil) { switch($civil) { case 'M': return 0; case 'Mme': return 1; default: return false; } }]);

        //         if (in_array(false, $variablePage['postConnexion'], true)) {
        //             unset($variablePage['postConnexion']);
        //             $variablePage['errMsgs'][] = $errMsg['filtrage']['general'];
        //         }
        //     }
        // break;
        case 'create_folder': //localhost:80/index.php?action=create_folder || localhost?action?create_folder
            if (isset($_GET['project_name'])) { # $_POST
                $variablePage['postCreateFolder']['name'] = filter_input(INPUT_GET, 'project_name', FILTER_SANITIZE_STRING); # INPUt_POST
                // $variablePage['postInscription']['civil'] = filter_input(INPUT_POST, 'civil', FILTER_CALLBACK,
                //     ['options' => function($civil) { switch($civil) { case 'M': return 0; case 'Mme': return 1; default: return false; } }]);

                if (in_array(false, $variablePage['postCreateFolder'], true)) {
                    echo("400"); // error msg
                    exit();
                }

                require_once("controllers/create_folder.php");

                //appelle fonction / instancie objet de create folder OU lui fait faire l'action

                echo("200"); // error msg
                exit();
            }
        break;

        case "probe":
            echo("alive");
            exit();

        default:
            echo("400"); // error msg
            exit();
    }
}

echo("400"); // error msg
exit();

// //affichage de la page
// if (file_exists('view/' . $variablePage['page'] . '.php')) {
//     require('view/' . $variablePage['page'] . '.php');
// }
// else {
//     require('view/erreur.php');
// }
