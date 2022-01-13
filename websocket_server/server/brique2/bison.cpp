%define parse.error verbose
%{
    #define YYDEBUG 1

    #include <iostream>
    #include <string>
    #include <map>

    using namespace std;

    enum class container {
        root,
        screen,
        block,
        text
    };

    container currentContainer = container::root;
    string currentHtml = "";
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

    extern FILE *yyin;
    extern int yylex ();
    int yyerror(char const *s) { fprintf (stderr, "%s\n", s); return 1; }
%}

%union{//variables
    char* string;
}

%token OPEN_DOC
%token CLOSE_DOC
%token OPEN_ARRAY
%token CLOSE_ARRAY
%token NEXT

%token ROOT
%token SCREEN
%token NAME
%token STYLE
%token ALIGN
%token COLOR
%token DECO
%token CONTENT
%token BLOCK
%token TEXT
%token VALUE

%token <string> STR_VALUE
%token <string> COLOR_VALUE

%left NEXT

%%

proto: OPEN_DOC ROOT OPEN_DOC proto_files CLOSE_DOC CLOSE_DOC;

proto_files
    :   proto_files NEXT proto_files
    |   SCREEN
        {
            currentContainer = container::screen;
        }
        array
        {
            --indent;
            htmlContent[currentHtml] += "</article>";
        }
    ;

array: OPEN_ARRAY array_content CLOSE_ARRAY;

array_content
    :   doc NEXT array_content
    |   doc
    |   STR_VALUE NEXT array_content
    |   STR_VALUE
    ;

doc: OPEN_DOC fields CLOSE_DOC;

fields
    :   field NEXT fields
    |   field
    ;

field
    :   NAME STR_VALUE
        { 
            switch(currentContainer) {
                case container::screen:
                    currentHtml = $2;
                    htmlContent.insert({currentHtml, "<article>\n"});
                    indent++;
                    break;
            }
        }
    |   CONTENT array
    |   BLOCK
        {
            currentContainer = container::block;
            htmlContent[currentHtml] += string(indent++, '\t') + "<div>\n";
        }
        doc
        {
            htmlContent[currentHtml] += string(--indent, '\t') + "</div>\n";
        }
    |   TEXT
        {
            currentContainer = container::text;
            htmlContent[currentHtml] += string(indent++, '\t') + "<p>\n";
        }
        doc
        {
            htmlContent[currentHtml] += string(--indent, '\t') + "</p>\n";
        }
    |   VALUE STR_VALUE
        {
            htmlContent[currentHtml] += string(indent, '\t') + $2 + '\n';
        }
    |   STYLE
        {
            htmlContent[currentHtml].pop_back();
            htmlContent[currentHtml].pop_back();
            htmlContent[currentHtml] += " style=\"";
        }
        doc
        {
            htmlContent[currentHtml].pop_back();
            htmlContent[currentHtml] += "\">\n";
        }
    |   COLOR COLOR_VALUE
        {
            htmlContent[currentHtml] += colorContainer[currentContainer] + $2 + "; ";
        }
    |   COLOR STR_VALUE
        {
            htmlContent[currentHtml] += colorContainer[currentContainer] + $2 + "; ";
        }
    |   DECO STR_VALUE
        {
            htmlContent[currentHtml] += "text-decoration: " + (string)$2 + "; ";
        }
    |   ALIGN STR_VALUE
        {
            htmlContent[currentHtml] += alignContainer[$2][currentContainer] + " ";
        }
    ;

%%

int main(int argc, char **argv) {
    if (yyin = fopen("needs.json","r")) {//fournit à flex le fichier à parser
        cout << "acquisition fichier ok" << endl << endl;
        yyparse();//parse le fichier
    }

    cout << endl << endl << "fin de parcours." << endl << endl;

    cout << "affiche contenu écrans :" << endl;
	for (auto file : htmlContent) cout << file.first << ".html" << endl << file.second << endl << endl;

    cout << "fin d'exécution." << endl;

    return 0;
}