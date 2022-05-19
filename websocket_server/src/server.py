import logging
import select
import socket
import json
import os
from socket import timeout
from room_manager import RoomManager
from defines import *

from partners.websocket_partner import WebSocketPartner
from partners.mongo_partner import MongoPartner
from partners.drive_partner import DrivePartner
from partners.cpp_partner import CppPartner
from partners.php_partner import PhpPartner
from partners.logger_partner import LoggerPartner

class Server():
    def __init__(self, websocket=None, db=None, nas=None, generator=None, renderer=None, logger=None) -> None:
        # 1) INITIALIZE LOGGER
        logger_level = logging.INFO

        logging.getLogger("googleapiclient").disabled = True
        logging.basicConfig(level=logger_level, format='[%(asctime)s] %(levelname)s for %(funcName)s in %(module)s: %(message)s')

        logger = logger or logging.getLogger("None")
        logger_partner = LoggerPartner(logger)

        logger_partner.app_logger.info(INIT_SERVER)

        # 2) INITIALIZE PARTNERS
        logger_partner.app_logger.info(INIT_PARTNERS)

        self.partners = {
            WEBSOCKET: websocket or WebSocketPartner(),
            DB: db or MongoPartner(f"mongodb+srv://{OS_MONGO_USERNAME}:{OS_MONGO_PASSWORD}@{OS_MONGO_URL}"),
            NAS: nas or DrivePartner(creds_path=os.environ.get('DRIVE_PATH'), scopes=['https://www.googleapis.com/auth/drive']),
            GENERATOR: generator or CppPartner(folder_path=os.environ.get('CPP_PATH')),
            RENDERER: renderer or PhpPartner(base_url=os.environ.get('PHP_URL')),
            LOGGER:  logger_partner
        }
        self.inputs = []
        self.polling_freq = 0.5
        self.room_m = RoomManager(self.partners)
        self.ip = OS_HOST
        self.port = OS_PORT
        self.encoding = ENCODING
        self.init_server()

        logger_partner.app_logger.info(INIT_DONE)

    def init_server(self, backlog=5):
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setblocking(False)

        self.socket.bind((self.ip, self.port))
        self.socket.listen(backlog)

    def read(self):
        readable, _, exception = select.select(self.inputs, [], self.inputs, self.polling_freq)
        return readable, exception

    def close(self):
        self.partners[LOGGER].app_logger.info("SERVER - Get close signal")
        for input_socket in self.inputs:
            input_socket.close()
        for room in self.room_m.rooms.values():
            room.close_evt.set()

    def add_connection(self, input_socket):
        new_socket, client_address = input_socket.accept()
        try:
            if self.partners[WEBSOCKET].handshake(new_socket, self.encoding):
                self.partners[LOGGER].app_logger.info(f"SERVER - new connexion {client_address}")
                self.inputs.append(new_socket)  # new input socket
            else:
                self.partners[LOGGER].app_logger.info("SERVER - failed handshake")

        except timeout:
            self.partners[LOGGER].app_logger.info('SERVER - websocket connection timeout')

    def close_client_connection(self, socket):
        self.partners[LOGGER].app_logger.info("SERVER - Close client")
        self.inputs.remove(socket)
        socket.close()

    def run(self):
        self.inputs.append(self.socket) # Contient tous les sockets (serveur + toutes les rooms)

        self.partners[LOGGER].app_logger.info("SERVER - ready")

        while self.inputs:
            try:
                readable, exception = self.read()
            except KeyboardInterrupt:
                self.close()
                break

            # handle inputs
            for input_socket in readable:
                if input_socket is self.socket: # S'il y a une connexion, c'est le serveur qui va envoyer un message d'où le check
                    self.add_connection(input_socket)
                    continue

                target = self.partners[WEBSOCKET].recv(input_socket, self.encoding)

                if not target:
                    self.close_client_connection(input_socket)
                    continue

                try:
                    target = json.loads(target)
                except json.JSONDecodeError:
                    self.partners[LOGGER].app_logger.info(f"SERVER - malformed json : '{target}'")
                    self.close_client_connection(input_socket)
                    continue

                if "action" in target and target["action"] == "connectRoom" \
                    and "type" in target and target["type"] in ["specs", "proto"] \
                    and "author" in target:

                    if not f"{target['roomId']}-{target['type']}" in self.room_m.rooms:
                        self.room_m.create_room(target['roomId'], target['type'], input_socket, target["author"], self.callback_update_server_sockets, self.encoding)

                    else:
                        self.room_m.add_client_to_room(target['roomId'], target['type'], input_socket, target["author"])

                self.inputs.remove(input_socket)

            # handle except
            for input_socket in exception:
                self.inputs.remove(input_socket)
                input_socket.close()

            self.room_m.rooms = {key: values for key, values in self.room_m.rooms.items() if not values.get_param()["close_evt"].is_set()}

            # can't sleep because of handshakes

        self.partners[LOGGER].app_logger.info("SERVER - Closing server...")


    def callback_update_server_sockets(self,socket):
        self.inputs.append(socket)
