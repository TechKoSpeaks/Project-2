//Global States
const broughtByPlayer = "broughtByPlayer";
const broughtByOpponent = "broughtByOpponent";

let map;
const playerResourceInventory = 0;
createMap();
updateLandArray();

function updateLandArray() {
  $.get("/api/lands", (data) => {
    data.forEach(land => {
      States[land.code] = land;
      console.log(land.code);
      console.log(States[land.code]);
    })
    console.log(data);
  })
}

function createMap() {
  $("#mapDiagram").empty();
  map = new Datamap({
    element: document.getElementById("mapDiagram"),
    scope: "usa",
    done: function (datamap) {
      datamap.svg.selectAll(".datamaps-subunit").on("click", geography => {
        //Do nothing if land is already owned
        if (geography.is_owned) {
          return;
        }
        changeOwnership(geography);
        // purchaseLand(geography);
        setLandColor(geography);
        createMap();
      });
    },
    geographyConfig: {
      highlightBorderColor: "#bada55",
      popupTemplate: function (land, data) {
        const i = `<div class="hoverinfo">${land.properties.name}
        Resource Cost: ${data.resource_cost} `;
        return i;
      },
      popupOnHover: true,
      highlightBorderWidth: 3
    },
    fills: {
      [broughtByPlayer]: "#228B22",
      [broughtByOpponent]: "#B22222",
      defaultFill: "#D3D3D3"
    },
    data: States
  });
}

//see land-api-routes. 
//In there, will check on server side if user has enough resources to purchase land
function purchaseLand(geography, callback) {
  $.ajax({
    url: `/api/lands/${geography.id}/purchase`,
    type: "PUT"
  })
    .then(data => {
      console.log(data);
      callback(data);
    })
    .fail(error => {
      console.log(error);
    });
}

// when player clicks a state
// if state is owned
// do nothing
// if state is not owned and playerResource >= state resource cost - send request. API-purchase-route
// update state ownshership to owned
// new player resource is equal to player resource - state resource cost
// update player resource to new resource amount
// render map with updated state data

function changeOwnership(geography) {
  const stateTarget = geography.id;
  if (States[stateTarget].is_owned === false) {
    // eslint-disable-next-line camelcase
    States[stateTarget].is_owned = true;
  }
  // getResourceInventory();
}

function setLandColor(geography) {
  const stateTarget = geography.id;
  if (States[stateTarget].is_owned) {
    States[stateTarget].fillKey = broughtByPlayer;
  } else {
    States[stateTarget].fillKey = "defaultFill";
  }
  map.updateChoropleth(States, { reset: true });
}


