




L.VectorGrid.DGGS = L.VectorGrid.extend({

	options: {
		// 🍂section
		// As with `L.TileLayer`, the URL template might contain a reference to
		// any option (see the example above and note the `{key}` or `token` in the URL
		// template, and the corresponding option).
		//
		// 🍂option subdomains: String = 'abc'
		// Akin to the `subdomains` option for `L.TileLayer`.
		subdomains: 'abc',	// Like L.TileLayer
		//
		// 🍂option fetchOptions: Object = {}
		// options passed to `fetch`, e.g. {credentials: 'same-origin'} to send cookie for the current domain
		fetchOptions: {}
	},

	initialize: function(url, options) {
		// Inherits options from geojson-vt!
// 		this._slicer = geojsonvt(geojson, options);
		this._url = url;
		options.domain= options.legend.domain||[0,1]
		options.vectorTileLayerName= options.vectorTileLayerName||'DGGS';


		options.scale= options.scale||chroma.scale(['#fafa6e', '#2A4858']).domain(options.domain).mode('lrgb');
		// TODO:Needs to be moved to setStyle function
		options.colorFunction =options.colorFunction|| function (value) {
			return options.scale(value).hex()
		}

		var vectorTileStyling = {};
		vectorTileStyling["dggs"]=function (properties, zoom) {

			return style = {
				fill: true,
				stroke: true,
				fillColor: options.colorFunction(properties.VALUE),
				color: options.colorFunction(properties.VALUE),
				weight: 1,
				fillOpacity: 1,
				opacity: 1
			}

		}
		options.vectorTileLayerStyles= vectorTileStyling;

		L.VectorGrid.prototype.initialize.call(this, options);
	},
	setStyle: function(scale,colorFunction){
		self=this;
		self.options.scale = scale
		self.options.colorFunction =colorFunction|| function (value) {
			return self.options.scale(value).hex()
		}

		// layer.options.vectorTileLayerName= layer.options.vectorTileLayerName||'poi';
		var vectorTileStyling = {};

		vectorTileStyling["dggs"]= function (properties, zoom) {

			return style = {
				fill: true,
				stroke: true,
				fillColor: self.options.colorFunction(properties.VALUE),
				color: self.options.colorFunction(properties.VALUE),
				weight: 1,
				fillOpacity: 1,
				opacity: 1
			}

		}

		self.options.vectorTileLayerStyles = vectorTileStyling;

	},
	// 🍂method setUrl(url: String, noRedraw?: Boolean): this
	// Updates the layer's URL template and redraws it (unless `noRedraw` is set to `true`).
	setUrl: function(url, noRedraw) {
		this._url = url;

		if (!noRedraw) {
			this.redraw();
		}

		return this;
	},

	_getSubdomain: L.TileLayer.prototype._getSubdomain,

	_isCurrentTile : function(coords, tileBounds) {

		if (!this._map) {
			return true;
		}

		var zoom = this._map._animatingZoom ? this._map._animateToZoom : this._map._zoom;
		var currentZoom = zoom === coords.z;

		var tileBounds = this._tileCoordsToBounds(coords);
		var currentBounds = this._map.getBounds().overlaps(tileBounds);



		return currentZoom && currentBounds;

	},

	_getVectorTilePromise: function(coords, tileBounds) {
		var data = {
			s: this._getSubdomain(coords),
			x: coords.x,
			y: coords.y,
			z: coords.z
// 			z: this._getZoomForUrl()	/// TODO: Maybe replicate TileLayer's maxNativeZoom
		};
		if (this._map && !this._map.options.crs.infinite) {
			var invertedY = this._globalTileRange.max.y - coords.y;
			if (this.options.tms) { // Should this option be available in Leaflet.VectorGrid?
				data['y'] = invertedY;
			}
			data['-y'] = invertedY;
		}

		if (!this._isCurrentTile(coords, tileBounds)) {
			return Promise.resolve({layers:[]});
		}

		// layerName = "poi";
		// var options={
		// 	vectorTileLayerName:"poi"
		// }

		var tileUrl = L.Util.template(this._url, L.extend(data, this.options));

		return fetch(tileUrl, this.options.fetchOptions).then(function(response){

			if (!response.ok || !this._isCurrentTile(coords)) {
				return {layers:[]};
			}
			//TODO: Needs to be changed for reading geometry
			return response.json().then( function (geojson) {

				if (!geojson.features || geojson.features.length<1){
					return [];
				}


				return new Promise(function(resolve){


					var layers=geojsonvt(geojson);
					var slicedTileLayer = layers.getTile(coords.z, coords.x, coords.y);
					var tileLayers = {};
					if (slicedTileLayer) {
						var vectorTileLayer = {
							features: [],
							extent: 4096,
							name: "dggs",
							length: slicedTileLayer.features.length
						}
			for (var i in slicedTileLayer.features) {
							var feat = {
								geometry: slicedTileLayer.features[i].geometry,
								properties: slicedTileLayer.features[i].tags,
								type: slicedTileLayer.features[i].type	// 1 = point, 2 = line, 3 = polygon
							}
							vectorTileLayer.features.push(feat);
						}
						tileLayers["dggs"] = vectorTileLayer;
					}

					var output ={ layers: tileLayers, coords: coords };
					return resolve(output);
				});

			});

		}.bind(this)).then(function(json){
			return json;
		});
	}
});


// 🍂factory L.vectorGrid.protobuf(url: String, options)
// Instantiates a new protobuf VectorGrid with the given URL template and options
L.vectorGrid.DGGS = function (url, options) {
	return new L.VectorGrid.DGGS(url, options);
};

