const parseXml = require('./parser');

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
    let xmlBegin = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

    let timeTag = `<TimeInterval><Start>${startTime}</Start><End>${endTime}</End></TimeInterval>`;

    let intBFieldTag = '<InternalBFieldModel>IGRF-10</InternalBFieldModel>';
    let externalBFieldTagStart = '<ExternalBFieldModel xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Tsyganenko89cBFieldModel">';
    let keyParamaterTag = '<KeyParameterValues>KP3_3_3</KeyParameterValues>';
    let extBFieldTag = externalBFieldTagStart + keyParamaterTag + '</ExternalBFieldModel>';
    let altTag = '<TraceStopAltitude>100</TraceStopAltitude>';
    let bFieldTagInner = intBFieldTag + extBFieldTag + altTag;
    let bFieldTag = `<BFieldModel>${bFieldTagInner}</BFieldModel>`;

    idsTag = ''
    for (satId of satIds) {
        idsTag += `<Id>${satId}</Id>`
    };

    let satTag = `<Satellites>${idsTag}<ResolutionFactor>2</ResolutionFactor></Satellites>`;

    let allFiltersTag = '<AllLocationFilters>true</AllLocationFilters>';
    let coordinateTag = '';
    let axes = ['X', 'Y', 'Z'];
    let baseAxisTag = '<CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem>';
    for (axis of axes) {
        let thisAxisTag = `${baseAxisTag}<Component>${axis}</Component`;
        coordinateTag += thisAxisTag
    };
    let minMaxTag = '<MinMaxPoints>2</MinMaxPoints>';
    let outputOptionsInner = allFiltersTag + coordinateTag + minMaxTag;
    let outputOptionsTag = `<OutputOptions>%{outputOptionsInner}</OutputOptions`;

    let requestXML = timeTag + bFieldTag + satTag + outputOptionsTag;
    let withDataRequest = `<DataRequest xmlns="http://sscweb.gsfc.nasa.gov/schema">${requestXML}</DataInterval>`;
    let result = xmlBegin + withDataRequest;
    return result;
}

function fetchSatelliteCoordinates(windowObject, startTime, endTime) {
    let xmlData = buildSatelliteRequest(
        windowObject.satelliteIds, startTime, endTime);
    let requestParams = {
        contentType: 'application/xml',
        url: 'https://sscweb.sci.gsfc.nasa.gov/WS/sscr/2/locations',
        method: 'POST',
        data: xmlData
    } 
    let locationsRequest = $.ajax(requestParams).then(
        (res) => {
            let parsed = parseXml(res);
            let satelliteId = parsed.Response.Result.Data.Id["#text"];
            debugger
            let times = parsed.Response.Result.Data.Time;
            for (const [idx, time] of times.entries()) {
                let coordinates = [
                    parsed.Result.Data.Coordinates.X[idx],
                    parsed.Result.Data.Coordinates.Y[idx],
                    parsed.Result.Data.Coordinates.Z[idx]
                ];
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

module.exports = {fetchSatelliteCoordinates, fetchSats};