# SpecTry

## Local development

```shell
npm install
npm run dev
```

## Deployment

```shell
npm install
npm run start
```

Serve static files from build/ folder

# TODO
## Appels à l'api à regrouper dans un dossier partners/rest
- pages/projects/index.js
- pages/projects/[projectId]/settings.js
- pages/dashboard/index.js
- pages/auth/create.js
- pages/account/index.js

# appels axios à regrouper dans un dossier partner/cible (voir d'abord ternaire plus bas)

## Implémentation de l'objet websocket + ajout de la surcouche graphe
- pages/projects/[projectId]/index.js

## appels fetchs => peuvent être remplacés par appels axios

## appels mongo => session only ? ok : remplacer par appels à l'api
