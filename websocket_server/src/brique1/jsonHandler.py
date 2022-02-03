import json
import logging
from datetime import datetime

COLLECTION_PROJECTS = "projects"

class JsonHandler():

	@staticmethod
	def check_if_similar_keys(dict1, dict2):
		return not set(dict1).isdisjoint(dict2)

	def __init__(self, partners, project_name) -> None:
		"""Initiate the Json Class handling the master version of the model

		Args:
			file_path (str, optional): [path of the master json file]. Defaults to None.
		"""
		self.partners = partners
		self.project_name = project_name
		self.data = self.partners["db"].find_one(COLLECTION_PROJECTS, {"name":project_name}, {"_id": 0,"specs": 1})["specs"]


	def update_project(self):
		self.partners["db"].update_one(
			COLLECTION_PROJECTS,
            {"name":self.project_name}, 
            { "$set":
                {
                    "last_specs":datetime.utcnow(), 
                    "specs":self.data
                }
            }
        )
		print("Project well updated")

		
	def consumer(self, path: str, action: str, value: str, value_type: str ):
		"""[Consumer]

		Args:
			path (str): [A JSON path]
			action (str): [action to make on the json]
			value (str): [Value to add when editing or creating]
			value_type (str): [value time, can be list, int, string, dict]
		"""
		
		list_path = path.split("\\")
		if action == "Create":
			self.create_from_path(path, self.data)
			f = open(self.file_path, 'w')
			json.dump(self.data, f)

		## Editing ##
		if action == "Edit":
			for i in range(len(list_path)):
				key = list_path[i]
				if key.isnumeric():
					key = int(key)
				# hodler = self.data[key]


	def create_from_path(self, string_path: str, dictionary: dict = {}, value: str = None):
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
			self.create_from_path(parts[1], branch, value)
		else:
			if dictionary.__contains__(parts[0]):
				# If there's an addition error here, it's because invalid data was added
				logging.debug("Modify in path {} from {} to {}".format(string_path, dictionary[parts[0]], value))
				dictionary[parts[0]] = value
			else:
				logging.debug("Creating new path  with value {}".format(string_path))
				dictionary[parts[0]] = value
		self.data = dictionary
		return True

	def delete_from_path(self, string_path: str, dictionary: dict):
		"""delete a key from dictionnary according to path

		Args:
			string_path (str): [path of the key]
			dictionary (dict): [Dictionnary target]

		Returns:
			[type]: [Dictionnary modified]
		"""
		while string_path.startswith('/'):
			string_path = string_path[1:]
		parts = string_path.split('/', 1)
		if len(parts) > 1:
			branch = dictionary.setdefault(parts[0], {})
			self.delete_from_path(parts[1], branch)
		else:
			if dictionary.__contains__(parts[0]):
				# If there's an addition error here, it's because invalid data was added
				logging.debug("Modify in path {} from {} to {}".format(string_path, dictionary[parts[0]], parts[0]))
				dictionary.pop(parts[0], "Not Found")
			else:
				return "Key Not Found"
		self.data = dictionary
		return True

	@staticmethod
	def edit_from_path(string_path: str, dictionnary: dict):
		pass
