#!/bin/bash
# verify that vsc end line sequence is LF
sudo docker build . --tag="http_serv"
sudo docker run -dp 8000:5000 --env-file=.env --env-file=../.env http_serv:latest
