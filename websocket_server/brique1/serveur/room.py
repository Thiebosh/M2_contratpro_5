import queue
import threading
import select

class Room():
    def __init__(self, room_name, room_socket) -> None:
        self.close_evt = threading.Event()
        self.queue = queue.Queue()
        self.lock = threading.Lock()
        self.room_name = room_name
        self.room_socket = room_socket
        self.inputs = [self.room_socket]
        self.outputs = []
        self.client_connection_queue = {self.room_socket: queue.Queue()}
        self.history = []
    

    def get_param(self):
        return {
                "close_evt": self.close_evt,
                "add_queue": self.queue,
                "add_lock": self.lock
        }
    

    def read(self, polling_freq):
        readable, writable, exception = select.select(self.inputs, self.outputs, self.inputs, polling_freq)
        return readable, writable, exception


    def close(self):
        print(f"{self.room_name} - Get close signal")
        for socket in self.inputs:
            socket.close()


    def open_client_connection_to_room(self, encoding):
        socket = self.queue.get() # When "get" called, it removes item from queue
        self.inputs.append(socket)
        self.client_connection_queue[socket] = queue.Queue()
        print(f"{self.room_name} - Get client {socket.getpeername()}")

        self.client_connection_queue[socket].put("\n".join(self.history).encode(encoding))
        self.outputs.append(socket)


    def close_client_connection_to_room(self, socket):
        print(f"{self.room_name} - Close client")
        if socket in self.outputs:
            self.outputs.remove(socket)
        self.inputs.remove(socket)
        socket.close()
        del self.client_connection_queue[socket]


    def add_message_in_queue(self, socket, client_socket, b_msg):
        if client_socket != socket:
            self.client_connection_queue[client_socket].put(b_msg)
            if client_socket not in self.outputs:
                self.outputs.append(client_socket)


    def run(self, polling_freq=0.1, buff_size=1024, encoding="utf-8"):
        print(f"{self.room_name} - Create room")
       
        while not self.close_evt.is_set() and self.inputs:
            with self.lock:
                while not self.queue.empty():
                    self.open_client_connection_to_room(encoding)
            try:
                readable, writable, exception = self.read(polling_freq)
            except KeyboardInterrupt:
                self.close()
                break
            
            for socket in readable:
                b_msg = socket.recv(buff_size)

                if not b_msg:
                    self.close_client_connection_to_room(socket)
                    continue

                self.history.append(b_msg.decode(encoding))
                for client_socket in self.client_connection_queue:
                    self.add_message_in_queue(socket, client_socket, b_msg)

            for socket in writable:
                try:
                    next_msg = self.client_connection_queue[socket].get_nowait()  # unqueue msg
                except queue.Empty:
                    self.outputs.remove(socket)
                else:
                    socket.send(next_msg)

            for socket in exception:
                self.close_client_connection_to_room(socket)

        print(f"{self.room_name} - Close room")