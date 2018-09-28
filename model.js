const request = require('request').defaults({gzip: true, json: true})
const common = require('./common').common()
const config = require('./conf')
const gjEmpty = {
  'type': 'FeatureCollection',
  'features': []
}

function Model (koop) {}

Model.prototype.getData = function (req, callback) {
  var tmp = req.params.host.split('_')
  var request = req
  request.params.key = tmp[0]
  request.params.type = tmp[1]
  request.params.values = req.params.id

  if (!request.params.key) { return callback(gjEmpty) }

  switch (request.params.type) {
    case 'pois':
      POIsStart(request, callback)
      break
    case 'transport':
      TransportStart(request, callback)
      break
    case 'hm':
      HMStart(request, callback)
      break
    case 'lsbox':
      LocationScoreBoxStart(request, callback)
      break
    default:
      return callback({})
  }
}

function BoxOk (box) {
  if ((parseFloat(box[0]) - parseFloat(box[2])) > 1 || (parseFloat(box[1]) - parseFloat(box[2])) > 1) { return false }

  return true
}

function LocationScoreBoxStart (req, callback) {
  var aux = req.params.values.split('_')
  var box = aux[0].split(',')
  if (!BoxOk(box)) return callback({error: 'Please , select smaller area.'})
  var opts = {
    'key': req.params.key,
    'north': box[0], // req.query.north,
    'west': box[1], // req.query.west,
    'south': box[2], // req.query.south,
    'east': box[3], // req.query.east,
    'category': aux[1],
    'url': '' // https://data.avuxiapis.com/v1/GetPointsOfInterestByBox?key=72a86c28d909b%7C59a808a90064007cc8b127af&north=41.397158&west=2.160873&south=41.394582&east=2.177181&limit=80&language=en'
  }

  opts.url = `${config.url}v1/GetLocationScoresBox?key=${opts.key}&north=${opts.north}&west=${opts.west}&south=${opts.south}&east=${opts.east}&type=${opts.category}`

  request(opts.url, (err, res, body) => {
    if (err) return callback(err)
    callback(null, LocationScoreBoxTranslate(opts, body))
  })
}

function LocationScoreBoxTranslate (opts, input) {
  var items = []

  for (var value in input.values) {
    var coordinates = common.TileTransfor.TileXToPolygon(value, 18)
    var feature = {
      type: 'Feature',
      properties: {
        id: value,
        score: input.values[value],
        type: opts.type
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates],
        style: {
          'fill-opacity': 0.1
        }
      }
    }
    items.push(feature)
  }

  return {
    type: 'FeatureCollection',
    features: items
  }
}

function POIsStart (req, callback) {
  //   ?type=pois&key=72a86c28d909b%7C59a808a90064007cc8b127af&north=41.397158&west=2.160873&south=41.394582&east=2.177181&limit=80&language=en
  try {
    var aux = req.params.values.split('_')

    var box = aux[0].split(',')
    if (!BoxOk(box)) return callback({error: 'Please , select smaller area.'})
    var opts = {
      'key': req.params.key,
      'north': box[0],
      'west': box[1],
      'south': box[2],
      'east': box[3],
      'limit': aux[1],
      'language': aux[2],
      'url': '' // https://data.avuxiapis.com/v1/GetPointsOfInterestByBox?key=72a86c28d909b%7C59a808a90064007cc8b127af&north=41.397158&west=2.160873&south=41.394582&east=2.177181&limit=80&language=en'
    }
    if (!opts.limit) opts.limit = 80
    if (!opts.language) opts.language = 'en'

    opts.url = `${config.url}v1/GetPointsOfInterestByBox?key=${opts.key}&north=${opts.north}&west=${opts.west}&south=${opts.south}&east=${opts.east}&limit=${opts.limit}&language=${opts.language}`
    request(opts.url, (err, res, body) => {
      if (err) return callback(err)
      callback(null, POIsTranslate(opts, body))
    })
  } catch (e) {
    callback(gjEmpty)
  }
}

