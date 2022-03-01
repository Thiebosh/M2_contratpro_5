<?php
class DirectoryManager {
    private static string $emplacement;

    public function __construct($emplacement){
        if (!is_dir($emplacement)) mkdir($emplacement, 0777, true);
        $this->$emplacement= $emplacement;
    }

    public function create_folder($path) : bool {
        $path = "{DirectoryManager::emplacement}/{$path}";
        return (is_dir($path)) ? true : mkdir($path, 0777, true);
    }

    public function create_file($path, $content) : bool {
        $path = "{DirectoryManager::emplacement}/{$path}";
        echo($path);
        echo(implode("/", array_slice(explode("/", $path), 0, -1)));
        echo(is_dir(implode("/", array_slice(explode("/", $path), 0, -1))));
        if (!is_dir(implode("/", array_slice(explode("/", $path), 0, -1)))) return false
        return (!is_dir(implode("/", array_slice(explode("/", $path), 0, -1)))) ? false : file_put_contents($path, $content) !== false;
    }

    public function remove_files($path) : bool {
        $path = "{DirectoryManager::emplacement}/{$path}";
        if (!file_exists($path)) return true;
        if (!is_dir($path)) return false;

        // scan all files in directory and delete them all, return false if pb
        //foreach($files as $file) if (!unlink("{$path}/{$file}")) return false;

        return true;
    }

    public function remove_folder($path) : bool {
        $path = "{DirectoryManager::emplacement}/{$path}";
        if (!file_exists($path)) return true;
        if (!is_dir($path)) return false;

        // return false if folder contains content

        // deplacer ce bloc au dessus ?
        /*foreach(glob($dir . "/*") as $element){
            if(is_dir($element)){
                remove_folder($element); // On rappel la fonction remove_folder           
                if(!rmdir($element)) return $ERROR; // Une fois le dossier courant vidé, on le supprime
            } else { // Sinon c'est un fichier, on le supprime
                if(!unlink($element)) return $ERROR;
            }
            // On passe à l'élément suivant
        }*/

        return rmdir($element);
    }
}
