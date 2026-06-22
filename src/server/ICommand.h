#ifndef ICOMMAND_H
#define ICOMMAND_H

#include "IIO.h" 

// Base interface for all commands. Each command reads its arguments from io and writes its response to io.
class ICommand {
    public:
    virtual void execute(IIO& io) = 0;
    virtual ~ICommand() = default;

    protected:
    void sendBadRequest(IIO& io) { io.writeLine("400 Bad Request\n"); }
    void sendNotFound(IIO& io)   { io.writeLine("404 Not Found\n"); }
    void sendNoContent(IIO& io)  { io.writeLine("204 No Content\n"); }
    void sendCreated(IIO& io)    { io.writeLine("201 Created\n"); }
};

#endif