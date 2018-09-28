
exports.common = function () {
  var self = {}

  function TileTransfor () {
    var _mmMaxZoom = 19
    this.Uu
    this.Vu
    this.Ru
    this.Tu
    function MapUtilsStart () {
      if (this.Uu != null) return
      this.Uu = new Array()
      this.Vu = new Array()
      this.Ru = new Array()
      this.Tu = new Array()
      var c = 256
      for (var i = 0; i <= _mmMaxZoom; i++) {
        var e = c / 2.0

        this.Uu[i] = c / 360.0
        this.Vu[i] = (c / (2.0 * Math.PI))
        this.Ru[i] = (e)
        this.Tu[i] = (c)

        c *= 2
      }
    }
    MapUtilsStart()
    this.FromLatLngToPixel = function (lat, lng, zoom) {
      var ret = new Object()
      if (zoom > _mmMaxZoom || zoom < 1) { return null }

      var d = this.Ru[zoom]
      ret.Lng = parseInt(d + (lng * this.Uu[zoom]))

      var f = Math.sin(lat * (Math.PI / 180.0))
      f = Math.max(f, -0.9999)
      f = Math.min(f, 0.9999)
      ret.Lat = parseInt(d + (0.5 * Math.log((1 + f) / (1 - f)) * (-this.Vu[zoom])))

      return ret
    }
    this.FromLatLngToTitle = function (lat, lng, zoom) {
      var _ret = this.FromLatLngToPixel(lat, lng, zoom)
      _ret.TileY = parseInt(_ret.Lat / 256)
      _ret.TileX = parseInt(_ret.Lng / 256)
      _ret.Tile = _ret.TileX + '_' + _ret.TileY

      _ret.TileXSub = parseInt((_ret.Lng - (_ret.TileX * 256)) / 32)
      _ret.TileYSub = parseInt((_ret.Lat - (_ret.TileY * 256)) / 32)
      _ret.TileSub = _ret.TileXSub + '' + _ret.TileYSub
      return _ret
    }
    this.FromLatLonToTileString = function (lat, lon, zoom) {
      var t = this.FromLatLngToTitle(lat, lon, zoom)
      return t.TileX + '_' + t.TileY
    }
    this.FromPixelToLatLng = function (lat, lng, zoom) {
      var ret = new Object()
      if (zoom > _mmMaxZoom || zoom < 1) { return ret }

      var e = this.Ru[zoom]
      ret.Lng = parseFloat((lng - e) / this.Uu[zoom])

      var g = (lat - e) / (-this.Vu[zoom])
      ret.Lat = parseFloat((2.0 * Math.atan(Math.exp(g)) - (Math.PI / 2.0)) / (Math.PI / 180.0))

      return ret
    }

    this.TileXToPolygon = function (tile, zoom) {
      var tiles = tile.split('_')
      var tl = this.FromPixelToLatLng(parseInt(tiles[1]) * 256, parseInt(tiles[0]) * 256, zoom)
      var br = this.FromPixelToLatLng(parseInt(tiles[1]) * 256 + 256, parseInt(tiles[0]) * 256 + 256, zoom)
      return [[tl.Lng, tl.Lat], [br.Lng, tl.Lat], [br.Lng, br.Lat], [tl.Lng, br.Lat], [tl.Lng, tl.Lat]]
    }

    return this
  }
  self.TileTransfor = TileTransfor()

  return self
}
