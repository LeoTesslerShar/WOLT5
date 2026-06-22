#include "user.h"
#include <unordered_set>

using namespace std;

// Constructor
User::User(int userId) {
    id = userId;
}

// Add all the watched products of the user
void User::addWatchedProducts(const unordered_set<int>& products){
    watchedProducts.insert(products.begin(), products.end());
}

void User::removeWatchedProducts(const unordered_set<int>& products) {
    for (int p : products)
        watchedProducts.erase(p);
}

// Returns the watched products set
const unordered_set<int>& User::getWatchedProducts() const{
    return watchedProducts;
}

// Returns the user's id
int User::getId() const{
    return id;
}