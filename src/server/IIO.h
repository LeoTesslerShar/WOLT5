#ifndef IIO_H
#define IIO_H

#include <string>

// Abstracts the I/O channel so commands work over any transport (socket, console, test mock).
class IIO {
public:
    virtual std::string readLine() = 0;        // reads one line, blocks until available
    virtual void writeLine(std::string msg) = 0; // sends one line to the client
    virtual ~IIO() {}
};

#endif
