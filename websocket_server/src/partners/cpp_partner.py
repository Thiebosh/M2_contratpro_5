import asyncio
from subprocess import Popen, PIPE

class CppPartner():
    def __init__(self) -> None:
        self.exe_path = "./exe_path"
        self.freq = 0.4

    def copy_partner(self):
        return CppPartner()

    async def call(self, specs):
        args = (specs,)
        process = Popen([self.exe_path, *args], stdout=PIPE, stderr=PIPE, text=True)

        while True:
            retcode = process.poll()  # check if available
            if not retcode:  # Process finished.
                break
            await asyncio.sleep(self.freq)

        lines = process.communicate()[0].split("\n")

        if lines[2] == "error":  # retcode and retcode != 0:  # execution error
            print(f"cpp executable return error '{retcode}'")
            print(lines)
            return False

        # parse lines...

        return [{"name": "exemple.html", "content": "hello world"}] # exemple
