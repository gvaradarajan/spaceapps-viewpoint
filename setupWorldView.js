
class WorldWindowWrapper {

    constructor(wwd) {
        this.wwd = wwd;
        this.layers = {};
        this.satellitePositions = {};
        this.satelliteIds = [];
        this.timePercent = 0;
    }

    addLayer(layer) {
        this.layers[layer.displayName] = layer;
        return this.wwd.addLayer(layer);
    }

    addSatelliteData(satelliteId, time, coordinates) {
        if (!this.satellitePositions[satelliteId]) {
            this.satellitePositions[satelliteId] = {};
        }
        this.satellitePositions[satelliteId][time] = coordinates;
    }

    setupWorldView() {
        let layers = [
            new WorldWind.BMNGOneImageLayer(),
            new WorldWind.BMNGLandsatLayer(),
        ];

        for (let layer of layers) {
            this.addLayer(layer);
        };
        this.addLayer(new WorldWind.CoordinatesDisplayLayer(this.wwd));
        this.addLayer(new WorldWind.ViewControlsLayer(this.wwd));
    }


    replaceSatellites() {
        this.placeSatellites(this.satelliteIds);
    }

    placeSatellites(ids) {
        let modelLayer = new WorldWind.RenderableLayer('Satellite Layer');
        console.log(modelLayer)
        this.addLayer(modelLayer);
        console.log(WorldWind.configuration.baseUrl + 'examples/collada_models/duck/');
        var config = { dirPath: WorldWind.configuration.baseUrl + 'examples/collada_models/duck/' };
        for (let satelliteId of ids) {
            console.log(satelliteId)
            console.log(this.satellitePositions[satelliteId])
            if (this.satellitePositions[satelliteId]) {
                let times = Object.keys(this.satellitePositions[satelliteId])
                if (times) {
                    let timeIdx = Math.round(this.timePercent / times.length)
                    let time = times[timeIdx]
                    let coordinates = this.satellitePositions[satelliteId][time];
                    let position = new WorldWind.Position(
                        coordinates[0], coordinates[1], coordinates[2]
                    );
                    let colladaLoader = new WorldWind.ColladaLoader(position, config);
                    colladaLoader.load("duck.dae", (colladaModel) => {
                        colladaModel.scale = 9000;
                        console.log(this.layers)
                        this.layers['Satellite Layer'].addRenderable(colladaModel);
                    });
                }
            }
        }
    }

}

module.exports = WorldWindowWrapper;