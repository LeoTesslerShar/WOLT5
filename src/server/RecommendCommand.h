#ifndef RECOMMEND_COMMAND_H
#define RECOMMEND_COMMAND_H

#include "ICommand.h"
#include "RecommendationSystem.h"

// Handles GET [userid] [productid] — returns up to 10 recommended products.
class RecommendCommand : public ICommand {
private:
    RecommendationSystem& m_system;

public:
    RecommendCommand(RecommendationSystem& rs);
    void execute(IIO& io) override;
};

#endif