HTMLWidgets.widget({

  name: 'dggslayer',

  type: 'output',

  factory: function(el, width, height) {

    // TODO: define shared variables for this instance

    return {

      renderValue: function(x) {

        // TODO: code to render the widget, e.g.
        el.innerText = x.message;

      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});

LeafletWidget.methods.addDGGSProvider = function(provider, layerId, group, options) {
  alert("hi");
  console.log("Test")
  //let's make a dggs layer
  var Thunderforest_MobileAtlas = L.tileLayer(
  			'https://{s}.tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey=5c067b469722440ea2a21bfd5d70e27f', {
  				attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  				apikey: '<your apikey>',
  				maxZoom: 22
  			});

  	var layerMetadata = {
			domain: [0, 20]
		}


		var scale = chroma.scale(['#00429d', '#96ffea']).domain(layerMetadata.domain).mode('lrgb');

		console.log("chroma")
		// http://127.0.0.1:3000/mvt/test/standard/1/1/1
		var dggTilesUrl = 'http://127.0.0.1:3000/mvt/CUMSUM_ERATEMP_TEST/vector/{z}/{x}/{y}.json'
		var dggVectorTileOptions = {
			vectorTileLayerName: "DGGGS",
			scale:scale,
			legend: {
				addTransparencyControl: true,
				continous: true,
				domain: layerMetadata.domain,
				addSymbologyControl: true
			},
			rendererFactory: L.canvas.tile,
			attribution: '<a href="https://nextzen.com/">&copy; NextZen</a>, <a href="http://www.openstreetmap.org/copyright">&copy; OpenStreetMap</a> contributors',

		};
		var dggTilesPbfLayer = L.vectorGrid.DGGS(dggTilesUrl, dggVectorTileOptions);
		this.layerManager.addLayer(Thunderforest_MobileAtlas, "tile", layerId, group);
		this.layerManager.addLayer(dggTilesPbfLayer, "tile", layerId, group);

  		console.log("dggs")


};
