#ifndef SOCKETIO_H
#define SOCKETIO_H

#include <string>
#include "IIO.h"

// IIO over a TCP client socket.
class SocketIO : public IIO {
    private: 
        int m_clientFD;
    
    public: 
        SocketIO(int clientFD);
        ~SocketIO();
        std::string readLine() override;
        void writeLine(std::string msg) override;  
};

#endif
