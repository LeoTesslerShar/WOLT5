#include "DataManager.h"
#include <fstream>
#include <sstream>

void DataManager::saveUserActivity(int id, const std::vector<int>& data) {
    //open file with appand
    std::ofstream outFile(DB_PATH, std::ios::app);
    //check if file is open
    if (outFile.is_open()) {
        // write user ID
        outFile << id;
        //write vector in line
        for (int productId : data) {
            outFile << " " << productId;
        }
        //newline
        outFile << "\n";
        //maually close
        outFile.close();
    }
}


std::map<int, std::set<int>> DataManager::loadAllData() {
    //initial empty map
    std::map<int, std::set<int>> allData;
    //write from file to map
    std::ifstream inFile(DB_PATH);
    // if there isn't file currently
    if (!inFile) return allData;
    std::string line;

    // read each line until EOF
    while (std::getline(inFile, line)) {
        std::stringstream ss(line);
        int userId;
        
        // first word in line is user id
        if (ss >> userId) {
            int productId;
            // the rest is products
            while (ss >> productId) {
                allData[userId].insert(productId);
            }
        }
    }
    inFile.close();
    return allData;
}

void DataManager::resetDatabase() {
    // trunc- delete all database file
    std::ofstream outFile(DB_PATH, std::ios::trunc);
    outFile.close();
}
