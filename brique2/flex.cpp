%option noyywrap
%{
    #include "compiled.bison.cpp"

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

"{" { cout << " {"; return OPEN_DOC; }
"}" { cout << " }"; return CLOSE_DOC; }
"[" { cout << " ["; return OPEN_ARRAY; }
"]" { cout << " ]"; return CLOSE_ARRAY; }
,   { cout << " ,"; return NEXT; }

{KEY_}root{_KEY}         { cout << " root"; return ROOT; }
{KEY_}screen{_KEY}       { cout << " screen"; return SCREEN; }
{KEY_}name{_KEY}         { cout << " name"; return NAME; }
{KEY_}style{_KEY}        { cout << " style"; return STYLE; }
{KEY_}align{_KEY}        { cout << " align"; return ALIGN; }
{KEY_}color{_KEY}        { cout << " color"; return COLOR; }
{KEY_}decoration{_KEY}   { cout << " decoration"; return DECO; }
{KEY_}content{_KEY}      { cout << " content"; return CONTENT; }
{KEY_}block{_KEY}        { cout << " block"; return BLOCK; }
{KEY_}text{_KEY}         { cout << " text"; return TEXT; }
{KEY_}value{_KEY}        { cout << " value"; return VALUE; }

{TEXT}  { yylval.string = unquote(yytext,yyleng); cout << " str : " << yylval.string; return STR_VALUE; }
{COLOR} { yylval.string = unquote(yytext,yyleng); cout << " str : " << yylval.string; return COLOR_VALUE; }

[ \t]   { cout << " "; }
{EOL}   { cout << endl; }
.       { cout << endl << "Error - raw text : '" << yytext[0] << "'" << endl; exit(1); }

%%

char* unquote(char* input, int length) {
    char* tmp = strdup(input);
    tmp++[length-1] = '\0';
    return tmp;
}