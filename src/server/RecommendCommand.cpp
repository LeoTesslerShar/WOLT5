#include "RecommendCommand.h"
#include <sstream>

RecommendCommand::RecommendCommand(RecommendationSystem& rs) : m_system(rs) {}

void RecommendCommand::execute(IIO& io) {
    std::string input = io.readLine();
    if (input.empty()) {
        sendBadRequest(io);
        return;
    }

    std::istringstream iss(input);
    int userId, productId;

    if (!(iss >> userId >> productId)) {
        sendBadRequest(io);
        return;
    }

    if (!m_system.userExists(userId)) {
        sendNotFound(io);
        return;
    }

    std::vector<int> recs = m_system.recommend(userId, productId);

    // protocol: "200 Ok", blank line, then space-separated product ids
    std::string response = "200 Ok\n\n";
    for (size_t i = 0; i < recs.size(); ++i) {
        response += std::to_string(recs[i]);
        if (i < recs.size() - 1) {
            response += " ";
        }
    }
    io.writeLine(response);
}