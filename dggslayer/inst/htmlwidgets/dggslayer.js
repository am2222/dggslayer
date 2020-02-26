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

let serverAddress="http://127.0.0.1:3000";
//define canada as bounds
var corner1 = L.latLng(0, -180),
	corner2 = L.latLng(85, 0),
	canadaBound = L.latLngBounds(corner1, corner2);

var attribution = "IDEAS";

function addDGGSLayer(options,data,layerName,layerId, group,self){
    var classNames = options["legend"]["classNames"] || data.legend || null;

    var addSymbologyControl = options["legend"]["addSymbologyControl"] || false;
    var classificationType = options["legend"]["classificationType"] || "EqInterval";
    var classNumber = options["legend"]["classNumber"] || 5;

    if(data.legendType==="nominal" && !classNames){
      alert("legend type is nominal. so please add classNames variable to the layer ");
      return;
    }else{
      data.legend=classNames;
    }

    	var domain =  [data.min, data.max];



    data.gs = new geostats(data);

    switch (data.legendType) {
      case (data.legend && 'nominal'):
        	data.classNames = {};
    			data.colorfunctionArray = [];

    			for (var i = 0; i< data.legend.length; i++) {
    				data.colorfunctionArray[data.legend[i][1]+"_"]=data.legend[i][2];
    				data.classNames[data.legend[i][0]]=data.legend[i][1];

    				}

    			data.colorFunction = function getColor(d){
    			if(data.colorfunctionArray[d+"_"]){
      				return data.colorfunctionArray[d+"_"];
      			}else{
      				return "#FFF";
      			}
  		    }
        break;
      case "numerical":

          break;
      default:
          if(!options["colorScale"]){
          alert("legend type is continuous, so please provide colorScale parameter")
          data.scale= chroma.scale(["green","red"]).domain(domain).mode('lrgb');
        }else{
           data.scale= chroma.scale(options["colorScale"]).domain(domain).mode('lrgb');
        }
        break;
    }




		var dggTilesUrl = data.tiles[0] ||data.tileurl.replace("{r}",data.resolution)
		//define canada as bounds
				var corner1 = L.latLng(0, -180),
					corner2 = L.latLng(85, 0),
					canadaBound = L.latLngBounds(corner1, corner2);






    var dggVectorTileOptions = {
					bounds: canadaBound,
					noWrap: true,
					maxNativeZoom: (data.resolution - 6),
					vectorTileLayerName: "DGGS",
					colorFunction: data.colorFunction || null,
					scale: data.scale || null,
					legend: {
						noWrap: true,
						addSymbologyControl: true,
						domain: domain,

						type: data.legendType, //nominal ,numerical, continuous
						classNames: classNames,

						geoStatObject: data.gs,
						classificationType: classificationType,
						classNumber: classNumber,
						mode: null, //mode : 	null, 'default', 'distinct', 'discontinuous'
						order: ""
					},
					rendererFactory: L.canvas.tile,
					attribution: '',

				};



					var l={};
      		var lname="dggTilesLayer_"+layerName;
      		l[lname] = L.vectorGrid.DGGSPBF(dggTilesUrl, dggVectorTileOptions);
      		self.layerManager.addLayer(l[lname], "tile", layerId, group);
          console.log("dggs layer added");

}

const getMetadata = (metadataUrl) => {
  return new Promise((resolve, reject) => {
     fetch(metadataUrl)
			.then((resp) => (!resp.status && resp.status!=200)? reject("server returnd 500") : resp.json())
			.then(function (result) {
        resolve(result)
		  })
		  .catch(error => console.log(error));
  });
};


LeafletWidget.methods.addDGGSProvider = function(layerName,tid,filter, layerId, group, options) {
  console.log("Test")
  //let's make a dggs layer

  var data = {};
  var legendType = options["legend"]["legendType"] ;
  var tileurl = "http://localhost:3000/mvt/"+layerName+"/{r}/vector/{z}/{x}/{y}.pbf?"+((!tid || tid==="") ? "": "tid=" + tid)+ ((!filter || filter==="") ? "": "&filter=" + filter);
  var self = this;
  if(!options["resolution"]){
    //we need to request data from metadata
		  //var tid = tid||null;
		  //var filter = filter||null;
		  fetch(
				"http://127.0.0.1:3000/metadata/" + layerName + "?" + ((tid===null)?"": "tid=" + tid )+ ((filter===null)? "": "&filter=" + filter)
			) // Call the fetch function passing the url of the API as a parameter
			.then((resp) => resp.json()) // Transform the data into json
			.then(function (result) {
        data = result;
        data.legendType=legendType;
        addDGGSLayer(options,result,layerName,layerId, group,self);


		});
  }else{
    data.resolution = resolution;
    data.legendType=legendType;
    data.tileurl=tileurl
    var avg = options["geostat"]["avg"] || null;
    var median = options["geostat"]["median"] || null;
    var sum = options["geostat"]["sum"] || null;
    var max = options["geostat"]["max"] || null;
    var min = options["geostat"]["min"] || null;
    var variance = options["geostat"]["variance"] || null;
    var count = options["geostat"]["count"] || null;

    if(legendType==="numerical" && (!avg || !median || !sum || !max || !min || !variance)){
      console.warn("legend type is numerical. so please add geostat variable to the layer ");
      return;

    }else{

      data.avg=avg;
      data.median=median;
      data.sum=sum;
      data.max=max;
      data.min=min;
      data.var_pop=variance;
      data.count=count;

    }

    addDGGSLayer(options,data,layerName,layerId, group,self);


  }


};



