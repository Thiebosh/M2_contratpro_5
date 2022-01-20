#!/bin/bash
# verify that vsc end line sequence is LF
sudo docker build . --tag="render_serv"
sudo docker run -dp 80:80 -p 433:433 render_serv:latest