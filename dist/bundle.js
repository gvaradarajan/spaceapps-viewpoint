/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./fetch.js":
/*!******************!*\
  !*** ./fetch.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const parseXml = __webpack_require__(/*! ./parser */ "./parser.js");

function fetchSats() {
    let requestParams = {
        contentType: 'application/xml',
        url: 'https://sscweb.sci.gsfc.nasa.gov/WS/sscr/2/observatories'
    }
    let satsRequest = $.ajax(requestParams).then((res) => {
        let ids = [];
        let parsed = parseXml(res);
        sats = parsed.ObservatoryResponse.Observatory;
        for (sat of sats) {ids.push(sat.Id['#text']);}
        return ids;
    })
    return satsRequest;
}

function buildSatelliteRequest(startTime, endTime, satelliteIds) {
    let xmlBegin = '<?xml version="1.0" encoding="UTF-8" ?>';

    let timeTag = `<TimeInterval><Start>${startTime}</Start><End>${endTime}</End></TimeInterval>`;

    satTag = ''
    for ([index, satId] of satelliteIds.entries()) {
        if (index < 152) {
            satTag += `<Satellites><Id>${satId}</Id><ResolutionFactor>2</ResolutionFactor></Satellites>`;
        }
    };

    let allFiltersTag = '<AllLocationFilters>true</AllLocationFilters>';
    let coordinateTag = '';
    let axes = ['X', 'Y', 'Z'];
    let baseAxisTag = '<CoordinateOptions><CoordinateSystem>Geo</CoordinateSystem>';
    for (axis of axes) {
        let thisAxisTag = `${baseAxisTag}<Component>${axis}</Component></CoordinateOptions>`;
        coordinateTag += thisAxisTag
    };
    let minMaxTag = '<MinMaxPoints>2</MinMaxPoints>';
    let outputOptionsInner = allFiltersTag + coordinateTag + minMaxTag;
    let outputOptionsTag = `<OutputOptions>${outputOptionsInner}</OutputOptions>`;

    let requestXML = timeTag + satTag + outputOptionsTag;
    let withDataRequest = `<DataRequest xmlns="http://sscweb.gsfc.nasa.gov/schema">${requestXML}</DataRequest>`;
    let result = xmlBegin + withDataRequest;
    return result;
}

function getIdChunks(satelliteIds) {
    chunkSize = 50;
    numIds = satelliteIds.length;
    chunks = []
    for (let i=0; i < numIds; i+=(chunkSize+1)) {
        chunks.push(satelliteIds.slice(i, i + chunkSize));
    }
    return chunks;
}

function fetchSatelliteCoordinates(windowObject, startTime, endTime) {
    let idChunks = getIdChunks(windowObject.satelliteIds)
    let totalIds = windowObject.satelliteIds.length
    console.log('Nunchuks: ' + idChunks.length)
    for (ids of idChunks) {
        let xmlData = buildSatelliteRequest(
            startTime, endTime, ids);
        let requestParams = {
            contentType: 'application/xml',
            url: 'https://sscweb.sci.gsfc.nasa.gov/WS/sscr/2/locations',
            method: 'POST',
            data: xmlData
        }
        let locationsRequest = $.ajax(requestParams).then(
            (res) => {
                let parsed = parseXml(res, ['Data', 'Time', 'X', 'Y', 'Z']);
                for (satellite of parsed.Response.Result.Data) {
                    let satelliteId = satellite.Id["#text"];
                    let times = satellite.Time;
                    for (const [idx, time] of times.entries()) {
                        let coordinates = [
                            parseFloat(satellite.Coordinates.X[idx]["#text"]),
                            parseFloat(satellite.Coordinates.Y[idx]["#text"]),
                            parseFloat(satellite.Coordinates.Z[idx]["#text"])
                        ];
                        if (coordinates[2] < 0) {
                            coordinates[2] = -coordinates[2]
                        }
                        windowObject.addSatelliteData(
                            satelliteId,
                            time["#text"],
                            coordinates
                        );
                    }
                };
                windowObject.placeSatellites(ids);
                // console.log('Put satellite render logic here')
                // console.log(windowObject.satellitePositions)
            }
        )
    };
}

