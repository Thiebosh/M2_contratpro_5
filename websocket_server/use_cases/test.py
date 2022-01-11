import json

f = open("websocket_server\\use_cases\\test.json")
data = json.load(f)

print(data)

screen = data["root"]["screen"]

screen[0]["name"] = "qsdmljnfg"
type(screen)
data
screen

counts = {}


def dictizeString(string, dictionary):
	while string.startswith('/'):
		string = string[1:]
	parts = string.split('/', 1)
	if len(parts) > 1:
		branch = dictionary.setdefault(parts[0], {})
		dictizeString(parts[1], branch)
	else:
		if dictionary.__contains__(parts[0]):
				# If there's an addition error here, it's because invalid data was added
				dictionary[parts[0]] += 1
		else:
				dictionary[parts[0]] = 1

d = {}

dictizeString("/a/b/B/s/c/s/a",d)