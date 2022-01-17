#!/bin/bash
# verify that vsc end line sequence is LF
sudo docker build . --tag="ws_serv"
# sudo docker run -dp 8010:5001 --env-file=.env --env-file=../.env ws_serv:latest

# tmp : lie a la console et lance le serveur
sudo docker run -p 8001:5001 --env-file=.env --env-file=../.env -ti ws_serv:latest /bin/sh
# python .