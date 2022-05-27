import base64
import hashlib
import struct
from socket import socket
from defines import *

class WebSocketCoreException(Exception):
    """Base class for all WebSocketCore exceptions"""

class WebSocketPartner():
    def copy_partner(self):
        return WebSocketPartner()

    @staticmethod
    def handshake(conn:socket) -> bool:
        key = None
        conn.setblocking(True)
        data = conn.recv(8192).decode(ENCODING)
        conn.setblocking(False)
        if not len(data):
            return False
        for line in data.split('\r\n\r\n')[0].split('\r\n')[1:]:
            k, v = line.split(': ')
            if k == 'Sec-WebSocket-Key':
                key = base64.b64encode(hashlib.sha1((v + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').encode(ENCODING)).digest())
        if not key:
            conn.close()
            return False
        response = 'HTTP/1.1 101 Switching Protocols\r\n'\
                   'Upgrade: websocket\r\n'\
                   'Connection: Upgrade\r\n'\
                   'Sec-WebSocket-Accept:' + key.decode(ENCODING) + '\r\n\r\n'
        conn.setblocking(True)
        conn.send(response.encode(ENCODING))
        conn.setblocking(False)
        return True

    @staticmethod
    def recv(conn:socket, size:int=8192) -> "str|None":
        conn.setblocking(True)
        data = conn.recv(size)
        conn.setblocking(False)

        if not len(data):
            return None

        length = data[1] & 127
        if length == 126:
            mask = data[4:8]
            raw = data[8:]
        elif length == 127:
            mask = data[10:14]
            raw = data[14:]
        else:
            mask = data[2:6]
            raw = data[6:]

        ret = ''
        bracket_counter = 0
        for cnt, d in enumerate(raw):
            next = chr(d ^ mask[cnt%4])
            if next == "{":
                bracket_counter += 1
            elif next == "}":
                bracket_counter -= 1
            ret += next
            if bracket_counter == 0:
                break

        if ret.encode(ENCODING) == b'\x03\xc3\xa9' or ret.encode(ENCODING) == b'\x03':
            return None

        try:
            result = ret.encode("latin-1").decode(ENCODING) # raw str to latin-1 bytes + bytes to utf-8 str
        except UnicodeDecodeError as err:
            raise WebSocketCoreException("recv double decode error") from err

        return result

    @staticmethod
    def send(conn:socket, data:str) -> None:
        # tmp remplace : see how to use recv mask method in reverse way
        data = data.replace("é", "e")\
                    .replace("è", "e")\
                    .replace("ê", "e")\
                    .replace("ç", "c")\
                    .replace("à", "a")\
                    .replace("ù", "u")\
                    .replace("ï", "i")\
                    .replace("î", "i")\
                    .replace("ô", "o")\
                    .replace("ö", "o")
        data = data.encode(ENCODING).decode("latin-1")
        head = b'\x81'
        if len(data) < 126:
            head += struct.pack('B', len(data))
        elif len(data) <= 0xFFFF:
            head += struct.pack('!BH', 126, len(data))
        else:
            head += struct.pack('!BQ', 127, len(data))

        result = head+data.encode(ENCODING)
        conn.send(result)
