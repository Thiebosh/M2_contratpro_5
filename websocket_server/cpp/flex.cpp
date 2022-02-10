%option noyywrap
%{
    #include <iostream>
    #include "compiled.bison.hpp"

    char* unquote(char* input, int length);
%}

QUOTE    "\""
HEXA    [0-9a-fA-F]

KEY_    {QUOTE}
_KEY    {QUOTE}:

TEXT    {QUOTE}[0-9A-Za-z_ ]*{QUOTE}
COLOR   {QUOTE}#({HEXA}{6}|{HEXA}{3}){QUOTE}
EOL     \r\n|\r|\n

%%

"{" { return OPEN_DOC; }
"}" { return CLOSE_DOC; }
"[" { return OPEN_ARRAY; }
"]" { return CLOSE_ARRAY; }
,   { return NEXT; }

"(T|t)rue" { return TRUE; }

{KEY_}root{_KEY}         { return ROOT; }
{KEY_}screen{_KEY}       { return SCREEN; }
{KEY_}name{_KEY}         { return NAME; }
{KEY_}home{_KEY}         { return HOME; }
{KEY_}style{_KEY}        { return STYLE; }
{KEY_}align{_KEY}        { return ALIGN; }
{KEY_}color{_KEY}        { return COLOR; }
{KEY_}decoration{_KEY}   { return DECO; }
{KEY_}content{_KEY}      { return CONTENT; }
{KEY_}block{_KEY}        { return BLOCK; }
{KEY_}text{_KEY}         { return TEXT; }
{KEY_}value{_KEY}        { return VALUE; }

{TEXT}  { yylval.string = unquote(yytext,yyleng); return STR_VALUE; }
{COLOR} { yylval.string = unquote(yytext,yyleng); return COLOR_VALUE; }

[ \t]|{EOL} { }
.           { std::cout << std::endl << "Error - raw text : '" << yytext[0] << "'" << std::endl; exit(1); }

%%

char* unquote(char* input, int length) {
    char* tmp = strdup(input);
    tmp++[length-1] = '\0';
    return tmp;
}