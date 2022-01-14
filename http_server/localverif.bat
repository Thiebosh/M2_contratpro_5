pylint src test
safety check -r requirements.txt --bare
@REM bandit --ini setup.cfg -r src
@REM pytest --cov=src test
@REM del ".coverage" 2>nul
pause
