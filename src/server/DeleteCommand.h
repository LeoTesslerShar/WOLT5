#ifndef DELETE_COMMAND_H
#define DELETE_COMMAND_H

#include "ICommand.h"
#include "IDataManager.h"
#include "RecommendationSystem.h"
#include "IIO.h"

// Handles DELETE [userid] [productid1] ... — removes products from a user's history.
class DeleteCommand : public ICommand {
private:
    IDataManager& m_dataManager;
    RecommendationSystem& m_system;

public:
    DeleteCommand(IDataManager& dataManager, RecommendationSystem& system);
    void execute(IIO& io) override;
};

#endif