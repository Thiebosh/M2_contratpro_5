import asyncio
from subprocess import Popen, PIPE

class CppPartner():
    def __init__(self) -> None:
        self.exe_path = "./cpp/prototypeur.exe"
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

        lines = process.communicate()[0].split("\n\n\n")
        lines = [ # example
            'ecran1.html \
            <section style="background-color: #6897bb; margin: auto; "> \
                <div style="margin: auto; "> \
                    <p style="color: red; text-decoration: underline;"> \
                        hello world \
                    </p> \
                    <div style="background-color: blue;"> \
                        <p> \
                            some nested text \
                        </p> \
                    </div> \
                    <p style="color: red;"> \
                        other text \
                    </p> \
                </div> \
                <div style="margin: auto; "> \
                    <p style="color: green; text-decoration: italic;"> \
                        hello world1 \
                    </p> \
                    <p style="color: lightblue;"> \
                        hello world2 \
                    </p> \
                </div> \
            </section>'
        ]

        # if lines[0] == "error":  # retcode and retcode != 0:  # execution error
        #     print(f"cpp executable return error '{retcode}'")
        #     print(lines)
        #     return False

        return [{"name": line.split("\n")[0], "content": line[line.find("\n")+1:]} for line in lines]
