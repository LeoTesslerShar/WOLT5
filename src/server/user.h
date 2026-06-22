#ifndef USER_H
#define USER_H

#include <unordered_set>

// Represents a single user and their set of watched products.
class User {
private:
    int id;
    std::unordered_set<int> watchedProducts;

public:
    User() = default;
    User(int userId);

    void addWatchedProducts(const std::unordered_set<int>& products);
    void removeWatchedProducts(const std::unordered_set<int>& products);
    const std::unordered_set<int>& getWatchedProducts() const;
    int getId() const;
};

#endif