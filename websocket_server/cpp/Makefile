build:
	rm -rf $(valueID).exe
	mkdir -p compilation
	mkdir -p executables
	bison -d $(valueID)/bison.cpp -o compilation/compiled.bison.cpp
	flex -o compilation/compiled.flex.cpp $(valueID)/flex.cpp
	g++ compilation/compiled.flex.cpp compilation/compiled.bison.cpp -o executables/$(valueID).exe

run:
	./executables/$(valueID).exe templates/needs.json

all:
	make build
	make run
