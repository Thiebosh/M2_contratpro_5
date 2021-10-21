%define parse.error verbose
%{
    #include <iostream>

    #define YYDEBUG 1

    using namespace std;

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

proto: OPEN_DOC ROOT { cout << " <start>"; } OPEN_DOC proto_files CLOSE_DOC { cout << " <finish>"; } CLOSE_DOC;

proto_files
    : proto_files NEXT proto_files
    | SCREEN array { cout << " <generate html content file>"; }
    ;

array: OPEN_ARRAY { cout << " <unwrap array>"; } array_content CLOSE_ARRAY;

array_content
    : doc NEXT array_content
    | doc
    | STR_VALUE NEXT array_content
    | STR_VALUE
    ;

doc: OPEN_DOC { cout << " <unwrap object>"; } fields CLOSE_DOC;

fields
    : field NEXT fields
    | field
    ;

field
    : NAME STR_VALUE { cout << " <NAME '" << $2 << "'>"; }
    | STYLE { cout << " <STYLE>"; } doc
    | COLOR COLOR_VALUE { cout << " <COLOR '" << $2 << "'>"; }
    | COLOR STR_VALUE { cout << " <COLOR '" << $2 << "'>"; }
    | ALIGN STR_VALUE { cout << " <ALIGN '" << $2 << "'>"; }
    | DECO STR_VALUE { cout << " <DECO '" << $2 << "'>"; }
    | CONTENT { cout << " <CONTENT>"; } array
    | BLOCK { cout << " <BLOCK>"; } doc
    | TEXT { cout << " <TEXT>"; } doc
    | VALUE STR_VALUE { cout << " <VALUE '" << $2 << "'>"; }
    ;

%%


// int main(void)
// {
//     int token;
//     while ((token = yylex()) != 0)
//         printf("Token: %d (%s)\n", token, yytext);
//     return 0;
// }


int main(int argc, char **argv) {
    if (yyin = fopen("needs.json","r")) {//fournit à flex le fichier à parser
        cout << "acquisition fichier ok" << endl << endl;
        yyparse();//parse le fichier
    }

    cout << endl << endl << "fin de parcours." << endl;

    return 0;
}
