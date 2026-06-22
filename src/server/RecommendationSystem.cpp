#include "RecommendationSystem.h"
#include <algorithm>

void RecommendationSystem::addProducts(int userId, const std::unordered_set<int>& products) {
    if (users.find(userId) == users.end())
        users.emplace(userId, User(userId));
    users.at(userId).addWatchedProducts(products);
}

void RecommendationSystem::removeProducts(int userId, const std::unordered_set<int>& products) {
    auto it = users.find(userId);
    if (it == users.end()) return;
    it->second.removeWatchedProducts(products);
}

std::unordered_set<int> RecommendationSystem::getUserProducts(int userId) const {
    return users.at(userId).getWatchedProducts();
}

bool RecommendationSystem::userExists(int userId) const {
    return users.find(userId) != users.end();
}

std::vector<int> RecommendationSystem::recommend(int userId, int productId) const {
    if (users.find(userId) == users.end()) return {};

    const auto& targetWatched = users.at(userId).getWatchedProducts();
    std::unordered_map<int, int> scores; // product → accumulated similarity score

    for (const auto& [otherId, otherUser] : users) {
        if (otherId == userId) continue;

        const auto& otherWatched = otherUser.getWatchedProducts();
        if (otherWatched.find(productId) == otherWatched.end()) continue; // other user didn't watch productId

        // similarity = number of products both users watched
        int similarity = 0;
        for (int p : targetWatched)
            if (otherWatched.count(p)) similarity++;

        if (similarity == 0) continue;

        // score every product the other user watched that the target user hasn't seen yet
        for (int p : otherWatched) {
            if (p != productId && !targetWatched.count(p))
                scores[p] += similarity;
        }
    }

    // sort by score descending, break ties by product id ascending
    std::vector<std::pair<int, int>> sorted(scores.begin(), scores.end());
    std::sort(sorted.begin(), sorted.end(), [](const std::pair<int, int>& a, const std::pair<int, int>& b) {
        return a.second != b.second ? a.second > b.second : a.first < b.first;
    });

    std::vector<int> result;
    for (size_t i = 0; i < sorted.size() && i < 10; ++i)
        result.push_back(sorted[i].first);

    return result;
}