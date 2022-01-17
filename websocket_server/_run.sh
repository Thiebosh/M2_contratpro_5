sudo docker build . --tag="ws_serv"
sudo docker run -dp 8010:5001 --env-file=.env --env-file=../.env ws_serv:latest
