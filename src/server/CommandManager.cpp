#include "CommandManager.h"
#include <algorithm>
#include <cctype>

void CommandManager::registerCommand(const std::string& name, ICommand* cmd) {
    m_commands[name] = cmd;
}

void CommandManager::executeCommand(const std::string& commandName, IIO& io) {
    if (commandName.empty()) {
        io.writeLine("400 Bad Request\n");
        return;
    }

    // normalize to uppercase so dispatch is case-insensitive
    std::string normalizedCmd = commandName;
    std::transform(normalizedCmd.begin(), normalizedCmd.end(), normalizedCmd.begin(), ::toupper);

    auto it = m_commands.find(normalizedCmd);
    if (it != m_commands.end()) {
        it->second->execute(io);
    } else {
        io.writeLine("400 Bad Request\n");
    }
}