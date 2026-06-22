#ifndef RECOMMENDATION_SYSTEM_H
#define RECOMMENDATION_SYSTEM_H

#include "user.h"
#include <unordered_map>
#include <unordered_set>
#include <vector>

// In-memory recommendation engine. Scores candidate products by similarity between users.
class RecommendationSystem {
private:
    std::unordered_map<int, User> users;

public:
    void addProducts(int userId, const std::unordered_set<int>& products);
    void removeProducts(int userId, const std::unordered_set<int>& products);
    std::unordered_set<int> getUserProducts(int userId) const;
    bool userExists(int userId) const;
    // Returns up to 10 recommended products for userId, ranked by weighted similarity score.
    std::vector<int> recommend(int userId, int productId) const;
};

#endif