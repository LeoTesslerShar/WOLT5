#include "app.h"
#include "inputParser.h"
#include "SocketIO.h"
#include "BufferedIO.h"
#include <iostream>
#include <string>
#include <vector>

// register all commands once at startup
App::App(int port) : m_port(port), m_server(port),
                     m_addCommand(m_dataManager, m_system),
                     m_recommendCommand(m_system),
                     m_patchCommand(m_dataManager, m_system),
                     m_deleteCommand(m_dataManager, m_system) {
    m_commandManager.registerCommand("POST", &m_addCommand);
    m_commandManager.registerCommand("GET", &m_recommendCommand);
    m_commandManager.registerCommand("PATCH", &m_patchCommand);
    m_commandManager.registerCommand("DELETE", &m_deleteCommand);
    m_commandManager.registerCommand("HELP", &m_helpCommand);
}

void App::run() {
    loadData();
    m_server.start();
    // block-wait for each client, handle one at a time
    while (true) {
        int clientSock = m_server.acceptClient();
        SocketIO io(clientSock);  // wraps socket in IIO interface
        handleClient(io);         // SocketIO destructor closes socket when done
    }
}

void App::handleClient(IIO& io) {
    try {
        std::string line;
        while (true) {
            line = io.readLine();  // blocks until client sends a line
            std::vector<std::string> parsed = InputParser::parse(line);
            if (!parsed.empty()) {
                if (parsed.size() > 1) {
                    // args on same line as command — buffer them for the command to read
                    std::string args;
                    for (size_t i = 1; i < parsed.size(); ++i) {
                        if (i > 1) args += " ";
                        args += parsed[i];
                    }
                    BufferedIO bufferedIo(io, args);
                    m_commandManager.executeCommand(parsed[0], bufferedIo);
                } else {
                    // no args on this line — command reads the next line itself
                    m_commandManager.executeCommand(parsed[0], io);
                }
            }
        }
    } catch (...) {
        // readLine() throws when client disconnects — exit handler cleanly
    }
}

void App::loadData() {
    // restore all users and their products from file into memory on startup
    auto allData = m_dataManager.loadAllData();
    for (auto& [userId, products] : allData) {
        m_system.addProducts(userId, std::unordered_set<int>(products.begin(), products.end()));
    }
}
