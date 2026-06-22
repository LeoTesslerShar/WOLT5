#include "HelpCommand.h"
#include <iostream>

using namespace std;

void HelpCommand::execute(IIO& io) {
    string helpOutput = 
        "DELETE, arguments: [userid] [productid1] [productid2] ...\n"
        "GET, arguments: [userid] [productid]\n"
        "PATCH, arguments: [userid] [productid1] [productid2] ...\n"
        "POST, arguments: [userid] [productid1] [productid2] ...\n"
        "help\n";

    io.writeLine(helpOutput);
}