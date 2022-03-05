%define parse.error verbose
%{
    #include "../core.hpp"

    #define YYDEBUG 1
    #define YYERROR_VERBOSE 1

    using namespace std;

    extern FILE *yyin;
    extern int yylex ();
    extern int yylineno;
    int yyerror(char const *s) {
        cout << endl << "ERROR : line " << yylineno << endl << s << endl;
        exit(EXIT_FAILURE);
    }
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
%token HOME
%token NAME
%token STYLE
%token ALIGN
%token COLOR
%token DECO
%token CONTENT
%token BLOCK
%token TEXT
%token TEXTVALUE
%token TRUE

%token <string> STR_VALUE
%token <string> COLOR_VALUE

%left NEXT

%%

proto: OPEN_DOC ROOT OPEN_DOC proto_files CLOSE_DOC CLOSE_DOC;

proto_files
    :   proto_files NEXT proto_files
    |   SCREEN
        {
            currentContainer = Container::screen;
        }
        array
        {
            --indent;
            fileContent[currentPage] += "</section>";
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
                case Container::screen:
                    currentPage = $2;
                    currentPage.append(".html");
                    htmlPages.push_back(currentPage);
                    fileContent.insert({currentPage, "<section>"});
                    if (!ONE_LINE) fileContent[currentPage] += "\n";
                    indent++;
                    break;
            }
        }
    |   HOME TRUE
        {
            if (defaultPage != "") displayError(ErrorType::input, ErrorObject::defaultPage_already_defined, "");
            if (currentPage == "") displayError(ErrorType::generation, ErrorObject::defaultPage_no_value, "");
            defaultPage = currentPage;
        }
    |   CONTENT array
    |   BLOCK
        {
            currentContainer = Container::block;
            fileContent[currentPage] += (INDENT ? string(indent++, '\t') : "") + "<div>" + (ONE_LINE ? "" : "\n");
        }
        doc
        {
            fileContent[currentPage] += (INDENT ? string(--indent, '\t') : "") + "</div>" + (ONE_LINE ? "" : "\n");
        }
    |   TEXT
        {
            currentContainer = Container::text;
            fileContent[currentPage] += (INDENT ? string(indent++, '\t') : "") + "<p>" + (ONE_LINE ? "" : "\n");
        }
        doc
        {
            fileContent[currentPage] += (INDENT ? string(--indent, '\t') : "") + "</p>" + (ONE_LINE ? "" : "\n");
        }
    |   TEXTVALUE STR_VALUE
        {
            fileContent[currentPage] += (INDENT ? string(indent, '\t') : "") + $2 + (ONE_LINE ? "" : "\n");
        }
    |   STYLE
        {
            if (!ONE_LINE) fileContent[currentPage].pop_back();
            fileContent[currentPage].pop_back();
            fileContent[currentPage] += " style=\"";
        }
        doc
        {
            fileContent[currentPage].pop_back();
            fileContent[currentPage] += "\">";
            if (!ONE_LINE) fileContent[currentPage] += "\n";
        }
    |   COLOR COLOR_VALUE
        {
            fileContent[currentPage] += colorContainer[currentContainer] + $2 + "; ";
        }
    |   COLOR STR_VALUE
        {
            fileContent[currentPage] += colorContainer[currentContainer] + $2 + "; ";
        }
    |   DECO STR_VALUE
        {
            fileContent[currentPage] += "text-decoration: " + (string)$2 + "; ";
        }
    |   ALIGN STR_VALUE
        {
            fileContent[currentPage] += alignContainer[$2][currentContainer] + " ";
        }
    ;

%%

int main(int argc, char **argv) {
    if (yyin = fopen(argv[1], "r")) {//fournit à flex le fichier à parser
        yyparse();//parse le fichier
    }

    outputResultFiles();

    return 0;
}
