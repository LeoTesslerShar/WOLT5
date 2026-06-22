#ifndef COMMANDMANAGER_H
#define COMMANDMANAGER_H

#include "ICommand.h"
#include <map>
#include <string>
#include <vector>

// Dispatches parsed input to the matching ICommand
class CommandManager {
public:
    void registerCommand(const std::string& name, ICommand* cmd);
    void executeCommand(const std::string& commandName, IIO& io);

private:
    std::map<std::string, ICommand*> m_commands;
};

#endif
