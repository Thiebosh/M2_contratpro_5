import asyncio
import os
from subprocess import Popen, PIPE

class CppPartner():
    def __init__(self, folder_path, state=None) -> None:
        self.state = state or False
        self.folder_path = folder_path
        self.exe_path = None

        if state == None:
            self.state = os.path.exists(folder_path)

    def copy_partner(self):
        return CppPartner(folder_path=self.folder_path, state=True)

    def set_exe_file(self, exe_name):
        self.exe_path = f"{self.folder_path}/{exe_name}.exe"
        self.state = os.path.exists(self.exe_path)

    async def call(self, args, poll_freq=0.4):
        if not self.state or not self.exe_path:
            return "", -1

        process = Popen([self.exe_path, *args], stdout=PIPE, stderr=PIPE, text=True)

        while True:
            retcode = process.poll()  # check if available
            if not retcode:  # Process finished.
                break
            await asyncio.sleep(poll_freq)

        return process.communicate()[0], retcode
