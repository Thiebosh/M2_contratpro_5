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
        return (!is_dir($path)) ? false : file_put_contents($path, $content) !== false;
    }

    public function remove_files() : string {
        if (!isset($_GET['project_name'])) return $BAD_REQUEST; # $_POST

        $post['project_name'] = filter_input(INPUT_GET, 'project_name', FILTER_SANITIZE_STRING); # INPUT_POST
        if (in_array(false, $post, true)) return $BAD_REQUEST;

        if (!is_dir($path)) return $ERROR;

        $result = unlink($path); //deleted file 

        return $result ? $SUCCESS : $ERROR;
    }

    public function remove_folder() : string {
        if (!isset($_GET['project_name'])) return $BAD_REQUEST; # $_POST

        $post['project_name'] = filter_input(INPUT_GET, 'project_name', FILTER_SANITIZE_STRING); # INPUT_POST
        if (in_array(false, $post, true)) return $BAD_REQUEST;

        if (is_dir($path)) return $SUCCESS;

        foreach(glob($dir . "/*") as $element){
            if(is_dir($element)){
                remove_folder($element); // On rappel la fonction remove_folder           
                if(!rmdir($element)) return $ERROR; // Une fois le dossier courant vidé, on le supprime
            } else { // Sinon c'est un fichier, on le supprime
                if(!unlink($element)) return $ERROR;
            }
            // On passe à l'élément suivant
        }

        return $SUCCESS ;
    }
}
