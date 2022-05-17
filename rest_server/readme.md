# Exécution du service

```
SET PORT=8001

SET MONGO_URL=***
SET MONGO_USERNAME=***
SET MONGO_PASSWORD=***

python src
```

# Connexion au service

Le serveur est consultable à l'url suivante : http://localhost:8001.

# Codes de retours

- 404 : L'url n'est pas déclarée dans l'api.
- 400 : L'url existe mais n'a pas reçu le bon nombre / les bons noms / les bons types d'arguments.
- 200 : L'url existe, a reçu les bons arguments et a effectué correctement son opération.
- 500 : L'url existe, a reçu les bons arguments mais a rencontré une erreur interne durant son opération => relever la
  démarche qui a mené à cette erreur (en attendant un fichier de logs auto).

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
- { "id": ["id" (str)] } : l'utilisateur existe et les empreintes de mots de passes correspondent ; l'identifiant du
  compte est ajouté au message de retour.

# /account/get

**Utilisation :** récupérer le compte de l'utilisateur.

**Arguments requis :**

- "id" (str) : identifiant du compte à récupérer.

**Retours :**

- { success : "no account found" }
- { success : "name": result["name"],"nbProjects": count }

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

- "name" (str) : nom de l'utilisateur recherché.
- "limit" (int)
- "excluded_users" (str)

**Retours :**

- { "result": [{"excluded_users": "str", "name": "str", "limit" : "str" } : la liste des utilisateurs dont le nom
  contient le motif recherché et l'identifiant de compte associé.

# /account/delete

**Utilisation :** supprimer un compte utilisateur.

**Arguments requis :**

- "id" (str) : l'identifiant du compte à supprimer.

**Retours :**

- { "success": True/False, "deleted_projects": n, "deleted_from_projects": m } :
    - deleted_projects : le nombre de projets supprimés car ne comptant que cet utilisateur.
    - deleted_from_projects (int): le nombre de projets mis à jour car comptant aussi d'autres utilisateur.

# Project

# /project/create

**Utilisation :** créer un projet.

**Arguments requis :**

- "name" (str): le nom du projet, unique.
- "users_id" (str): la liste des identifiants de compte ayant accès à ce projet.
- "syntax_id" (str): syntaxe du projet
- "description": possibilité d'ajouter une description lors de la création

**Retours :**

- { "success": "already exist" } : le nom de projet est déjà utilisé.
- { "success": False } : le nom de projet est disponible mais l'intégration en base de données a échoué.
- { "success": True } : le nom de projet est disponible et l'intégration en base de données a réussi.

# /project/get

**Utilisation :** récupérer un projet.

**Arguments requis :**

- "id" : identifiant du projet.

**Retours :**

- { "result": {"name": "str", "users": [{"id": "str", "name": "str"}], "syntax_name" : "str",
  "creation": "str", "last_specs" : "str/null", "lastest_proto" : "boolean", "description" : "str"}

    - name : le nom du projet.
    - users : la liste des couples noms - identifiants de comptes associés au projet.
    - syntax_name : type de syntaxe à utiliser
    - creation : la date de création du projet.
    - last_specs : la date de dernière modification des spécifications du projet.
    - last_proto : la date de dernière génération des fichiers du projet.

# /project/get_syntax_id

**Utilisation :** récupérer la syntaxe d'un projet.

**Arguments requis :**

- "project_id" : identifiant du projet.

**Retours :**

- "id": result["syntax_id"] : identifiant des syntaxes à utiliser

# /project/update

**Utilisation :** mettre à jour les informations d'un projet.

**Arguments requis :**

- "id" (str) : l'identifiant du projet à modifier.
- "name" (str) : le nouveau nom que l'utilisateur souhaite associer au projet.
- "addCollabIds" (str) : ajouter des noubeaux utilisateurs au projet.
- "removeCollabIds" (str) : supprimer des utilisateurs du projet.
- "description" (str) : nouvelle description du projet.
- "deleteDescription" (boolean) : supprimer la description.

**Retours :**

- { "success": "already exist" } : élément déjà existant dans la bdd.
- { "success": False } : l'intégration en base de données a échoué.
- { "success": True } : l'intégration en base de données a réussi.

# /project/exist_for_user

**Utilisation :** vérifier qu'un id projet existe et qu'un id utilisateur y est lié.

**Arguments requis :**

- "user_id" (str) : l'identifiant du compte à vérifier.
- "project_name" (str) : l'identifiant du projet à vérifier.

**Retours :**

- { "project_id":  result["id"] } : le projet existe et l'utilisateur y est associé : il reçoit l'id du projet.

# /project/get_proto_pages

**Utilisation :** récupérer les informations d'un projet.

**Arguments requis :**

- "project_id" (str): identifiant du projet.

**Retours :**

- { pages: {["name" : "string","link" : "string"}]

# /project/search_for_user

**Utilisation :** lister les projets accessibles pour un compte.

**Arguments requis :**

- "user_id" (str) : l'identifiant du compte voulant consulter ses projets.

**Retours :**

- { "result": [{"id": "str", "name": "str", "users": [{"id": "str", "name": "str"}, ...], "syntax_name" : "str",
  "creation": "str", "last_specs" : "str", lastest_proto" : "boolean"

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

- { "success": mongo_result (bool), drive_result (bool)} : la suppression en base de données a échoué/ réussi.

# Syntax

# /syntax/get

**Utilisation :** Obtenir la syntaxe d'un projet.

**Arguments requis :**

- "syntax" (str) : type de syntaxe à utiliser.

**Retours :**

- "result": result[{ collection, filter_q, fileds}]

