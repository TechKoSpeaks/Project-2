// Requiring our models and passport as we've configured it
const db = require("../models");

module.exports = function(app) {
  // Add a new land
  app.post("/api/lands", (req, res) => {
    db.Land.create(req.body).then(dbLands => {
      res.json(dbLands);
    });
  });

  // Get all lands
  app.get("/api/lands", (req, res) => {
    db.Land.findAll({}).then(dbLands => {
      res.json(dbLands);
    });
  });

  app.put("/api/lands/reset", (req, res) => {
    console.log("update");
    db.Land.update(
      {
        // eslint-disable-next-line camelcase
        is_owned: false,
        fillKey: "defaultFill"
      },
      {
        where: {
          // eslint-disable-next-line camelcase
          is_owned: true
        }
      }
    ).then(dbLand => {
      res.json(dbLand);
    });
  });
  // Route for updating land data
  app.put("/api/lands/:id", (req, res) => {
    db.Land.update(req.body, {
      where: {
        id: req.params.id
      }
    }).then(dbLands => {
      res.json(dbLands);
    });
  });

  // when player clicks a state
  // if state is owned
  // do nothing
  // if state is not owned and playerResource >= state resource cost - send request. API-purchase-route
  // update state ownshership to owned
  // new player resource is equal to player resource - state resource cost
  // update player resource to new resource amount
  // render map with updated state data

  app.put("/api/lands/:code/purchase", (req, res) => {
    Promise.all([
      db.Land.findOne({
        where: {
          code: req.params.code
        }
      }),
      db.Resource.findOne({
        where: {
          id: 1
        }
      })
    ])
      .then(([dbLand, dbResource]) => {
        if (dbLand.is_owned) {
          res.json({
            response: "Already Owned"
          });
          return;
        }
        const resourceRequirement = dbLand.resource_cost;
        const resources = dbResource.inventory;

        if (resources >= resourceRequirement) {
          // eslint-disable-next-line camelcase
          dbLand.is_owned = true;
          dbResource.inventory = resources - resourceRequirement;

          return Promise.all([dbLand.save(), dbResource.save()]);
        }
        return Promise.resolve([]);
      })
      .then(([dbLand, dbResource]) => {
        if (dbLand && dbResource) {
          res.json({
            response: "Successful",
            resource: dbResource
          });
        } else {
          res.json({ response: "Not Enough Resources" });
        }
      })
      .catch(err => {
        console.log(err);
        res.status(400).end();
      });
  });
};
