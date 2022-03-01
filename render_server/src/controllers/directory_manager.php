<?php
class DirectoryManager {
    private string $root_path;

    public function __construct($root_path){
        if (!is_dir($root_path)) mkdir($root_path, 0777, true);
        $this->root_path= $root_path;
    }

    public function create_folder($path) : bool {
        $path = "{$this->root_path}/{$path}";
        echo("\n".$path);
        return (is_dir($path)) ? true : mkdir($path, 0777, true);
    }

    public function create_file($path, $content) : bool {
        $path = "{$this->root_path}/{$path}";
        return (!is_dir(implode("/", array_slice(explode("/", $path), 0, -1)))) ? false : file_put_contents($path, $content) !== false;
    }

    public function remove_files($path) : bool {
        $path = "{$this->root_path}/{$path}";
        if (!file_exists($path)) return true;
        if (!is_dir($path)) return false;

        // scan all files in directory and delete them all, return false if pb
        //foreach($files as $file) if (!unlink("{$path}/{$file}")) return false;

        return true;
    }

    public function remove_folder($path) : bool {
        $path = "{$this->root_path}/{$path}";
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

    public function include_file($path, $filename) {
        $dir_path = "{$this->root_path}/{$path}";
        $file_path = "{$dir_path}/{$filename}";

        /*
            echo("\n".$dir_path);
            echo("\n".is_dir($dir_path)? 'true' : 'false');
            echo("\n".$file_path);
            echo("\n".file_exists($file_path)? 'true' : 'false');
        */

        if (!(is_dir($dir_path) && file_exists($file_path))) return false;

        include_once($file_path);
        return true;
    }
}
