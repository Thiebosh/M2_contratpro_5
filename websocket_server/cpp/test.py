import os
import asyncio
from subprocess import Popen, PIPE

async def call(poll_freq=0.4):
    exe_path = "./prototypeur.exe"

    if (not os.path.exists(exe_path)):
        print("no exe")
        return

    process = Popen([exe_path, *("./templates/needs.json",)], stdout=PIPE, stderr=PIPE, text=True)

    while True:
        retcode = process.poll()  # check if available
        if not retcode:  # Process finished.
            break
        await asyncio.sleep(poll_freq)

    return process.communicate()[0], retcode

async def generate_files():
    lines, retcode = await call()
    print("lines :")
    print(lines)
    print("")

    if retcode == -1:
        return False

    chunks = lines.split("\n\n\n\n")

    if chunks[-1].split("\n")[0] == "error":  # retcode and retcode != 0:  # execution error
        print(f"cpp executable return error '{retcode}'")
        print(lines)
        return False

    files = [{"name": line.split("\n")[0], "content": line[line.find("\n")+1:]} for line in chunks][:-1]
    print("files")
    print(files)
    print("")

    return True


if __name__ == '__main__':
    result = asyncio.run(generate_files())

    print("result :", result)
