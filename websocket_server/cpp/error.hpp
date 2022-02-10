#include <iostream>
#include <string>

#define PROCESS_VAL(p) case(p): s = #p; break;

using namespace std;

enum class ErrorType {
    internal,
    input,
    generation
};

std::ostream& operator<<(std::ostream& out, const ErrorType value) {
    const char* s = 0;
    switch(value){
        PROCESS_VAL(ErrorType::internal);
        PROCESS_VAL(ErrorType::input);
        PROCESS_VAL(ErrorType::generation);
    }
    return out << s;
}

enum class ErrorObject {
    no_files_transmitted,
    defaultPage_already_defined,
    defaultPage_no_value,
    template_not_found
};

std::ostream& operator<<(std::ostream& out, const ErrorObject value) {
    const char* s = 0;
    switch(value){
        PROCESS_VAL(ErrorObject::defaultPage_already_defined);
        PROCESS_VAL(ErrorObject::defaultPage_no_value);
        PROCESS_VAL(ErrorObject::template_not_found);
    }
    return out << s;
}

void displayError(ErrorType type, ErrorObject object, string msg) {
    cout << "error" << endl << type << "-" << object << "-" << msg << endl;
    exit(1);
}
