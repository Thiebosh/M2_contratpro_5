pylint paul test
safety check -r requirements.txt --bare
bandit --ini setup.cfg -r paul
pytest --cov=paul test
del ".coverage" 2>nul
pause
