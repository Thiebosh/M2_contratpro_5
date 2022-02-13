# import asyncio
from subprocess import Popen, PIPE
import time

class CppPartner():
    def __init__(self) -> None:
        self.exe_path = "/src/brique2/cpp/prototypeur.exe"
        self.freq = 0.4

    def copy_partner(self):
        return CppPartner()

    def call(self, specs): # async
        filepath = "/src/brique2/cpp/needs.json"
        open(filepath, "w").write(specs)
        args = (filepath,)
        process = Popen([self.exe_path, *args], stdout=PIPE, stderr=PIPE, text=True)

        while True:
            retcode = process.poll()  # check if available
            if not retcode:  # Process finished.
                break
            time.sleep(self.freq) # await asyncio.sleep(self.freq)

        lines = process.communicate()[0].split("\n\n\n\n")

        # if lines[0] == "error":  # retcode and retcode != 0:  # execution error
        #     print(f"cpp executable return error '{retcode}'")
        #     print(lines)
        #     return False

        return [{"name": line.split("\n")[0], "content": line[line.find("\n")+1:]} for line in lines][:-1]
