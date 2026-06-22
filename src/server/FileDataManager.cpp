#include "FileDataManager.h"
#include <fstream>
#include <sstream>

bool FileDataManager::removeUserActivity(int userId, const std::vector<int>& productIds) {
    auto allData = loadAllData();
    auto it = allData.find(userId);
    
    // If the user doesn't exist, it's a logical error
    if (it == allData.end()) {
        return false; 
    }

    std::set<int> tempProducts = it->second;
    for (int pid : productIds)
        tempProducts.erase(pid); // no-op if product doesn't exist

    it->second = tempProducts;
    std::ofstream outFile(DB_PATH, std::ios::trunc);
    for (auto& [id, products] : allData) {
        outFile << id;
        for (int p : products) {
            outFile << " " << p;
        }
        outFile << "\n";
    }
    
    return true;
}

bool FileDataManager::doesUserExist(int userId) {
    return loadAllData().count(userId) > 0;
}

std::map<int, std::set<int>> FileDataManager::loadAllData() {
    std::map<int, std::set<int>> allData;
    std::ifstream inFile(DB_PATH);
    if (!inFile) return allData;
    std::string line;
    while (std::getline(inFile, line)) {
        std::stringstream ss(line);
        int userId;
        if (ss >> userId) {
            int productId;
            while (ss >> productId) {
                allData[userId].insert(productId);
            }
        }
    }
    inFile.close();
    return allData;
}

void FileDataManager::resetDatabase() {
    std::ofstream outFile(DB_PATH, std::ios::trunc);
    outFile.close();
}

void FileDataManager::patchUserActivity(int userId, const std::vector<int>& productIds) {
    auto allData = loadAllData();
    auto& userProducts = allData[userId];

    bool isModified = false;
    for (int pid : productIds) {
        if (userProducts.insert(pid).second) // insert returns false for duplicates
            isModified = true;
    }

    // skip rewrite if nothing actually changed
    if (isModified) {
        std::ofstream outFile(DB_PATH, std::ios::trunc);
        for (auto& [id, products] : allData) {
            outFile << id;
            for (int p : products) {
                outFile << " " << p;
            }
            outFile << "\n";
        }
    }
}
