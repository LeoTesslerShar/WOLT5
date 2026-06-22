#include "AddCommand.h"
#include <sstream>
#include <vector>

AddCommand::AddCommand(IDataManager& dm, RecommendationSystem& rs)
    : m_dataManager(dm), m_system(rs) {}

void AddCommand::execute(IIO& io) {
    std::string input = io.readLine();
    if (input.empty()) {
        sendBadRequest(io);
        return;
    }

    std::istringstream iss(input);
    int userId;
    if (!(iss >> userId)) {
        sendBadRequest(io);
        return;
    }

    // POST is only valid for new users; existing user → 404
    if (m_dataManager.doesUserExist(userId)) {
        sendNotFound(io);
        return;
    }

    std::vector<int> products;
    int productId;
    while (iss >> productId) {
        products.push_back(productId);
    }

    if (products.empty()) {
        sendBadRequest(io);
        return;
    }

    // update both in-memory system and persistent file
    std::unordered_set<int> productSet(products.begin(), products.end());
    m_system.addProducts(userId, productSet);
    m_dataManager.patchUserActivity(userId, products);
    
    sendCreated(io); 
}