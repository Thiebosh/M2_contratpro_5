<?php
$emplacement = "root";
if (isset($_GET['action']) && isset($_GET['object'])) {

    switch (strtolower($_GET['action'])) {

        case "creer":

            switch (strtolower($_GET['object'])) {

                case "dossier" :
                    if (!mkdir(strtolower($_GET['emplacement']), 0777, true)) {
                        die('Échec lors de la création des dossiers...');
                    }
                    echo "creation effectuer";
                    break;

                case "fichier" :
                    if (!fopen(strtolower($emplacement) . 'index' . '.php', 'w+')) {
                        die('Échec lors de la création du fichier...');
                    }

                    echo "creation effectuer";
                    break;

            }
            break;

    }
} else {
    echo "votre url est non valable Certains paramètres y sont absents. ";
}