#include <iostream>
#include <string>
#include <map>

#define INDENT true

using namespace std;

enum class container {
    root,
    screen,
    block,
    text
};

container currentContainer = container::root;
string currentHtmlPage = "";
map<string, string> htmlContent;
int indent = 0; //tmp

map<container, string> colorContainer = {
    {container::screen, "background-color: "},
    {container::block, "background-color: "},
    {container::text, "color: "}
};
map<string, map<container, string>> alignContainer = {
    {"center", 
        {
            {container::screen, "margin: auto; "},
            {container::block, "margin: auto; "},
            {container::text, "text-align: center; "}
        }
    }
};

void outputResultFiles() {
	for (auto file : htmlContent) cout << file.first << ".html" << endl << file.second << endl << endl;
}
