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
- { "id": "str" } : l'utilisateur existe et les empreintes de mots de passes correspondent ; l'identifiant du compte est ajouté au message de retour.


# /account/update
**Utilisation :** mettre à jour les informations d'un compte.

**Arguments requis :**
- "id" (str) : l'identifiant du compte à modifier.

**Arguments optionnels : un des deux**
- "name" (str) : le nouveau nom que l'utilisateur souhaite associer au compte.
- "password" (str) : le nouveau mot de passe (en clair) que l'utilisateur souhaite associer au compte.

**Retours :**
- { "success": "already exist" } : le nom de compte est déjà utilisé.
- { "success": False } : l'intégration en base de données a échoué.
- { "success": True } : l'intégration en base de données a réussi.


# /account/search
**Utilisation :** chercher des utilisateurs.

**Arguments requis :**
- "name" (str) : une partie du nom de l'utilisateur recherché.

**Retours :**
- { "result": [{"id": "str", "name": "str"}, ...] } : la liste des utilisateurs dont le nom contient le motif recherché et l'identifiant de compte associé.


# /account/delete
**Utilisation :** supprimer un compte utilisateur.

**Arguments requis :**
- "id" (str) : l'identifiant du compte à supprimer.

**Retours :**
- { "success": True/False, "deleted_projects": n, "deleted_from_projects": m } :
    - deleted_user : la suppression en base de données a réussi ou non.
    - deleted_projects : le nombre de projets supprimés car ne comptant que cet utilisateur.
    - deleted_from_projects : le nombre de projets mis à jour car comptant aussi d'autres utilisateur.



## /project
# /project/create
**Utilisation :** créer un projet.

**Arguments requis :**
- "name" (str) : le nom du projet, unique.
- "users_id" (list[str]) : la liste des identifiants de compte ayant accès à ce projet.

**Retours :**
- { "success": "already exist" } : le nom de projet est déjà utilisé.
- { "success": False } : le nom de projet est disponible mais l'intégration en base de données a échoué.
- { "success": True } : le nom de projet est disponible et l'intégration en base de données a réussi.


# /project/update
**Utilisation :** mettre à jour les informations d'un projet.

**Arguments requis :**
- "id" (str) : l'identifiant du compte à modifier.
- "name" (str) : le nouveau nom que l'utilisateur souhaite associer au projet.

**Retours :**
- { "success": "already exist" } : le nom de projet est déjà utilisé.
- { "success": False } : l'intégration en base de données a échoué.
- { "success": True } : l'intégration en base de données a réussi.


# /project/search
**Utilisation :** chercher des projets.

**Arguments requis :**
- "id" (str) : l'identifiant du projet recherché.

**Retours :**
- { "result": [{"name": "str", "users": [{"id": "str", "name": "str"}, ...]}, ...] } : le nom du projet et les utilisateurs associés.


# /project/search_by_user
**Utilisation :** lister les projets accessibles pour un compte.

**Arguments requis :**
- "user_id" (str) : l'identifiant du compte voulant consulter ses projets.

**Retours :**
- { "result": [{"id": "str", "name": "str", "users": [{"id": "str", "name": "str"}, ...], "creation": "date", "last_specs": "date", "last_proto": "date" }, ...] } :
    - id : l'identifiant du projet.
    - name : le nom du projet.
    - users : la liste des couples noms - identifiants de comptes associés au projet.
    - creation : la date de création du projet.
    - last_specs : la date de dernière modification des spécifications du projet.
    - last_proto : la date de dernière génération des fichiers du projet.


# /project/add_user
**Utilisation :** donner l'accès au projet pour un compte.

**Arguments requis :**
- "id" (str) : l'identifiant du projet à modifier.
- "user_id" (str) : l'identifiant du compte à ajouter au projet.

**Retours :**
- { "success": False } : la modification en base de données a échoué.
- { "success": True } : la modification en base de données a réussi.


# /project/remove_user
**Utilisation :** retirer l'accès au projet pour un compte.

**Arguments requis :**
- "id" (str) : l'identifiant du projet à modifier.
- "user_id" (str) : l'identifiant du compte à retirer du projet.

**Retours :**
- { "success": False } : la modification en base de données a échoué.
- { "success": True } : la modification en base de données a réussi.



# /project/delete
**Utilisation :** supprimer un projet.

**Arguments requis :**
- "id" (str) : l'identifiant du projet à supprimer.

**Retours :**
- { "success": False } : la suppression en base de données a échoué.
- { "success": True } : la suppression en base de données a réussi.
