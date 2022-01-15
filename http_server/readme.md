# Exécution de l'api
- Sous windows : start _start.bat
- Sous unix : wip

# Connexion à l'api
L'adresse ip et le port utilisés par le serveur sont spécifiés dans le fichier _start.bat.

# Codes de retours
- 404 : L'url n'est pas déclarée dans l'api.
- 400 : L'url existe mais n'a pas reçu le bon nombre / les bons noms / les bons types d'arguments.
- 200 : L'url existe, a reçu les bons arguments et a effectué correctement son opération.
- 500 : L'url existe, a reçu les bons arguments mais a rencontré une erreur interne durant son opération => relever la démarche qui a mené à cette erreur (en attendant un fichier de logs auto).

# Groupes d'urls
Toutes les urls avec le code de retour 200 retournent des données au format json.

## /account
# /account/create
**Utilisation :** créer un compte utilisateur.

**Arguments requis :**
- "name" (str) : le nom du compte, unique et publique, utilisé pour la connexion et la recherche d'utilisateur.
- "password" (str) : le mot de passe, en clair, utilisé pour la connexion.

**Retours :**
- { "success": "already exist" } : le nom de compte est déjà utilisé.
- { "success": False } : le nom de compte est disponible mais l'intégration en base de données a échoué.
- { "success": True } : le nom de compte est disponible et l'intégration en base de données a réussi.


# /account/connect
**Utilisation :** connecter un utilisateur à un compte.

**Arguments requis :**
- "name" (str) : le nom du compte auquel l'utilisateur veut se connecter.
- "password" (str) : le mot de passe, en clair, associé au nom de compte.

**Retours :**
- { "id": False } : l'utilisateur n'existe pas ou les empreintes de mots de passes ne correspondent pas.
- { "id": "..." } : l'utilisateur existe et les empreintes de mots de passes correspondent ; l'identifiant du compte est ajouté au message de retour.


# /account/update
**Utilisation :** mettre à jour les informations d'un compte.

**Arguments requis :**
- "id" (str) : l'identifiant du compte à modifier.

**Arguments optionnels : un des deux**
- "name" (str) : le nom (actuel ou nouveau) que l'utilisateur souhaite associer au compte.
- "password" (str) : le mot de passe en clair (actuel ou nouveau) que l'utilisateur souhaite associer au compte.

**Retours :**
- { "success": "already exist" } : le nom de compte est déjà utilisé.
- { "success": False } : l'intégration en base de données a échoué.
- { "success": True } : l'intégration en base de données a réussi.


# /account/search
**Utilisation :** chercher des utilisateurs.

**Arguments requis :**
- "name" (str) : une partie du nom de l'utilisateur recherché.

**Retours :**
- { "result": [{"id": "...", "name"}, ...] } : la liste des utilisateurs dont le nom contient le motif recherché et l'identifiant de compte associé.


# /account/delete
**Utilisation :** supprimer un compte utilisateur.

**Arguments requis :**
- "id" (str) : l'identifiant du compte à supprimer.

**Retours :**
- { "deleted_user": True/False, "deleted_projects": n, "deleted_from_projects": m } :
    - deleted_user : la suppression en base de données a réussi ou non.
    - deleted_projects : le nombre de projets supprimés car ne comptant que cet utilisateur.
    - deleted_from_projects : le nombre de projets mis à jour car comptant aussi d'autres utilisateur.

## /project

