%define parse.error verbose
%{
    #include "../core.cpp"

    #define YYDEBUG 1

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
            htmlContent[currentHtmlPage] += "</section>";
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
                    currentHtmlPage = $2;
                    htmlContent.insert({currentHtmlPage, "<section>\n"});
                    indent++;
                    break;
            }
        }
    |   CONTENT array
    |   BLOCK
        {
            currentContainer = container::block;
            htmlContent[currentHtmlPage] += (INDENT ? string(indent++, '\t') : "") + "<div>\n";
        }
        doc
        {
            htmlContent[currentHtmlPage] += (INDENT ? string(--indent, '\t') : "") + "</div>\n";
        }
    |   TEXT
        {
            currentContainer = container::text;
            htmlContent[currentHtmlPage] += (INDENT ? string(indent++, '\t') : "") + "<p>\n";
        }
        doc
        {
            htmlContent[currentHtmlPage] += (INDENT ? string(--indent, '\t') : "") + "</p>\n";
        }
    |   VALUE STR_VALUE
        {
            htmlContent[currentHtmlPage] += (INDENT ? string(indent, '\t') : "") + $2 + '\n';
        }
    |   STYLE
        {
            htmlContent[currentHtmlPage].pop_back();
            htmlContent[currentHtmlPage].pop_back();
            htmlContent[currentHtmlPage] += " style=\"";
        }
        doc
        {
            htmlContent[currentHtmlPage].pop_back();
            htmlContent[currentHtmlPage] += "\">\n";
        }
    |   COLOR COLOR_VALUE
        {
            htmlContent[currentHtmlPage] += colorContainer[currentContainer] + $2 + "; ";
        }
    |   COLOR STR_VALUE
        {
            htmlContent[currentHtmlPage] += colorContainer[currentContainer] + $2 + "; ";
        }
    |   DECO STR_VALUE
        {
            htmlContent[currentHtmlPage] += "text-decoration: " + (string)$2 + "; ";
        }
    |   ALIGN STR_VALUE
        {
            htmlContent[currentHtmlPage] += alignContainer[$2][currentContainer] + " ";
        }
    ;

%%

int main(int argc, char **argv) {
    if (yyin = fopen("needs.json","r")) {//fournit à flex le fichier à parser
        yyparse();//parse le fichier
    }

    outputResultFiles();

    return 0;
}
