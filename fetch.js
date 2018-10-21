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
    let baseAxisTag = '<CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem>';
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
    console.log('Num chunks: ' + idChunks.length)
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
                            satellite.Coordinates.X[idx],
                            satellite.Coordinates.Y[idx],
                            satellite.Coordinates.Z[idx]
                        ];
                        windowObject.addSatelliteData(
                            satelliteId,
                            time["#text"],
                            coordinates
                        );
                    }
                };
                // renderSatellites(ids);
                console.log('Put satellite render logic here')
            }
        )
    };
}

module.exports = {fetchSatelliteCoordinates, fetchSats};