function POIsTranslate (opts, input) {
  var items = []
  for (var x = 0; x < input.pois.length; x++) {
    var feature = {
      type: 'Feature',
      properties: {
        name: input.pois[x].name,
        cat: input.pois[x].cat,
        rank: input.pois[x].rank,
        tags: input.pois[x].tags
      },
      geometry: {
        type: 'Point',
        coordinates: [input.pois[x].latlon[1], input.pois[x].latlon[0]]
      }
    }
    items.push(feature)
  }
  return {
    type: 'FeatureCollection',
    features: items
  }
}

function TransportStart (req, callback) {
  var aux = req.params.values.split('_')

  var opts = {
    'key': req.params.key,
    'latitude': aux[0],
    'longitude': aux[1]
  }
  opts.url = `${config.url}v1/GetMetroLinesByCityCenter?key=${opts.key}&latitude=${opts.latitude}&longitude=${opts.longitude}`
  request(opts.url, (err, res, body) => {
    if (err) return callback(err)
    callback(null, TransportTranslate(opts, body.data))
  })
}

function TransportTranslate (opts, input) {
  var items = []
  try {
    for (var x in input.lines) {
      var coordinates = []
      for (var y = 0; y < input.lines[x][2].length; y++) {
        coordinates.push([input.lines[x][2][y][1], input.lines[x][2][y][0]])
      }
      var feature = {
        type: 'Feature',
        properties: {
          name: input.lines[x][1],
          color: input.lines[x][3],
          id: input.lines[x][5]
        },
        geometry: {
          type: 'LineString',
          coordinates: coordinates,
          style: {
            'fill': input.lines[x][3],
            'stroke-width': '3',
            'fill-opacity': 0.6
          }
        }
      }
      items.push(feature)
    }
    for (var x in input.stops) {
      var feature = {
        type: 'Feature',
        properties: {
          name: input.stops[x][0]
        },
        geometry: {
          type: 'Point',
          coordinates: [input.stops[x][1][1], input.stops[x][1][0]]
        }
      }
      items.push(feature)
    }

    return {
      type: 'FeatureCollection',
      features: items
    }
  } catch (e) {
    return {error: e}
  }
}

function HMStart (req, callback) {
  var aux = req.params.values.split('_')

  var box = aux[0].split(',')
  if (!BoxOk(box)) return callback({error: 'Please , select smaller area.'})
  var opts = {
    'key': req.params.key,
    'north': box[0],
    'west': box[1],
    'south': box[2],
    'east': box[3],
    'category': aux[1]
  }
  opts.url = `${config.url}v1/GetHeatMapVectorialByBox?key=${opts.key}&north=${opts.north}&west=${opts.west}&south=${opts.south}&east=${opts.east}&category=${opts.category}`

  request(opts.url, (err, res, body) => {
    if (err) return callback(err)
    callback(null, HMTranslate(opts, body))
  })
}

function HMTranslate (opts, input) {
  var items = []
  var levels = input.polygons.levels
  for (var x = 0; x < levels.length; x++) {
    for (var y = 0; y < levels[x].polygons.length; y++) {
      var coordinates = []
      for (var z = 0; z < levels[x].polygons[y].coords.length; z++) {
        coordinates.push([levels[x].polygons[y].coords[z][1], levels[x].polygons[y].coords[z][0]])
      }

      var feature = {
        type: 'Feature',
        properties: {
          tile: opts.tile,
          code: 'ply' + levels[x].level + y,
          name: levels[x].level
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
          style: {
            'fill-opacity': 0.1
          }
        }
      }

      // console.log(JSON.stringify(feature.geometry))
      items.push(feature)
    }
  }

  return {
    type: 'FeatureCollection',
    features: items
  }
}

module.exports = Model

/*
  url base => http://localhost:5001/vx/FeatureServer/0/query

  pois
  ?type=pois&key=72a86c28d909b%7C59a808a90064007cc8b127af&north=41.397158&west=2.160873&south=41.394582&east=2.177181&limit=80&language=en

  transport
  ?type=transport&key=72a86c28d909b%7C59a808a90064007cc8b127af&&latitude=41.388722&longitude=2.168169

  hm
  ?type=hm&key=72a86c28d909b%7C59a808a90064007cc8b127af&tiles=518_352&category=phsights

  lsbox
  ?type=lsbox&key=72a86c28d909b%7C59a808a90064007cc8b127af&north=41.397158&west=2.160873&south=41.394582&east=2.177181&cat=sights200

*/
