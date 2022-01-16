@REM pylint src test
@REM safety check -r requirements.txt --bare
@REM bandit --ini setup.cfg -r src
pytest --cov=src test
del ".coverage" 2>nul
pause
