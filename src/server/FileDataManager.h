#ifndef FILEDATAMANAGER_H
#define FILEDATAMANAGER_H

#include "IDataManager.h"
#include <string>

// IDataManager implementation that persists user-product data to a plain-text file.
class FileDataManager : public IDataManager {
public:
    void patchUserActivity(int userId, const std::vector<int>& productIds) override;
    bool removeUserActivity(int userId, const std::vector<int>& productIds) override;
    std::map<int, std::set<int>> loadAllData() override;
    void resetDatabase() override;
    bool doesUserExist(int userId) override;

private:
    static inline const std::string DB_PATH = "../data/dataBase.txt";
};

#endif
