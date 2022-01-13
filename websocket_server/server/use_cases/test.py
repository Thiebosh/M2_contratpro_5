import json
import logging

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

def create_from_path(string_path: str, dictionary: dict, value: str = None):
	"""Create New Dictionnary based on hierarchie path

	Args:
		string_path (str): [Hierarchie Path of the json]
		dictionary (dict): [Base Dictionnary]

	Returns:
		[dict]: [Final form of the dictionnary]
	"""
	while string_path.startswith('/'):
		string_path = string_path[1:]
	parts = string_path.split('/', 1)
	if len(parts) > 1:
		branch = dictionary.setdefault(parts[0], {})
		create_from_path(parts[1], branch, value)
	else:
		if dictionary.__contains__(parts[0]):
				# If there's an addition error here, it's because invalid data was added
				logging.debug("Modify in path {} from {} to {}".format(string_path, dictionary[parts[0]], value))
				dictionary[parts[0]] = value
		else:
				logging.debug("Creating new path  with value {}".format(string_path))
				dictionary[parts[0]] = value
	return dictionary

d = {}

dictizeString("/a/b/r",d)

create_from_path("/a/b/z/zds/f", d, "sqa")