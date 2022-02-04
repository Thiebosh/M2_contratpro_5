# M2_contratpro_5

http://www.delafond.org/traducmanfr/man/man1/flex.1.html

generate requirements.txt : pipreqs ./path

# Docker
Each folder correspond to one part (server) of the project.
Each folder contains two dockerfiles (dev & prod) and one docker-compose, used for start dev configs (hot reloading code)
The docker-compose at root folder start all services in prod config (cold reloading code)

## Probes
- rest: http://localhost:8001/probe
- socket: open client and verify console logs
- render: http://localhost:8003/?action=probe


# Pipeline CI/CD
https://docs.github.com/en/actions/migrating-to-github-actions/migrating-from-gitlab-cicd-to-github-actions
