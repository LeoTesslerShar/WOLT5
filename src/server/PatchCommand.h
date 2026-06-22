#ifndef PATCH_COMMAND_H
#define PATCH_COMMAND_H

#include "ICommand.h"
#include "IDataManager.h"
#include "RecommendationSystem.h"
#include "IIO.h"
#include <string>

// Handles PATCH [userid] [productid1] ... — adds products to an existing user.
class PatchCommand : public ICommand {
private:
    IDataManager& m_dataManager;
    RecommendationSystem& m_system;

public:
    PatchCommand(IDataManager& dataManager, RecommendationSystem& system);
    void execute(IIO& io) override;
};

#endif