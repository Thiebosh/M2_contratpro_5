from socket import socket, timeout, AF_INET, SOCK_STREAM
import threading
import time

CONNECT_IP = "127.0.0.1"
CONNECT_PORT = 20002

WAITING_TIME = 1


def client_recieve(evt_stop, ip, client, maxtime, buffer, code):
    client.settimeout(maxtime)

    while not evt_stop.is_set():
        time.sleep(WAITING_TIME)

        try:
            rep = client.recv(buffer).decode(code)

        except timeout:
            continue

        except Exception as e:
            print(f"CLIENT - Exception : {e}")
            evt_stop.set()
            break

        else:
            print(f"CLIENT - from {ip}, recieve {rep}")


def client(ip, port, maxtime=1, buffer=1024, code='utf-8'):
    client = socket(AF_INET, SOCK_STREAM)
    client.settimeout(maxtime)

    try:
        client.connect((ip, port))
    except Exception as e:
        print(f"CLIENT - connexion error : {e}")
        return

    evt_stop = threading.Event()
    args = (evt_stop, ip, client, maxtime, buffer, code)
    recvThread = threading.Thread(target=client_recieve, args=args)
    recvThread.start()

    msg = input("channel to log in : ")
    if msg == "exit":
        evt_stop.set()
        return
    client.send(msg.encode(code))

    try:
        while True:
            msg = input("msg : ")

            if msg == "exit":
                break

            if evt_stop.is_set():
                print("CLIENT- lost connexion")
                break

            print(f"CLIENT - to {ip}, send {msg}")
            client.send(msg.encode(code))

    except KeyboardInterrupt:
        print("send extinction signal")

    evt_stop.set()
    recvThread.join()

    client.close()

    print("CLIENT - close communication")
    return


if __name__ == "__main__":
    client(CONNECT_IP, CONNECT_PORT)
