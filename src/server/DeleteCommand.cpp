#include "DeleteCommand.h"
#include <sstream>
#include <vector>
#include <unordered_set>

DeleteCommand::DeleteCommand(IDataManager& dataManager, RecommendationSystem& system)
    : m_dataManager(dataManager), m_system(system) {}

void DeleteCommand::execute(IIO& io) {
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

    std::vector<int> productsToDelete;
    int productId;
    
    // Read all products requested for deletion
    while (iss >> productId) {
        productsToDelete.push_back(productId);
    }

    // Ensure at least one product was specified
    if (productsToDelete.empty()) {
        sendBadRequest(io);
        return;
    }

    // false means user doesn't exist
    bool success = m_dataManager.removeUserActivity(userId, productsToDelete);

    if (!success) {
        sendNotFound(io);
    } else {
        // update in-memory system to match the file
        std::unordered_set<int> productSet(productsToDelete.begin(), productsToDelete.end());
        m_system.removeProducts(userId, productSet);
        sendNoContent(io);
    }
}