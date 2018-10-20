const WorldWindowWrapper = require('./setupWorldView');
const {fetchSats, fetchSatelliteCoordinates} = require('./fetch.js')

function main() {
    let wwd = new WorldWind.WorldWindow("canvasOne");
    worldWindow = new WorldWindowWrapper(wwd);
    worldWindow.setupWorldView();
    fetchSats().then(
        (res) => {
            worldWindow.satelliteIds = res;
            fetchSatelliteCoordinates(
                worldWindow, '2013-09-15T15:53:00+05:00', '2013-09-18T15:53:00+05:00');
        }
    );
}

$(main);