module.exports = {fetchSatelliteCoordinates, fetchSats};

/***/ }),

/***/ "./main.js":
/*!*****************!*\
  !*** ./main.js ***!
  \*****************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const WorldWindowWrapper = __webpack_require__(/*! ./setupWorldView */ "./setupWorldView.js");
const {fetchSats, fetchSatelliteCoordinates} = __webpack_require__(/*! ./fetch.js */ "./fetch.js")

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

/***/ }),

/***/ "./parser.js":
/*!*******************!*\
  !*** ./parser.js ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports) {

function parseXml(xmlObj, arrayTags) {
    // var dom = null;
    // if (window.DOMParser) {
    //     dom = (new DOMParser()).parseFromString(xml, "text/xml");
    // }
    // else if (window.ActiveXObject)
    // {
    //     dom = new ActiveXObject('Microsoft.XMLDOM');
    //     dom.async = false;
    //     if (!dom.loadXML(xml))
    //     {
    //         throw dom.parseError.reason + " " + dom.parseError.srcText;
    //     }
    // }
    // else {throw "cannot parse xml string!";}

    function isArray(o) {
        return Object.prototype.toString.apply(o) === '[object Array]';
    }

    function parseNode(xmlNode, result) {
        if (xmlNode.nodeName == "#text") {
            var v = xmlNode.nodeValue;
            if (v.trim()) {
               result['#text'] = v;
            }
            return;
        }

        var jsonNode = {};
        var existing = result[xmlNode.nodeName];
        if (existing) {
            if(!isArray(existing)) {
                result[xmlNode.nodeName] = [existing, jsonNode];
            }
            else {result[xmlNode.nodeName].push(jsonNode);}
        }
        else
        {
            if(arrayTags && arrayTags.indexOf(xmlNode.nodeName) != -1) {
                result[xmlNode.nodeName] = [jsonNode];
            }
            else {
                result[xmlNode.nodeName] = jsonNode;
            }
        }

        if(xmlNode.attributes) {
            var length = xmlNode.attributes.length;
            for(var i = 0; i < length; i++) {
                var attribute = xmlNode.attributes[i];
                jsonNode[attribute.nodeName] = attribute.nodeValue;
            }
        }

        var length = xmlNode.childNodes.length;
        for(var i = 0; i < length; i++) {
            parseNode(xmlNode.childNodes[i], jsonNode);
        }
    }

    var result = {};
    if(xmlObj.childNodes.length) {
        parseNode(xmlObj.childNodes[0], result);
    }
    return result;
}

module.exports = parseXml;

/***/ }),

/***/ "./setupWorldView.js":
/*!***************************!*\
  !*** ./setupWorldView.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {


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
        this.addLayer(modelLayer);
        console.log(WorldWind.configuration.baseUrl + 'examples/collada_models/duck/');
        var config = { dirPath: WorldWind.configuration.baseUrl + 'examples/collada_models/duck/' };
        for (let satelliteId of ids) {
            if (this.satellitePositions[satelliteId]) {
                let times = Object.keys(this.satellitePositions[satelliteId])
                if (times) {
                    let timeIdx = Math.round(this.timePercent / times.length)
                    let time = times[timeIdx]
                    let coordinates = this.satellitePositions[satelliteId][time];
                    console.log(this.satellitePositions[satelliteId])
                    let position = new WorldWind.Position(
                        coordinates[0], coordinates[1], coordinates[2]
                    );
                    let colladaLoader = new WorldWind.ColladaLoader(position, config);
                    // REVISIT - use Aura_27.dae and then eventually pull correct models per
                    // satellite
                    colladaLoader.load("duck.dae", (colladaModel) => {
                        colladaModel.scale = 4000;
                        this.layers['Satellite Layer'].addRenderable(colladaModel);
                    });
                }
            }
        }
    }

}

module.exports = WorldWindowWrapper;

/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map