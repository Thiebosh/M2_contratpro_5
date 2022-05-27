%option noyywrap
%option yylineno
%{
    #include <iostream>
    #include "compiled.bison.hpp"

    char* unquote(char* input, int length);
%}

QUOTE    "\""
HEXA    [0-9a-fA-F]

KEY_    {QUOTE}
_KEY    {QUOTE}:

TEXT    {QUOTE}[0-9A-Za-z_.:/!?,;éèêôçàû ]*{QUOTE}
COLOR   {QUOTE}#({HEXA}{6}|{HEXA}{3}){QUOTE}
EOL     \r\n|\r|\n

%%

"{" { return OPEN_DOC; }
"}" { return CLOSE_DOC; }
"[" { return OPEN_ARRAY; }
"]" { return CLOSE_ARRAY; }
,   { return NEXT; }

{KEY_}root{_KEY}         { return ROOT; }
{KEY_}style{_KEY}        { return STYLE; }
{KEY_}block{_KEY}        { return BLOCK; }
{KEY_}link{_KEY}         { return LINK; }
{KEY_}text{_KEY}         { return TEXTBLOCK; }
{KEY_}title{_KEY}        { return TITLE; }
{KEY_}button{_KEY}       { return BUTTON; }
{KEY_}screen{_KEY}       { return SCREEN; }
{KEY_}content{_KEY}      { return CONTENT; }
{KEY_}userInput{_KEY}    { return INPUT; }
{KEY_}repeat{_KEY}       { return REPEAT; }

{KEY_}name{_KEY}                    { return NAME; }
{KEY_}defaultPage{_KEY}             { return DEFAULTSCREEN; }
{KEY_}targetValue{_KEY}             { return TARGETVALUE; }
{KEY_}textValue{_KEY}               { return TEXTVALUE; }
{KEY_}hintValue{_KEY}               { return HINTVALUE; }
{KEY_}numberValue{_KEY}             { return NUMBERVALUE; }
{KEY_}inputType{_KEY}               { return INPUTTYPE; }
{KEY_}external{_KEY}                { return EXTLINK; }
{KEY_}color{_KEY}                   { return COLOR; }
{KEY_}align{_KEY}                   { return ALIGN; }
{KEY_}textDecoration{_KEY}          { return DECO; }
{KEY_}textBold{_KEY}                { return ISBOLD; }
{KEY_}borders{_KEY}                 { return BORDERS; }
{KEY_}borderRadius{_KEY}            { return BORDERRADIUS; }
{KEY_}width{_KEY}                   { return WIDTH; }
{KEY_}outerMargin{_KEY}             { return OUTERMARGIN; }
{KEY_}innerMargin{_KEY}             { return INNERMARGIN; }
{KEY_}innerMarginVertical{_KEY}     { return INNERMARGIN_V; }
{KEY_}innerMarginHorizontal{_KEY}   { return INNERMARGIN_H; }
{KEY_}flexible{_KEY}                { return FLEXIBLE; }
{KEY_}flexDirection{_KEY}           { return FLEXDIRECTION; }
{KEY_}flexAlignPrimary{_KEY}        { return FLEXALIGNPRIMARY; }
{KEY_}flexAlignSecondary{_KEY}      { return FLEXALIGNSECONDARY; }
{KEY_}flexChildRatio{_KEY}          { return FLEXCHILDRATIO; }

(T|t)rue { return TRUE; }
(F|f)alse { return FALSE; }
{TEXT}  { yylval.string = unquote(yytext,yyleng); return STR_VALUE; }
{COLOR} { yylval.string = unquote(yytext,yyleng); return COLOR_VALUE; }

[ \t]|{EOL} { }
.           { std::cout << std::endl << "ERROR : raw text scanned : '" << yytext[0] << "'" << std::endl; }

%%

char* unquote(char* input, int length) {
    char* tmp = strdup(input);
    tmp++[length-1] = '\0';
    return tmp;
}