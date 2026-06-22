#include "PatchCommand.h"
#include <sstream>
#include <vector>
#include <unordered_set>

PatchCommand::PatchCommand(IDataManager& dataManager, RecommendationSystem& system)
    : m_dataManager(dataManager), m_system(system) {}

void PatchCommand::execute(IIO& io) {
    std::string input = io.readLine();

    // Validate input format
    if (input.empty()) {
        sendBadRequest(io);
        return;
    }

    std::istringstream iss(input);
    int userId;
    
    // Attempt to extract the user ID
    if (!(iss >> userId)) {
        sendBadRequest(io);
        return;
    }

    // Check if user exists directly in the command
    if (!m_dataManager.doesUserExist(userId)) {
        sendNotFound(io);
        return;
    }

    std::vector<int> newProducts;
    int productId;
    
    // Extract all product IDs
    while (iss >> productId) {
        newProducts.push_back(productId);
    }

    if (newProducts.empty()) {
        sendBadRequest(io);
        return;
    }

    // update both in-memory system and persistent file
    std::unordered_set<int> productSet(newProducts.begin(), newProducts.end());
    m_system.addProducts(userId, productSet);
    m_dataManager.patchUserActivity(userId, newProducts);

    sendNoContent(io);
}