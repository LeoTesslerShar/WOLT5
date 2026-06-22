#include "app.h"
#include <iostream>

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: ./app <port>" << std::endl;
        return 1;
    }
    int port = std::stoi(argv[1]);
    App myApp(port);
    myApp.run();
    return 0;
}
