import base64
import hashlib
import struct

class WebSocketPartner():
    def copy_partner(self):
        return WebSocketPartner()

    @staticmethod
    def handshake(conn, encoding):
        key = None
        conn.setblocking(True)
        data = conn.recv(8192).decode(encoding)
        conn.setblocking(False)
        if not len(data):
            return False
        for line in data.split('\r\n\r\n')[0].split('\r\n')[1:]:
            k, v = line.split(': ')
            if k == 'Sec-WebSocket-Key':
                key = base64.b64encode(hashlib.sha1((v + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').encode(encoding)).digest())
        if not key:
            conn.close()
            return False
        response = 'HTTP/1.1 101 Switching Protocols\r\n'\
                   'Upgrade: websocket\r\n'\
                   'Connection: Upgrade\r\n'\
                   'Sec-WebSocket-Accept:' + key.decode(encoding) + '\r\n\r\n'
        conn.setblocking(True)
        conn.send(response.encode(encoding))
        conn.setblocking(False)
        return True

    @staticmethod
    def recv(conn, encoding, size=8192):
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
        for cnt, d in enumerate(raw):
            ret += chr(d ^ mask[cnt%4])

        if ret.encode(encoding) == b'\x03\xc3\xa9':
            return None

        try:
            return ret.encode("latin-1").decode(encoding) # raw str to latin-1 bytes + bytes to utf-8 str
        except UnicodeDecodeError as err:
            print(f"websocket partner error - {err}")
            return ret

    @staticmethod
    def send(conn, data:str, encoding):
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
        data = data.encode(encoding).decode("latin-1")
        head = b'\x81'
        if len(data) < 126:
            head += struct.pack('B', len(data))
        elif len(data) <= 0xFFFF:
            head += struct.pack('!BH', 126, len(data))
        else:
            head += struct.pack('!BQ', 127, len(data))
        conn.send(head+data.encode(encoding))
