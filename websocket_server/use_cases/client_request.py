import json
import logging
from os import listdir, path, stat


	
class MasterJson():

	def __init__(self, file_path: str = None) -> None:
		"""Initiate the Json Class handling the master version of the model

		Args:
			file_path (str, optional): [path of the master json file]. Defaults to None.
		"""
		self.file_path = file_path
		if file_path == None:
			logging.debug(" Creating new Master Json file ")
			self.data = None
		else:
			f = open(file_path)
			self.data = json.load(f)
		
	def consumer(self, path: str, action: str ):
		"""Consumer

		Args:
			path (str): [A JSON path]
			action (str): [action to make on the json]
		"""
		list_path = path.split("\\")
		if action == "Create":
			MasterJson.create_from_path(path, self.data)
			f = open(self.file_path, 'w')
			json.dump(self.data, f)

		for i in range(len(list_path)):
			key = list_path[i]
			if key.isnumeric():
				key = int(key)
			hodler = self.data[key]
		
		pass

	@staticmethod
	def create_from_path(string_path: str, dictionary: dict):
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
			MasterJson.create_from_path(parts[1], branch)
		else:
			if dictionary.__contains__(parts[0]):
					# If there's an addition error here, it's because invalid data was added
					dictionary[parts[0]] += 1
			else:
					dictionary[parts[0]] = 1
		return dictionary

