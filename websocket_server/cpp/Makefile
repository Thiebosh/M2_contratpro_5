build:
	rm -rf prototypeur.exe
	mkdir -p compilation
	bison -d bison.cpp -o compilation/compiled.bison.cpp
	flex -o compilation/compiled.flex.cpp flex.cpp
	g++ compilation/compiled.flex.cpp compilation/compiled.bison.cpp -o prototypeur.exe

run:
	./prototypeur.exe templates/needs.json

all:
	make build
	make run