function addNominalDGGSLayer(options,data,layerName,layerId, group,self,legendOptions){
    var classNames = options["classNames"] || data.legend || null;
    var defaultColor = options["defaultColor"] || "#FFF";
    var addSymbologyControl = ["addSymbologyControl"] || false;

    if(data.legendType==="nominal" && !classNames && !data.legend){
      alert("legend type is nominal. so please add classNames variable to the layer ");
      return;
    }else{
      data.legend=classNames;
    }

    data.classNames = {};
		data.colorfunctionArray = [];

		for (var i = 0; i< data.legend.length; i++) {
			data.colorfunctionArray[data.legend[i][1]+"_"]=data.legend[i][2];
			data.classNames[data.legend[i][0]]=data.legend[i][1];
			}

		data.colorFunction = function getColor(d){
		if(data.colorfunctionArray[d+"_"]){
				return data.colorfunctionArray[d+"_"];
			}else{
				return defaultColor;
			}
    }


		var dggTilesUrl = data.tiles[0] ||data.tileurl.replace("{r}",data.resolution)


    var dggVectorTileOptions = {
					bounds: canadaBound,
					noWrap: true,
					maxNativeZoom: (data.resolution - 6),
					vectorTileLayerName: "DGGS",
					colorFunction: data.colorFunction,
					scale: data.scale || null,
					legend: {
						noWrap: true,
						addSymbologyControl: addSymbologyControl,
						type: "nominal", //nominal ,numerical, continuous
						classNames: classNames,

						mode: null, //mode : 	null, 'default', 'distinct', 'discontinuous'
						order: ""
					},
					rendererFactory: L.canvas.tile,
					attribution: attribution,

				};


		var l={};
		var lname="dggTilesLayer_"+layerName;
		l[lname] = L.vectorGrid.DGGSPBF(dggTilesUrl, dggVectorTileOptions);
		self.layerManager.addLayer(l[lname], "tile", layerId, group);
    console.log("dggs layer added");


    addLegend(self,l[lname],dggVectorTileOptions, legendOptions)

}

LeafletWidget.methods.addDGGSNominalProvider = function(layerName,tid,filter, layerId, group, options) {
  console.log("addDGGSNominalProvider")
  //let's make a dggs layer
  var data = {};
  data.legendType = "nominal" ;
  data.tileurl = "http://localhost:3000/mvt/"+layerName+"/{r}/vector/{z}/{x}/{y}.pbf?"+((!tid || tid==="") ? "": "tid=" + tid)+ ((!filter || filter==="") ? "": "&filter=" + filter);

  var self = this;

  if(!options["resolution"]){
    var metadataurl=serverAddress+"/metadata/" + layerName + "?" + ((tid===null)?"": "tid=" + tid )+ ((filter===null)? "": "&filter=" + filter)
    getMetadata(metadataurl).then(result=>{
      data = result;
      addNominalDGGSLayer(options,result,layerName,layerId, group,self)
    })

  }else{
    data.resolution = resolution;
    addNominalDGGSLayer(options,data,layerName,layerId, group,self);
  }

};




function addContinuousDGGSLayer(options,data,layerName,layerId, group,self,legendOptions={}){

    var addSymbologyControl = options["addSymbologyControl"] || false;
    var domain =  [data.min, data.max];

    if(!options["colorScale"]){
      alert("legend type is continuous, so please provide colorScale parameter, we define a default colorScale")
      data.scale= chroma.scale(["green","red"]).domain(domain).mode('lrgb');
    }else{
       data.scale= chroma.scale(options["colorScale"]).domain(domain).mode('lrgb');
    }


		var dggTilesUrl = data.tiles[0] ||data.tileurl.replace("{r}",data.resolution)

    var dggVectorTileOptions = {
					bounds: canadaBound,
					noWrap: true,
					maxNativeZoom: (data.resolution - 6),
					vectorTileLayerName: "DGGS",
					scale: data.scale ,
					legend: {
						noWrap: true,
						addSymbologyControl: addSymbologyControl,
						domain: domain,

						type: "continuous", //nominal ,numerical, continuous

						mode: null, //mode : 	null, 'default', 'distinct', 'discontinuous'
						order: ""
					},
					rendererFactory: L.canvas.tile,
					attribution: attribution,

				};

		var l={};
		var lname="dggTilesLayer_"+layerName;
		l[lname] = L.vectorGrid.DGGSPBF(dggTilesUrl, dggVectorTileOptions);
		self.layerManager.addLayer(l[lname], "tile", layerId, group);
    console.log("dggs layer added");

    addLegend(self,l[lname],dggVectorTileOptions, legendOptions)
}

