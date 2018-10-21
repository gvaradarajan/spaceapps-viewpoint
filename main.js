const WorldWindowWrapper = require('./setupWorldView');
const {fetchSats, fetchSatelliteCoordinates} = require('./fetch.js')

function subscribeHandlers(wwObj) {
    $('#timeSlider').on('change', () => {
        wwObj.timePercent = $('#timeSlider').val();
        wwObj.replaceSatellites();
    })
    $('#datePicker').on('change', () => {
        let date = $('#datePicker').val()
        let startTime = date + 'T00:00:00+5:00';
        let endTime = date + 'T11:59:59+5:00';
        fetchSatelliteCoordinates(wwObj, startTime, endTime);
    })
}

function main() {
    let wwd = new WorldWind.WorldWindow("canvasOne");
    worldWindow = new WorldWindowWrapper(wwd);
    worldWindow.setupWorldView();
    fetchSats().then(
        (res) => {
            worldWindow.satelliteIds = res;
            fetchSatelliteCoordinates(
                worldWindow, '2017-10-20T15:53:00+05:00', '2018-10-20T15:53:00+05:00');
        }
    );
    subscribeHandlers(worldWindow);
}

$(main);