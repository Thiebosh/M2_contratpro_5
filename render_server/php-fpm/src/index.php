<?php 
session_start();
$value = "World";

?> 
<html>
  <body>
    <h1>Hello, <?= $value ?>!</h1>
    <p><?= $_GET["action"] ?></p>
  </body>
</html>