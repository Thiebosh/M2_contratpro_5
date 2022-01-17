import asyncio
from subprocess import Popen, PIPE

def generate_files(specs):
    asyncio.run(cpp_call(specs))

async def cpp_call(specs):
    path = "exe_path"
    args = (specs,)
    process = Popen([path, *args], stdout=PIPE, stderr=PIPE, text=True)

    while True:
        retcode = process.poll()  # check if available
        if not retcode:  # Process finished.
            break
        await asyncio.sleep(.4)

    lines = process.communicate()[0].split("\n")

    if lines[2] == "error":  # retcode and retcode != 0:  # execution error
        print(f"cpp executable return error '{retcode}'")
        print(lines)
        return False

    # group and parse lines

    return True
