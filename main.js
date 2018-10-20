const WorldWindowWrapper = require('./setupWorldView');
const fetchSatelliteCoordinates = require('./fetch.js')

function main() {
    let wwd = new WorldWind.WorldWindow("canvasOne");
    worldWindow = new WorldWindowWrapper(wwd);
    worldWindow.setupWorldView();
    fetchSatelliteCoordinates(worldWindow);
}

$(main);