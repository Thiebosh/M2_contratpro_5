%option noyywrap
%{
    #include "compiled.bison.cpp"
    #include <string>
%}

TEXT    [0-9A-Za-z_ ]*
HEXA    [0-9a-fA-F]
EOL     \r\n|\r|\n

%%

"{" { cout << " {"; return OPEN_DOC; }
"}" { cout << " }"; return CLOSE_DOC; }
"[" { cout << " ["; return OPEN_ARRAY; }
"]" { cout << " ]"; return CLOSE_ARRAY; }
,   { cout << " ,"; return NEXT; }

"\"root\":"         { cout << " root"; return ROOT; }
"\"screen\":"       { cout << " screen"; return SCREEN; }
"\"name\":"         { cout << " name"; return NAME; }
"\"style\":"        { cout << " style"; return STYLE; }
"\"align\":"        { cout << " align"; return ALIGN; }
"\"color\":"        { cout << " color"; return COLOR; }
"\"decoration\":"   { cout << " decoration"; return DECO; }
"\"content\":"      { cout << " content"; return CONTENT; }
"\"block\":"        { cout << " block"; return BLOCK; }
"\"text\":"         { cout << " text"; return TEXT; }
"\"value\":"        { cout << " value"; return VALUE; }

["]{TEXT}["]                     { yylval.string = strdup(yytext); yylval.string++[yyleng-1] = '\0'; cout << " str : " << yylval.string; return STR_VALUE; }
["]#({HEXA}{6}|{HEXA}{3})["]  { yylval.string = strdup(yytext); yylval.string++[yyleng-1] = '\0'; cout << " str : " << yylval.string; return COLOR_VALUE; }

[ ]     { cout << " "; }
\t      { cout << " tab"; }
{EOL}   { cout << endl; }
.       { cout << " raw text : " << yytext[0]; return yytext[0]; }

%%