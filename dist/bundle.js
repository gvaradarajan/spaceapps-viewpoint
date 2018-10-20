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

function fetchSatelliteCoordinates(windowObject) {
    let xmlData = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><DataRequest xmlns="http://sscweb.gsfc.nasa.gov/schema"><TimeInterval><Start>2013-09-15T15:53:00+05:00</Start><End>2013-09-18T15:53:00+05:00</End></TimeInterval><BFieldModel><InternalBFieldModel>IGRF-10</InternalBFieldModel><ExternalBFieldModel xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Tsyganenko89cBFieldModel"><KeyParameterValues>KP3_3_3</KeyParameterValues></ExternalBFieldModel><TraceStopAltitude>100</TraceStopAltitude></BFieldModel><Satellites><Id>ace</Id><ResolutionFactor>2</ResolutionFactor></Satellites><OutputOptions><AllLocationFilters>true</AllLocationFilters><CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem><Component>X</Component></CoordinateOptions><CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem><Component>Y</Component></CoordinateOptions><CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem><Component>Z</Component></CoordinateOptions><MinMaxPoints>2</MinMaxPoints></OutputOptions></DataRequest>';
    let requestParams = {
        contentType: 'application/xml',
        url: 'https://sscweb.sci.gsfc.nasa.gov/WS/sscr/2/locations',
        method: 'POST',
        data: xmlData
    }
    let locationsRequest = $.ajax(requestParams).then(
        (res) => {
            let parsed = parseXml(res);
            let satelliteId = parsed.Result.Data.Id["#text"];
            let times = parsed.Result.Data.Time;
            for (const [idx, time] of times.entries()) {
                let coordinates = [
                    parsed.Result.Data.Coordinates.X[idx],
                    parsed.Result.Data.Coordinates.Y[idx],
                    parsed.Result.Data.Coordinates.Z[idx]
                ]
                windowObject.addSatelliteData(
                    satelliteId,
                    time["#text"],
                    coordinates
                );
            }
            console.log(windowObject.satellitePositions);
        }
    )
}

module.exports = fetchSatelliteCoordinates;

/***/ }),

/***/ "./main.js":
/*!*****************!*\
  !*** ./main.js ***!
  \*****************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const WorldWindowWrapper = __webpack_require__(/*! ./setupWorldView */ "./setupWorldView.js");
const fetchSatelliteCoordinates = __webpack_require__(/*! ./fetch.js */ "./fetch.js")

function main() {
    let wwd = new WorldWind.WorldWindow("canvasOne");
    worldWindow = new WorldWindowWrapper(wwd);
    worldWindow.setupWorldView();
    fetchSatelliteCoordinates(worldWindow);
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
    dom = xmlObj.documentElement
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
    if(dom.childNodes.length) {
        parseNode(dom.childNodes[0], result);
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
    }

    addLayer(layer) {
        this.layers[layer.constructor.name] = layer;
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
            new WorldWind.CompassLayer(),
        ];

        for (let layer of layers) {
            this.addLayer(layer);
        };
        this.addLayer(new WorldWind.CoordinatesDisplayLayer(this.wwd));
        this.addLayer(new WorldWind.ViewControlsLayer(this.wwd));
    }
}

module.exports = WorldWindowWrapper;

/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map