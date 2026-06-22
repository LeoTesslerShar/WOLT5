#ifndef SERVER_H
#define SERVER_H

#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>

// Manages the TCP listener socket: bind, listen, accept.
class Server {
    private:
        int m_port;
        int m_server; // file descriptor of the listening socket

    public:
        Server(int port);   // saves port, does not bind yet
        ~Server();          // calls close()
        void start();       // creates socket, binds to port, starts listening
        int acceptClient(); // blocks until a client connects; returns the client socket fd
        void close();
};

#endif
