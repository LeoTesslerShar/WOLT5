#ifndef DATAMANAGER_H
#define DATAMANAGER_H

#include <string>
#include <vector>
#include <map>
#include <set>

class DataManager {
public:
    // save in database.txt
    void saveUserActivity(int userId, const std::vector<int>& productIds);

    // load map and return it
    std::map<int, std::set<int>> loadAllData();

    // function to reset database file
    void resetDatabase();

private:
    // save the path as static variable
    static inline const std::string DB_PATH = "../data/dataBase.txt";
};

#endif