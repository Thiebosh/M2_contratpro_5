# M2_contratpro_5

todo : refaire le readme en présentant le projet et les participants, puis l'exécution avec le compose et les dockers (prod et dev), puis la découpe en services avec les technos associés à chaque


# Docker
Each folder correspond to one part (server) of the project.
Each folder contains two dockerfiles (dev & prod) and one docker-compose, used for start dev configs (hot reloading code)
The docker-compose at root folder start all services in prod config (cold reloading code)

## Probes
- rest: http://localhost:8001/probe
- socket: open client and verify console logs
- render: http://localhost:8003/?action=probe
