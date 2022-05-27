Repo initial : https://github.com/Thiebosh/M2_contratpro_5

# M2_contratpro_5

Ce projet a été conceptualisé puis réalisé de septembre 2021 à mai 2022 dans le cadre de la 5e année d'école d'ingénieurs informatique ISEN LILLE par Thibaut Juzeau, Antoine Asset, Etienne Schelfout, Benjamin Grosbety, Youssef Houra et Delano Koyouo.

<hr>

Il consiste en une application collaborative qui permet de rédiger des spécifications sous forme de mindmap arborescente, afin de générer rapidement des prototypes opérationnels. Les spécifications sont guidées par une syntaxe prédéfinie et la génération est rendue possible par un compilateur associé à cette syntaxe. Ainsi, les utilisateurs peuvent développer leur propre syntaxe et compilateur afin de pouvoir générer en no code tout type d'application.

## Exécution

Pour exécuter l'application sur un serveur, il suffit d'ajouter les variables d'environnement et les fichiers de crédentials (voir plus bas), puis d'exécuter docker-compose.

Les variables d'environnement sont stockés dans un fichier '.env' stocké à la racine de l'application. Elles prennent la forme suivante :
```
MONGO_URL=***
MONGO_USERNAME=***
MONGO_PASSWORD=***
```

Le fichier de credentials sont stockés dans un fichier 'service_account.json', stocké dans les dossier 'credentials' à la racine des dossiers 'rest_server' et 'websocket_server'. Il est à récupérer sur un compte google, en tant que compte de service, de façon à accéder à son Drive sans connexion explicite.

# Docker
Each folder correspond to one part (server) of the project.
Each folder contains two dockerfiles (dev & prod) and one docker-compose, used for start dev configs (hot reloading code)
The docker-compose at root folder start all services in prod config (cold reloading code)
