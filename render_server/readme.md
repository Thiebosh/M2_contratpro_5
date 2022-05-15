# Exécution du service
```
php -S 0.0.0.0:5000 /app/index.php
```



# Connexion au service
Le serveur est consultable à l'url suivante : http://localhost:5000.



# Codes de retours
- 404 : L'url n'est pas déclarée dans l'api.
- 400 : L'url existe mais n'a pas reçu le bon nombre / les bons noms / les bons types d'arguments.
- 200 : L'url existe, a reçu les bons arguments et a effectué correctement son opération.
- 500 : L'url existe, a reçu les bons arguments mais a rencontré une erreur interne durant son opération => relever la démarche qui a mené à cette erreur (en attendant un fichier de logs auto).



# Groupes d'urls
TODO
