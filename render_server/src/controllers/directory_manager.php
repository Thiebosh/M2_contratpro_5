<?php
class DirectoryManager {
    private string $root_path;

    public function __construct($root_path){
        if (!is_dir($root_path)) mkdir($root_path, 0777, true);
        $this->root_path= $root_path;
    }

    public function create_folder($path) : bool {
        $path = "{$this->root_path}/{$path}";
        return (is_dir($path)) ? true : mkdir($path, 0777, true);
    }

    public function create_file($path, $content) : bool {
        $path = "{$this->root_path}/{$path}";
        if (!is_dir(implode("/", array_slice(explode("/", $path), 0, -1))) || file_exists($path)) return false;
        return file_put_contents($path, $content) !== false;
    }

    public function remove_files($path) : bool {
        $path = "{$this->root_path}/{$path}";
        if (!file_exists($path)) return true;
        if (!is_dir($path)) return false;

        foreach(glob($path . "/*") as $element){
            if(!unlink($element)) return false;
        }

        return true;
    }

    public function remove_folder($path) : bool {
        $path = "{$this->root_path}/{$path}";
        if (!file_exists($path)) return true;
        if (!is_dir($path)) return false;

        return rmdir($path);
    }

    public function include_file($path, $filename) {
        $dir_path = "{$this->root_path}/{$path}";
        $file_path = "{$dir_path}/{$filename}";

        if (!(is_dir($dir_path) && file_exists($file_path))) return false;

        include_once($file_path);
        return true;
    }
}
