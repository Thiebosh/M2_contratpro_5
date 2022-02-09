#include <iostream>
#include <fstream>
#include <string>
#include <map>
#include <vector>

#define INDENT true

using namespace std;

enum class container {
    root,
    screen,
    block,
    text
};

container currentContainer = container::root;
string currentPage = "";
std::map<string, string> fileContent;
int indent = 0; //tmp
std::vector<string> htmlPages;

std::map<container, string> colorContainer = {
    {container::screen, "background-color: "},
    {container::block, "background-color: "},
    {container::text, "color: "}
};
std::map<string, std::map<container, string>> alignContainer = {
    {"center", 
        {
            {container::screen, "margin: auto; "},
            {container::block, "margin: auto; "},
            {container::text, "text-align: center; "}
        }
    }
};

void outputResultFiles() {
    if (!htmlPages.size()) {
        cout << "error - no files" << endl;
        return;
    }

    // print routeur.php
    cout << "routeur.php" << endl;
    std::ifstream routeur_template("templates/routeur.php");
    std::string lineBuffer;
    bool setDefaultFlag = false;
    while (routeur_template) {
        std::getline(routeur_template, lineBuffer);

        if (!setDefaultFlag) {
            std::size_t found = lineBuffer.find("\"\"");
            if (found != std::string::npos) {
                setDefaultFlag = true;
                lineBuffer.insert(found+1, htmlPages[0]); // could specify default page
            }
        }

        cout << lineBuffer << endl;
    }
    cout << endl << endl;

    //print html files
	for (auto file : fileContent) cout << file.first << endl << file.second << endl << endl;
    cout << endl;
}
