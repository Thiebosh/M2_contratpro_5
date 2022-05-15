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
    text
};

Container currentContainer = Container::root;
string currentPage = "";
string defaultPage = "";
std::map<string, string> fileContent;
int indent = 0; //tmp
std::vector<string> htmlPages;

std::map<Container, string> colorContainer = {
    {Container::screen, "background-color: "},
    {Container::block, "background-color: "},
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

void outputResultFiles() {
    if (!htmlPages.size()) displayError(ErrorType::input, ErrorObject::no_files_transmitted, "");

    // afficher default page
    cout << "default page:" << endl << /*defaultPage*/"ecran1.html" << endl << endl << endl << endl; // ajouter element de pattern pour determiner page par défaut ou alors prendre première page comme défaut

    // print routeur.php
    cout << "routeur.php" << endl;
    std::ifstream routeur_template("templates/routeur.php");
    if (!routeur_template.is_open()) displayError(ErrorType::internal, ErrorObject::template_not_found, "templates/routeur.php");
    cout << routeur_template.rdbuf() << endl << endl << endl << endl;

    //print html files
	for (auto file : fileContent) cout << file.first << endl << file.second << endl << endl;
    cout << endl;
    if (ONE_LINE) cout << endl;
}
