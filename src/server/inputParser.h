#ifndef INPUT_PARSER_H
#define INPUT_PARSER_H
#include <vector>
#include <string>
#include <unordered_set>
#include <iostream>

// Parses a raw input line into tokens, deduplicating repeated values.
class InputParser {
public:
    static std::vector<std::string> parse(const std::string& input);
    static std::unordered_set<int> makeSet(const std::vector<std::string>& input);

private:
    static void readUniqueWords(std::istream& stream, std::vector<std::string>& inputs, std::unordered_set<std::string>& seen);
};
#endif