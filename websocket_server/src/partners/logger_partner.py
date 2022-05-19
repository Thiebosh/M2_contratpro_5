

class LoggerPartner:

	def __init__(self, app_logger):
		self.app_logger = app_logger

	def copy_partner(self):
		return LoggerPartner(self.app_logger)
