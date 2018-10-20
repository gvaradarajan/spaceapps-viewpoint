const parseXml = require('./parser');

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