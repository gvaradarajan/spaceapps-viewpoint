const WorldWindowWrapper = require('./setupWorldView');
const {fetchSats, fetchSatelliteCoordinates} = require('./fetch.js')

function main() {
    let wwd = new WorldWind.WorldWindow("canvasOne");
    worldWindow = new WorldWindowWrapper(wwd);
    worldWindow.setupWorldView();
    fetchSats().then((res) => {worldWindow.satelliteIds = res;});
    fetchSatelliteCoordinates(worldWindow);
}

$(main);