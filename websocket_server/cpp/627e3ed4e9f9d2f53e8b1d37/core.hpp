#include <stdlib.h>
#include <iostream>
#include <fstream>
#include <string>
#include <map>
#include <vector>

#include "../error.hpp"

#define INDENT false
#define ONE_LINE true

using namespace std;

enum class Container {
    root,
    screen,
    block,
    link,
    text
};

std::vector<Container> currentContainer = { Container::root };
string currentPage = "";
string defaultPage = "";
std::map<string, string> fileContent;
int indent = 0; //tmp
std::vector<string> htmlPages;
std::vector<bool> isNestedLinkExternal;

std::vector<int> cssPositionApplyer;
string currentStyle = "";

std::vector<string> loopLevel;
std::vector<int> loopCount;

std::map<Container, string> colorContainer = {
    {Container::screen, "background-color: "},
    {Container::block, "background-color: "},
    {Container::link, "color: "},
    {Container::text, "color: "}
};
std::map<string, std::map<Container, string>> alignContainer = {
    {"center", 
        {
            {Container::screen, "margin: auto; "},
            {Container::block, "margin: auto; "},
            {Container::text, "text-align: center; "}
        }
    }
};

#define PROCESS_VAL(p) case(p): s = #p; break;

std::ostream& operator<<(std::ostream& out, const Container value) {
    const char* s = 0;
    switch(value){
        PROCESS_VAL(Container::screen);
        PROCESS_VAL(Container::block);
        PROCESS_VAL(Container::link);
        PROCESS_VAL(Container::text);
    }
    return out << s;
}

void outputResultFiles() {
    if (!htmlPages.size()) displayError(ErrorType::input, ErrorObject::no_files_transmitted, "");

    // afficher default page
    if (defaultPage == "") defaultPage = htmlPages[0];
    cout << "default page:" << endl << defaultPage << endl << endl << endl << endl;

    // print routeur.php
    cout << "routeur.php" << endl;
    std::ifstream routeur_template("templates/routeur.php");
    if (!routeur_template.is_open()) displayError(ErrorType::internal, ErrorObject::template_not_found, "templates/routeur.php");
    cout << routeur_template.rdbuf() << endl << endl << endl << endl;

    //print html files
	for (auto file : fileContent) cout << file.first << endl << file.second << endl << endl << endl << endl;
    cout << endl;
}
