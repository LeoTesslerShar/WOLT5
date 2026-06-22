#ifndef ADDCOMMAND_H
#define ADDCOMMAND_H

#include "ICommand.h"
#include "IDataManager.h"
#include "RecommendationSystem.h"

// Handles POST [userid] [productid1] ... — creates a new user with the given products.
class AddCommand : public ICommand {
public:
    AddCommand(IDataManager& dm, RecommendationSystem& rs);
    void execute(IIO& io) override;
private:
    IDataManager& m_dataManager;
    RecommendationSystem& m_system;
};

#endif
