
class WorldWindowWrapper {
    
    constructor() {
        this.wwd = new WorldWind.WorldWindow("canvasOne");
        this.overlay = $('#overlay');
        this.layers = {}
    }

    addLayer(layer) {
        this.layers[layer.constructor.name] = layer;
        return this.wwd.addLayer(layer);
    }

    setupWorldView() {
        let layers = [
            new WorldWind.BMNGOneImageLayer(),
            new WorldWind.BMNGLandsatLayer(),
            new WorldWind.CompassLayer(),
        ];

        for (let layer of layers) {
            this.addLayer(layer);
        };
        this.addLayer(new WorldWind.CoordinatesDisplayLayer(this.wwd));
        this.addLayer(new WorldWind.ViewControlsLayer(this.wwd));
    }
}

export default WorldWindowWrapper;