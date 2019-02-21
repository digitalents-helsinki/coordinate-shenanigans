const axios = require('axios')
const proj4 = require('proj4')

const coordinates = []

const getJSON = async () => {
    return await axios.get('https://kartta.hel.fi/maps/featureloader.ashx?request=select&id=vastuualue_maka_rantojen_hoito_julkinen&resolution=8')
}

const what = async () => {
    const heldata = await getJSON()
    const data = JSON.parse(heldata.data.slice(1))

    Object.entries(data.features).forEach(value => {
        const coords = value[1].geometry.coordinates
        if (value[1].geometry.type == 'MultiLineString') {
            //coordinates.push(...coords)
            Object.entries(...coords).forEach(value => {
                // TODO: Fix multiline array push to get rest of the coordinates
            })
        } else {
            coordinates.push(...coords)
        }
        
    });

    //console.dir(coordinates, {'maxArrayLength': null});
    console.log(coordinates.length);
    google()
}

what()


const google = () => {
    const fin_coords = []

    coordinates.forEach((point) => {
        const x = point[0];
        const y = point[1];
        fin_coords.push(converter(x, y).reverse())
    })

    fin_coords.forEach((point) => {
        console.log(point)
    })

    function converter(x, y) {
        var projections = {
            fin: "+proj=tmerc +lat_0=0 +lon_0=25 +k=1 +x_0=25500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs t",
            google: "+proj=longlat +datum=WGS84 +no_defs "
        };

        return proj4(projections['fin'], projections['google'], [x, y]);
    }

    const url = 'https://www.google.com/maps/dir/'
    console.log(url + fin_coords.join('/'))
    const lgt = url + fin_coords.join('/')
    console.log(lgt.length);
}