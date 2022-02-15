# import asyncio
import os
from subprocess import Popen, PIPE
import time

class CppPartner():
    def __init__(self, exe_path, state=None) -> None:
        self.state = state or False
        self.exe_path = exe_path

        if state == None:
            print("path : ", exe_path)
            if os.path.exists(exe_path):
                self.state = True
                print("path is correct")
            else:
                print("path is incorrect")

    def copy_partner(self):
        return CppPartner(exe_path=self.exe_path, state=True)

    def call(self, args, poll_freq=0.4): # async
        if not self.state:
            return "", -1

        process = Popen([self.exe_path, *args], stdout=PIPE, stderr=PIPE, text=True)

        while True:
            retcode = process.poll()  # check if available
            if not retcode:  # Process finished.
                break
            time.sleep(poll_freq) # await asyncio.sleep(poll_freq)

        return process.communicate()[0], retcode
