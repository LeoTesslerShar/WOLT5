#include "SocketIO.h"
#include <sys/socket.h>
#include <unistd.h>
#include <stdexcept>

// save client socket descriptor for all future reads/writes
SocketIO::SocketIO(int clientFD) {
    m_clientFD = clientFD;
}

// close client socket when object is destroyed
SocketIO::~SocketIO() {
    ::close(m_clientFD);
}

std::string SocketIO::readLine() {
    std::string result;
    char c;
    // read one byte at a time until newline — avoids buffering issues
    while (true) {
        int bytes = recv(m_clientFD, &c, 1, 0);
        if (bytes <= 0) {
            // bytes == 0 means client disconnected, bytes < 0 means error
            throw std::runtime_error("connection closed");
        }
        if (c == '\n') break;
        result += c;
    }
    return result;
}

void SocketIO::writeLine(std::string msg) {
    msg += "\n";  // protocol expects newline-terminated messages
    send(m_clientFD, msg.c_str(), msg.size(), 0);
}
