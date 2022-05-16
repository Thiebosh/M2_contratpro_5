build:
	echo $(ID)
	rm -rf $(valueID).exe
	mkdir -p compilation
	bison -d $(valueID)/bison.cpp -o compilation/compiled.bison.cpp
	flex -o compilation/compiled.flex.cpp $(valueID)/flex.cpp
	g++ compilation/compiled.flex.cpp compilation/compiled.bison.cpp -o $(valueID).exe

run:
	./$(valueID).exe templates/needs.json

all:
	make build
	make run
