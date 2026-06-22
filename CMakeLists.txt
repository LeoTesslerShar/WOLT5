cmake_minimum_required(VERSION 3.14)
project(RecommendationSystem)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(app
    src/server/main.cpp
    src/server/app.cpp
    src/server/inputParser.cpp
    src/server/RecommendationSystem.cpp
    src/server/user.cpp
    src/server/FileDataManager.cpp
    src/server/CommandManager.cpp
    src/server/AddCommand.cpp
    src/server/HelpCommand.cpp
    src/server/RecommendCommand.cpp
    src/server/PatchCommand.cpp
    src/server/DeleteCommand.cpp
    src/server/server.cpp
    src/server/SocketIO.cpp
)

