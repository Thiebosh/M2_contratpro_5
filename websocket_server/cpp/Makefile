build:
	rm -rf 627e3ed4e9f9d2f53e8b1d37.exe
	mkdir -p compilation
	bison -d 627e3ed4e9f9d2f53e8b1d37/bison.cpp -o compilation/compiled.bison.cpp
	flex -o compilation/compiled.flex.cpp 627e3ed4e9f9d2f53e8b1d37/flex.cpp
	g++ compilation/compiled.flex.cpp compilation/compiled.bison.cpp -o 627e3ed4e9f9d2f53e8b1d37.exe

run:
	./627e3ed4e9f9d2f53e8b1d37.exe templates/needs.json

all:
	make build
	make run
