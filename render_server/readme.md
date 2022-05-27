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
- 500 : L'url existe, a reçu les bons arguments mais a rencontré une erreur interne durant son opération => relever la
  démarche qui a mené à cette erreur (en attendant un fichier de logs auto).

# Groupes d'urls

**Action**

# execute

**Arguments**

- project_name
- page

**Retours**

# create_folder

**Arguments**

- "name" : nom du fichier.
- "parent_id"

**Retours**

# create_file

**Arguments**

- "name" : nom du fichier
- "content" : contenu du fichier
- "parent_id"

**Retours**

# remove_files

**Arguments**

**Retours**

# download_files_from_folder

**Arguments**

- "name" : nom du fichier à télécharger.

**Retours**

- "name": file["name"]
- "content": file["id"]

# upload_files_to_folder

**Arguments**

- "name" : nom du fichier à télécharger.
- "file" : fichier à upload.

**Retours**

- file["name"]
- file["content"]
- folder_id)

# _create_folder

**Arguments**

- "name" : nom du dossier à créer.
- "parent_id" : identifiant du dossier parent.

**Retours**

- results["id"]

# _get_parent_id

**Arguments**

- "id" : identifiant du dossier

**Retours**

- "parend_id" : identifiant du dossier parent

# _get_folder_id

**Arguments**

- "name" : nom du dossier.

**Retours**

- items["id"]

# _get_files_ids

**Arguments**

- "parent_id" : identifiant du dossier

**Retours**

- items []

# _get_file_content

**Arguments**

**Retours**

# _create_file

**Arguments**

**Retours**

# _reset_folder

**Arguments**

**Retours**
