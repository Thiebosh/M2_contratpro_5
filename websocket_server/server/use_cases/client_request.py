import json
import logging
from os import listdir, path, stat
import os
from pymongo import MongoClient
from datetime import datetime
	
class MasterJson():

	def __init__(self, project_name) -> None:
		"""Initiate the Json Class handling the master version of the model

		Args:
			file_path (str, optional): [path of the master json file]. Defaults to None.
		"""
		self.project_name = project_name
		self.conn = MongoClient(f"mongodb+srv://{os.environ.get('MONGO_USERNAME')}:{os.environ.get('MONGO_PASSWORD')}@{os.environ.get('MONGO_URL')}", tlsAllowInvalidCertificates=True)
		self.projects = self.conn.spectry.projects
		self.data = self.projects.find_one({"name":project_name})["specs"]
	

	def update_project(self):
		now = datetime.utcnow()
		self.projects.update_one(
            {"name":self.project_name}, 
            { "$set":
                {
                    "last_specs":now, 
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
			MasterJson.create_from_path(path, self.data)
			f = open(self.file_path, 'w')
			json.dump(self.data, f)

		## Editing ##
		if action == "Edit":
			for i in range(len(list_path)):
				key = list_path[i]
				if key.isnumeric():
					key = int(key)
				hodler = self.data[key]
		
		pass

	def create_path(self, string_path: str, dictionary: dict = {}, value: str = None):
		self.current_dict = self.create_from_path(string_path, dictionary, value)
		return True

	@staticmethod
	def create_from_path(string_path: str, dictionary: dict = {}, value: str = None):
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
			MasterJson.create_from_path(parts[1], branch, value)
		else:
			if dictionary.__contains__(parts[0]):
					# If there's an addition error here, it's because invalid data was added
					logging.debug("Modify in path {} from {} to {}".format(string_path, dictionary[parts[0]], value))
					dictionary[parts[0]] = value
			else:
					logging.debug("Creating new path  with value {}".format(string_path))
					dictionary[parts[0]] = value
		return dictionary

	@staticmethod
	def delete_from_path(string_path: str, dictionary: dict):
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
			MasterJson.delete_from_path(parts[1], branch)
		else:
			if dictionary.__contains__(parts[0]):
					# If there's an addition error here, it's because invalid data was added
					logging.debug("Modify in path {} from {} to {}".format(string_path, dictionary[parts[0]], parts[0]))
					dictionary.pop(parts[0], "Not Found")
			else:
					return "Key Not Found"
		return dictionary

	@staticmethod
	def edit_from_path(string_path: str, dictionnary: dict):
		pass
