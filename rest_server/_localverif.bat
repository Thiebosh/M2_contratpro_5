pylint src test
safety check -r requirements.txt --bare
bandit --ini setup.cfg -r src
pytest --cov=src test
del ".coverage" 2>nul
pause
