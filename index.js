const axios = require('axios')
const proj4 = require('proj4')

const goddata = []

const getJSON = async () => {
    return await axios.get('https://kartta.hel.fi/maps/featureloader.ashx?request=select&id=vastuualue_maka_rantojen_hoito_julkinen&resolution=8')
}

const convertJSON = async () => {
    const heldata = await getJSON()
    const data = JSON.parse(heldata.data.slice(1))

    Object.entries(data.features).forEach(value => {
        const coords = value[1].geometry.coordinates
        const responsible = value[1].properties["hel:vastuu_org"]
        if (responsible == "Kulttuurin ja vapaa-ajan toimiala") {
            const properties = value[1].properties
            properties['dt:lastcleaned'] = 0
            properties['dt:credits'] = []
            if (value[1].geometry.type == 'MultiLineString') {
                const multicoords = []

                Object.entries(coords).forEach(value => {
                    const multitemp = []

                    value.forEach(coord => {
                        if (typeof coord == "object") {
                            coord.forEach(tc => {
                                const x = tc[0]
                                const y = tc[1]
                                const fincoord = converter(x, y)

                                multitemp.push(fincoord)
                            })
                        }
                    })
                    multicoords.push(multitemp)
                })
                goddata.push({
                    "type": value[1].type,
                    "properties": properties,
                    "geometry": {
                        "type": value[1].geometry.type,
                        "coordinates": multicoords
                    }
                })
            } else {
                const convertedcoords = []

                Object.entries(coords).forEach(coord => {
                    const x = coord[1][0]
                    const y = coord[1][1]
                    const fincoord = converter(x, y)

                    convertedcoords.push(fincoord)
                })
                goddata.push({
                    "type": value[1].type,
                    "properties": properties,
                    "geometry": {
                        "type": value[1].geometry.type,
                        "coordinates": convertedcoords
                    }
                })
            }
        }
    });
    console.log(JSON.stringify(goddata, null, 2));
}

convertJSON()

const converter = (x, y) => {
    var projections = {
        fin: "+proj=tmerc +lat_0=0 +lon_0=25 +k=1 +x_0=25500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs t",
        google: "+proj=longlat +datum=WGS84 +no_defs "
    };

    return proj4(projections['fin'], projections['google'], [x, y]);
}