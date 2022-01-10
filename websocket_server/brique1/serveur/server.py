import select
import socket
import queue
import threading


def init_server(ip = "localhost", port=20002, backlog=5):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setblocking(False)

    server.bind((ip, port))
    server.listen(backlog)

    return server


def run_server(server: socket.socket, polling_freq=0.5, buff_size=1024, encoding="utf-8"):    
    inputs = [server]
    rooms = {}

    while inputs:
        try:
            readable, _, exception = select.select(inputs, [], inputs, polling_freq)

        except KeyboardInterrupt:
            print("get close signal")
            for socket in inputs:
                socket.close()
            for room in rooms.values():
                room["close_evt"].set()
            break

        # handle inputs
        for socket in readable:
            if socket is server:
                new_socket, client_address = socket.accept()
                print(f"SERVER - new connexion {client_address}")
                new_socket.setblocking(False)  # as for server
                inputs.append(new_socket)  # new input socket

                # new_socket.send("which project ?".encode(encoding)) # tmp, dégagera quand protocole uniformisé

                continue

            b_msg = socket.recv(buff_size)

            if not b_msg:
                print(f"close client")
                inputs.remove(socket)
                socket.close()

                continue

            target = b_msg.decode(encoding)

            if not target in rooms:
                rooms[target] = {
                    "close_evt": threading.Event(), # bidirectionnal flag
                    "add_queue": queue.Queue(),
                    "add_lock": threading.Lock()
                }

                args = (target, socket, *rooms[target].values())
                worker = threading.Thread(target=room_server, args=args)
                worker.setDaemon(True)
                worker.start()

            else:
                with rooms[target]["add_lock"]:
                    rooms[target]["add_queue"].put(socket)

            inputs.remove(socket)

        # handle except
        for socket in exception:
            inputs.remove(socket)
            socket.close()

        rooms = {key: values for key, values in rooms.items() if not values["close_evt"].is_set()}


def room_server(name: str, socket_init: socket.socket, close_evt: threading.Event,
                    add_queue: queue.Queue, add_lock: threading.Lock,
                    polling_freq=0.1, buff_size=1024, encoding="utf-8"):
    print(f"{name} - create room")
    inputs = [socket_init]
    outputs = []
    client_msg_queue = {socket_init: queue.Queue()}

    history = [] # tmp pour test envoi global

    while not close_evt.is_set() and inputs:
        # add sockets
        with add_lock:
            while not add_queue.empty():
                socket = add_queue.get()
                inputs.append(socket)
                client_msg_queue[socket] = queue.Queue()
                print(f"{name} - get client {socket.getpeername()}")

                # programme un envoi global
                client_msg_queue[socket].put("\n".join(history).encode(encoding))
                outputs.append(socket)

        # update sockets
        try:
            readable, writable, exception = select.select(inputs, outputs, inputs, polling_freq)

        except KeyboardInterrupt:
            print(f"{name} - get close signal")
            for socket in inputs:
                socket.close()
            break

        # handle inputs
        for socket in readable:
            b_msg = socket.recv(buff_size)

            if not b_msg:
                print(f"{name} - close client")
                if socket in outputs:
                    outputs.remove(socket)
                inputs.remove(socket)
                socket.close()
                del client_msg_queue[socket]

                continue

            # tmp : send to every other clients
            history.append(b_msg.decode(encoding))
            for client in client_msg_queue:
                if client != socket:
                    client_msg_queue[client].put(b_msg)  # enqueue msg
                    if client not in outputs:
                        outputs.append(client)  # let select send it

            # todo : recieve json with command and args to execute

        # handle output
        for socket in writable:
            try:
                next_msg = client_msg_queue[socket].get_nowait()  # unqueue msg
            except queue.Empty:
                outputs.remove(socket)
            else:
                socket.send(next_msg)

        # handle except
        for socket in exception:
            if socket in outputs:
                outputs.remove(socket)
            inputs.remove(socket)
            socket.close()
            del client_msg_queue[socket]

    print(f"{name} - close room")


if __name__ == "__main__":
    print("start server")
    
    server = init_server()

    print("server ready")

    run_server(server)

    print("close server")
