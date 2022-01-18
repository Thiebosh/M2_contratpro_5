#!/bin/bash
# verify that vsc end line sequence is LF
sudo docker build . --tag="render_serv"
sudo docker run -dp 8000:80 --env-file=.env render_serv:latest
