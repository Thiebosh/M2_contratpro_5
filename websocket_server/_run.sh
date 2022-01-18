#!/bin/bash
# verify that vsc end line sequence is LF
sudo docker build . --tag="ws_serv"
sudo docker run -dp 8001:5001 --env-file=.env --env-file=../.env ws_serv:latest