LeafletWidget.methods.addContinuousDGGSLayer = function(layerName,tid,filter, layerId, group, options) {
  console.log("addContinuousDGGSLayer")
  //let's make a dggs layer
  var data = {};
  data.legendType = "continuous" ;
  data.tileurl = "http://localhost:3000/mvt/"+layerName+"/{r}/vector/{z}/{x}/{y}.pbf?"+((!tid || tid==="") ? "": "tid=" + tid)+ ((!filter || filter==="") ? "": "&filter=" + filter);

  var self = this;
  var max = options["max"] || null;
  var min = options["min"] || null;

  if(!options["resolution"] || !max || !min){
    var metadataurl=serverAddress+"/metadata/" + layerName + "?" + ((tid===null)?"": "tid=" + tid )+ ((filter===null)? "": "&filter=" + filter)
    getMetadata(metadataurl).then(result=>{
      data = result;
      addContinuousDGGSLayer(options,result,layerName,layerId, group,self)
    })

  }else{
    data.resolution = resolution;
    data.max=max;
    data.min=min;
    addContinuousDGGSLayer(options,data,layerName,layerId, group,self);
  }

};


function addLegend(self,layer, vectorTileOptions, options={}){


  	var htmlLegend1and2 = L.control.htmllegend({
					position: options['position'] || 'bottomright',
					disableOpacityControl: options['disableOpacityControl'] || true,
					disableSymbologyControl: options['disableSymbologyControl'] || true,
					legends: [{
						name: 'DGGGS',
						layer: layer,
						legendOptions: vectorTileOptions,
						elements: [{
							lable: options['name'] || ""
						}]
					}],
					collapseSimple: options['collapseSimple'] || true,
					detectStretched: options['detectStretched'] || true,
					collapsedOnInit: options['collapsedOnInit'] ||  true,
					defaultOpacity: options['defaultOpacity'] ||  1,
					visibleIcon: 'icon icon-eye',
					hiddenIcon: 'icon icon-eye-slash'
				})
				self.addControl(htmlLegend1and2);
}


function addNumericalDGGSLayer(options,data,layerName,layerId, group,self,legendOptions={}){

    var addSymbologyControl = options["addSymbologyControl"] || false;
    var classificationType = options["classificationType"] || "EqInterval";
    var classNumber = options["classNumber"] || 5;


    data.gs = new geostats(data);
    var domain =  [data.min, data.max];

		var dggTilesUrl = data.tiles[0] ||data.tileurl.replace("{r}",data.resolution)


    var dggVectorTileOptions = {
					bounds: canadaBound,
					noWrap: true,
					maxNativeZoom: (data.resolution - 6),
					vectorTileLayerName: "DGGS",
					colorFunction: data.colorFunction || null,
					scale: data.scale || null,
					legend: {
						noWrap: true,
						addSymbologyControl: addSymbologyControl,
            domain :domain,
						type: "numerical", //nominal ,numerical, continuous
						geoStatObject: data.gs,
						classificationType: classificationType,
						classNumber: classNumber,
						mode: null, //mode : 	null, 'default', 'distinct', 'discontinuous'
						order: ""
					},
					rendererFactory: L.canvas.tile,
					attribution: attribution,

				};



		var l={};
		var lname="dggTilesLayer_"+layerName;
		l[lname] = L.vectorGrid.DGGSPBF(dggTilesUrl, dggVectorTileOptions);
		self.layerManager.addLayer(l[lname], "tile", layerId, group);
    console.log("dggs layer added");
    addLegend(self,l[lname],dggVectorTileOptions, legendOptions)
}


LeafletWidget.methods.addNumericalDGGSLayer = function(layerName,tid,filter, layerId, group, options) {
  console.log("addNumericalDGGSLayer")
  //let's make a dggs layer
  var data = {};
  data.legendType = "numerical" ;
  data.tileurl = "http://localhost:3000/mvt/"+layerName+"/{r}/vector/{z}/{x}/{y}.pbf?"+((!tid || tid==="") ? "": "tid=" + tid)+ ((!filter || filter==="") ? "": "&filter=" + filter);

  var self = this;
  var avg = options["geostat"]["avg"] || null;
  var median = options["geostat"]["median"] || null;
  var sum = options["geostat"]["sum"] || null;
  var max = options["geostat"]["max"] || null;
  var min = options["geostat"]["min"] || null;
  var variance = options["geostat"]["variance"] || null;
  var count = options["geostat"]["count"] || null;

  if(!options["resolution"] || !max || !min || !avg || !median || !variance || !count){
    var metadataurl=serverAddress+"/metadata/" + layerName + "?" + ((tid===null)?"": "tid=" + tid )+ ((filter===null)? "": "&filter=" + filter)
    self.spin(true);
    getMetadata(metadataurl).then(result=>{
      data = result;
      self.spin(false);
      addNumericalDGGSLayer(options,result,layerName,layerId, group,self)
    })

  }else{
    data.resolution = resolution;
    data.avg=avg;
    data.median=median;
    data.sum=sum;
    data.max=max;
    data.min=min;
    data.var_pop=variance;
    data.count=count;
    addNumericalDGGSLayer(options,data,layerName,layerId, group,self);
  }


};

