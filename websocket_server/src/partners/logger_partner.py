from logging import Logger

class LoggerPartner:

	def __init__(self, logger:Logger):
		self.logger:Logger = logger

	def copy_partner(self):
		return LoggerPartner(self.logger)
