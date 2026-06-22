#ifndef IDATAMANAGER_H
#define IDATAMANAGER_H

#include <vector>
#include <map>
#include <set>

// Abstracts persistent storage so commands and tests are independent of the file system.
class IDataManager {
public:
    virtual void patchUserActivity(int userId, const std::vector<int>& productIds) = 0; // add/merge products for user
    virtual bool removeUserActivity(int userId, const std::vector<int>& productIds) = 0; // false if user not found
    virtual std::map<int, std::set<int>> loadAllData() = 0; // load full DB into memory at startup
    virtual void resetDatabase() = 0;
    virtual bool doesUserExist(int userId) = 0;
    virtual ~IDataManager() = default;
};

#endif
