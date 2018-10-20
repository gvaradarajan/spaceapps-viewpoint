const WorldWindowWrapper = require('./setupWorldView');

function main() {
    let wwd = new WorldWind.WorldWindow("canvasOne");
    worldWindow = new WorldWindowWrapper(wwd);
    worldWindow.setupWorldView();
}

$(main);