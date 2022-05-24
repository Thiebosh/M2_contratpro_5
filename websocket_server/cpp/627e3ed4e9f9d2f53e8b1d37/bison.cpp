%define parse.error verbose
%{
    #include "../627e3ed4e9f9d2f53e8b1d37/core.hpp"

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
%token STYLE
%token BLOCK
%token LINK
%token TEXTBLOCK
%token SCREEN
%token CONTENT
%token NAME
%token DEFAULTSCREEN
%token TARGETVALUE
%token TEXTVALUE
%token NUMBERVALUE
%token EXTLINK
%token COLOR
%token ALIGN
%token DECO

%token TRUE
%token FALSE
%token <string> STR_VALUE
%token <string> COLOR_VALUE

%left NEXT

%%

proto: OPEN_DOC ROOT OPEN_DOC proto_files CLOSE_DOC CLOSE_DOC;

proto_files
    :   proto_files NEXT proto_files
    |   SCREEN
        {
            currentContainer.push_back(Container::screen);
        }
        array
        {
            --indent;
            fileContent[currentPage] += "</section>";
            cssPositionApplyer.pop_back();
            currentContainer.pop_back();
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
            switch(currentContainer.back()) {
                case Container::screen:
                    currentPage = $2;
                    currentPage.append(".html");
                    htmlPages.push_back(currentPage);
                    fileContent.insert({currentPage, "<section>"});
                    cssPositionApplyer.push_back(fileContent[currentPage].length()-1);
                    if (!ONE_LINE) fileContent[currentPage] += "\n";
                    indent++;
                    break;
            }
        }
    |   DEFAULTSCREEN TRUE // FALSE => do nothing => change to bool
        {
            if (defaultPage != "") displayError(ErrorType::input, ErrorObject::defaultPage_already_defined, "");
            if (currentPage == "") displayError(ErrorType::generation, ErrorObject::defaultPage_no_value, ""); // can't know
            defaultPage = currentPage;
        }
    |   CONTENT array
    |   BLOCK
        {
            currentContainer.push_back(Container::block);
            fileContent[currentPage] += (INDENT ? string(indent++, '\t') : "") + "<div>" + (ONE_LINE ? "" : "\n");
            cssPositionApplyer.push_back(fileContent[currentPage].length() - 1 - !ONE_LINE);
        }
        doc
        {
            fileContent[currentPage] += (INDENT ? string(--indent, '\t') : "") + "</div>" + (ONE_LINE ? "" : "\n");
            cssPositionApplyer.pop_back();
            currentContainer.pop_back();
        }
    |   LINK
        {
            currentContainer.push_back(Container::link);
            fileContent[currentPage] += (INDENT ? string(indent++, '\t') : "") + "<a>" + (ONE_LINE ? "" : "\n");
            isNestedLinkExternal.push_back(false);
            cssPositionApplyer.push_back(fileContent[currentPage].length() - 1 - !ONE_LINE);
        }
        doc
        {
            fileContent[currentPage] += (INDENT ? string(--indent, '\t') : "") + "</a>" + (ONE_LINE ? "" : "\n");
            isNestedLinkExternal.pop_back();
            cssPositionApplyer.pop_back();
            currentContainer.pop_back();
        }
    |   TEXTBLOCK
        {
            currentContainer.push_back(Container::text);
            fileContent[currentPage] += (INDENT ? string(indent++, '\t') : "") + "<p>" + (ONE_LINE ? "" : "\n");
            cssPositionApplyer.push_back(fileContent[currentPage].length() - 1 - !ONE_LINE);
        }
        doc
        {
            fileContent[currentPage] += (INDENT ? string(--indent, '\t') : "") + "</p>" + (ONE_LINE ? "" : "\n");
            cssPositionApplyer.pop_back();
            currentContainer.pop_back();
        }
    |   TEXTVALUE STR_VALUE
        {
            fileContent[currentPage] += (INDENT ? string(indent, '\t') : "") + $2 + (ONE_LINE ? "" : "\n");
        }
    |   STYLE
        {
            currentStyle = " style=\"";
        }
        doc
        {
            currentStyle += "\"";
            fileContent[currentPage].insert(cssPositionApplyer.back(), currentStyle);
        }
    |   COLOR COLOR_VALUE
        {
            currentStyle += colorContainer[currentContainer.back()] + $2 + "; ";
        }
    |   COLOR STR_VALUE
        {
            currentStyle += colorContainer[currentContainer.back()] + $2 + "; ";
        }
    |   DECO STR_VALUE
        {
            currentStyle += "text-decoration: " + (string)$2 + "; ";
        }
    |   ALIGN STR_VALUE
        {
            currentStyle += alignContainer[$2][currentContainer.back()] + "; ";
        }
    |   TARGETVALUE STR_VALUE
        {
            bool isExternal = isNestedLinkExternal.back();
            fileContent[currentPage].pop_back();
            fileContent[currentPage] += " href='" + (isExternal ? "http://" + (string)$2 : (string)$2 + ".html" )+ "'>";
        }
    |   EXTLINK TRUE // FALSE => do nothing => change to bool
        {
            isNestedLinkExternal.back() = true;
            fileContent[currentPage].pop_back();
            fileContent[currentPage] += " target='_blank'>";
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
