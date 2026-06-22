#ifndef HELPCOMMAND_H
#define HELPCOMMAND_H

#include "ICommand.h"

// Handles HELP — prints all available commands in alphabetical order.
class HelpCommand : public ICommand {
public:
    HelpCommand() = default;
    void execute(IIO& io) override;
};

#endif