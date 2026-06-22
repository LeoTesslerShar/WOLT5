#ifndef APP_H
#define APP_H

#include "FileDataManager.h"
#include "RecommendationSystem.h"
#include "CommandManager.h"
#include "AddCommand.h"
#include "HelpCommand.h"
#include "RecommendCommand.h"
#include "PatchCommand.h"
#include "DeleteCommand.h"
#include "server.h"
#include "IIO.h"

// Composition root: wires all components together and drives the server loop.
class App {
private:
    int m_port;
    FileDataManager m_dataManager;   // persistent storage
    RecommendationSystem m_system;   // in-memory recommendation engine
    CommandManager m_commandManager;
    AddCommand m_addCommand;
    HelpCommand m_helpCommand;
    RecommendCommand m_recommendCommand;
    PatchCommand m_patchCommand;
    DeleteCommand m_deleteCommand;
    Server m_server;

    void loadData(); // populate m_system from file at startup

public:
    App(int port);
    void run();
    void handleClient(IIO& io); // public for testability
};

#endif