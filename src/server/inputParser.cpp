#include "inputParser.h"
#include <sstream>
#include <unordered_set>
#include <vector>
#include <string>         

using namespace std;

// Splits input into tokens, removing duplicates while preserving order.
vector<string> InputParser::parse(const string& input) {
    vector<string> inputs;
    istringstream stream(input);
    unordered_set<string> seen;
    readUniqueWords(stream, inputs, seen);
    return inputs;
}

// Reads tokens from stream, skipping any already seen (deduplication).
void InputParser::readUniqueWords(istream& stream, vector<string>& inputs, unordered_set<string>& seen) {
    string word;
    // Read the line
    while (stream >> word) {
        // Check for duplicates
        if (seen.find(word) == seen.end()) {
            inputs.push_back(word);
            seen.insert(word);
        }
    }
}

// Converts tokens[2..] to an integer set (skips command name and userId).
unordered_set<int> InputParser::makeSet(const vector<string>& input) {
    unordered_set<int> productIds;
    for (size_t i = 2; i < input.size(); ++i) {
        productIds.insert(stoi(input[i]));
    }

    return productIds;
}
