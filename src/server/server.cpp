#include "server.h"
#include <iostream>
#include <stdio.h>
#include <string.h>

using namespace std;

Server :: Server(int port) {
    m_port = port;
}

void Server :: start() {
    // create TCP socket
    m_server = socket(AF_INET, SOCK_STREAM, 0);
    if (m_server < 0) {
        perror("error creating socket");
    }

    // bind socket to port on all interfaces
    struct sockaddr_in sin;
    memset(&sin, 0, sizeof(sin));
    sin.sin_family = AF_INET;
    sin.sin_addr.s_addr = INADDR_ANY;  // accept connections on any network interface
    sin.sin_port = htons(m_port);      // convert port to network byte order
    if (bind(m_server, (struct sockaddr *) &sin, sizeof(sin)) < 0) {
        perror("error binding to socket");
    }

    // start listening, SOMAXCONN = max pending connections allowed by OS
    if (listen(m_server, SOMAXCONN) < 0) {
        perror("error listening on socket");
    }
}

int Server :: acceptClient() {
    // block until a client connects, fill 'from' with client's address info
    struct sockaddr_in from;
    socklen_t from_len = sizeof(from);
    int clientSock = accept(m_server, (struct sockaddr *) &from, &from_len);
    if (clientSock < 0) {
        perror("error accepting client");
    }
    return clientSock;  // caller uses this socket to communicate with the client
}

void Server :: close() {
#ifdef _WIN32
    closesocket(m_server);
    WSACleanup();
#else
    ::close(m_server);  // :: needed to avoid collision with Server::close()
#endif
}

Server :: ~Server() {
    close();
}
