compile:
	rm -rf prototypeur.exe
	mkdir -p compilation
	bison -d bison.cpp -o compilation/compiled.bison.cpp
	flex -o compilation/compiled.flex.cpp flex.cpp
	g++ compilation/compiled.flex.cpp -o prototypeur.exe

run:
	./prototypeur.exe

all:
	make compile
	make run
