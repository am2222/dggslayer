
#geojson-vt.js
leafletDGGSProviderDependencies <- function() {
  list(
    htmltools::htmlDependency(
      "Leaflet-spinlib",
      packageVersion("leaflet"),
      system.file("htmlwidgets/LeafletSpin", package = "dggslayer"),
      script = "spin.min.js"
    ),
    htmltools::htmlDependency(
      "Leaflet-spin",
      packageVersion("leaflet"),
      system.file("htmlwidgets/LeafletSpin", package = "dggslayer"),
      script = "leaflet.spin.min.js"
    ),
    htmltools::htmlDependency(
      "Leaflet-geojsonvt",
      packageVersion("leaflet"),
      system.file("htmlwidgets/geojsonvt", package = "dggslayer"),
      script = "geojson.vt.js"
    ),
    htmltools::htmlDependency(
      "Leaflet-VectorGrid",
      packageVersion("leaflet"),
      system.file("htmlwidgets/vectortile", package = "dggslayer"),
      script = "Leaflet.VectorGrid.js"
    ),
    htmltools::htmlDependency(
      "Leaflet-chroma-min",
      packageVersion("leaflet"),
      system.file("htmlwidgets/chroma", package = "dggslayer"),
      script = "chroma.min.js"
    ),
    htmltools::htmlDependency(
      "Leaflet-VectorGrid-DGGS",
      packageVersion("leaflet"),
      system.file("htmlwidgets/vectortile", package = "dggslayer"),
      script = "Leaflet.VectorGrid.DGGSPBF.js"
    ),
    htmltools::htmlDependency(
      "leaflet-geostat",
      packageVersion("leaflet"),
      system.file("htmlwidgets/geostats", package = "dggslayer"),
      script = "geoStatsNz.js"
    ),
    htmltools::htmlDependency(
      "leaflet-legend-plugin",
      packageVersion("leaflet"),
      system.file("htmlwidgets/LeafletHtmlLegend", package = "dggslayer"),
      script = "L.Control.HtmlLegend.js",
      stylesheet = "Leaflet.HtmlLegend.css"
    ),
    htmltools::htmlDependency(
      "leaflet-dggs-plugin",
      packageVersion("leaflet"),
      system.file("htmlwidgets/", package = "dggslayer"),
      script = "dggslayer.js"
    )
  )
}




dggsNominalTileOptions <- function(resolution=NULL,classNames=NULL, ...) {

  opts <- filterNULL(list(
    resolution = resolution,classNames=classNames,
    ...))
  opts
}

dggsContinuousTileOptions <- function(max,min,resolution=NULL,colorScale=NULL, ...) {

  opts <- filterNULL(list(
    min=min,max=max,
    resolution = resolution,colorScale=colorScale,
    ...))
  opts
}

dggsNumericalTileOptions <- function(resolution=NULL,colorScale=NULL,geostat =NULL, ...) {

  opts <- filterNULL(list(
    resolution = resolution,colorScale=colorScale,geostat=geostat,
    ...))
  opts
}


#' addNominalDGGSLayer
#' @description Adds a DGGS Nominal Type layer.
#' @param map a leaflet map
#' @param layer the dataset name. it is the table name which has a dggid,key,tid,value structure in nz
#' @param tid tid value.
#' @param filter filter data, can be in a form of key='something', it is mostly an SQL where statement
#' @param layerId the layerid same as leaflet layerid
#' @param group groupid same as leaflet group id
#' @param options use dggsNominalTileOptions() function, the mandetory option for this type of the layer is classNames which is a 3dimentional list in this format c("Lable",value,"HexColor")
#' legend options are
#' {defaultColor}{Color that shows as default value when a key is not defined. A hex color and default is '#FFF' }
#' {addSymbologyControl}{Add Symbology controls to the legend, dafault is true}
#' {classNames}{A list of c("Lable",value,"HexColor"), its mandatory}
#' {disableOpacityControl}{show/hide opacity control in the legend}
#' @return leaflerR map object
#'
#' @examples
#'\dontrun{ m <- leaflet() %>%
#' leaflet::setView(lng=-106.34, lat=56.13,zoom = 2)%>%
#'   addMarkers(lng=-106.34, lat=56.13, popup="Canada")
#'
#' nominalLayerOptions <-list(
#'   classNames=list(
#'     c("Evergreen Needleleaf Forests",1,"#006300"),
#'     c("Evergreen Broadleaf Forests", 2,"#006300"),
#'     c("Deciduous Needleleaf Forests", 3,"#148c3d"),
#'     c("Deciduous Broadleaf Forests", 4,"#1eab05"),
#'     c("Mixed Forests", 5,"#5c752b"),
#'     c("Closed Shrublands", 6,"#bad48f"),
#'     c("Open Shrublands", 7,"#b39e2b"),
#'     c("Woody Savannas", 8,"#b38a33"),
#'     c("Savannas", 9,"#9c7554"),
#'     c("Grasslands", 10,"#e1cf8a"),
#'     c("Permanent Wetlands", 11,"#6ba38a"),
#'     c("Croplands", 12,"#e6ae66"),
#'     c("Urban and Built-up Lands", 13,"#dc2126"),
#'     c("Cropland/Natural Vegetation Mosaics", 14,"#949c70"),
#'     c("Permanent Snow and Ice", 15,"#fffaff"),
#'     c("Barren", 16,"#a8abae"),
#'     c("Water Bodies", 17,"#4c70a3")
#'
#'  ))
#'
#'
#' m%>%
#' addNominalDGGSLayer(layer="MOD12Q1DATA",tid='2003',filter="key='MOD12Q1'",group="continuousLayer",options = nominalLayerOptions)
#' }

addNominalDGGSLayer <- function(
  map,
  layer,
  tid=NULL,
  filter=NULL,
  layerId = NULL,
  group = NULL,
  options = dggsNominalTileOptions()
) {
  map$dependencies <- c(map$dependencies, leafletDGGSProviderDependencies())
  invokeMethod(map, getMapData(map), "addDGGSNominalProvider",
               layer,tid,filter, layerId, group, options)
}


#' addContinuousDGGSLayer
#' @description Adds a DGGS Continious Type layer.
#' @param map a leaflet map
#' @param layer the dataset name. it is the table name which has a dggid,key,tid,value structure in nz
#' @param tid tid value.
#' @param filter filter data, can be in a form of key='something', it is mostly an SQL where statement
#' @param layerId the layerid same as leaflet layerid
#' @param group groupid same as leaflet group id
#' @param options  legend options are
#' {colorScale}{A colorscale. it can be a vector of hex colors of chromajs colorscales like OrRd,YlGnBu,RdYlBu,Spectral }
#' {addSymbologyControl}{Add Symbology controls to the legend, dafault is true}
#' {disableOpacityControl}{show/hide opacity control in the legend}
#' @return leaflerR map object
#'
#' @examples
#' \dontrun{ m <- leaflet() %>%
#' leaflet::setView(lng=-106.34, lat=56.13,zoom = 2)%>%
#'   addMarkers(lng=-106.34, lat=56.13, popup="Canada")
#'   continuousLayerOptions <- list(colorScale=c("OrRd"))
#'   m %>%
#'   addContinuousDGGSLayer(layer="ANUSPLINE3",tid='1950',filter="key='MAX_TEMP'",group="nominalLayer",options = continuousLayerOptions)
#'   }

addContinuousDGGSLayer  <- function(
  map,
  layer,
  tid=NULL,
  filter=NULL,
  layerId = NULL,
  group = NULL,
  options = dggsContinuousTileOptions()
) {
  map$dependencies <- c(map$dependencies, leafletDGGSProviderDependencies())
  invokeMethod(map, getMapData(map), "addContinuousDGGSLayer",
               layer,tid,filter, layerId, group, options)
}




#' addNumericalDGGSLayer
#' @description Adds a DGGS Numerical Type layer.
#' @param map a leaflet map
#' @param layer the dataset name. it is the table name which has a dggid,key,tid,value structure in nz
#' @param tid tid value.
#' @param filter filter data, can be in a form of key='something', it is mostly an SQL where statement
#' @param layerId the layerid same as leaflet layerid
#' @param group groupid same as leaflet group id
#' @param options legend options are
#' {colorScale}{A colorscale. it can be a vector of hex colors of chromajs colorscales like OrRd,YlGnBu,RdYlBu,Spectral }
#' {addSymbologyControl}{Add Symbology controls to the legend, dafault is true}
#' {disableOpacityControl}{show/hide opacity control in the legend}
#' {classNumber}{Number of classes}
#' {classificationType}{one of the EqInterval,StdDeviation,GeometricProgression,ArithmeticProgression}
#' @return leaflerR map object
#'
#' @examples
#' \dontrun{ m <- leaflet() %>%
#' leaflet::setView(lng=-106.34, lat=56.13,zoom = 2)%>%
#'   addMarkers(lng=-106.34, lat=56.13, popup="Canada")
#'   continuousLayerOptions <- list(colorScale=c("OrRd"))
#'   m %>%
#'  addNumericalDGGSLayer(layer="ANUSPLINE3",tid='1950',filter="key='MAX_TEMP'",group="nominalLayer",options = continuousLayerOptions)
#'  }

addNumericalDGGSLayer  <- function(
  map,
  layer,
  tid=NULL,
  filter=NULL,
  layerId = NULL,
  group = NULL,
  options = dggsNumericalTileOptions()
) {
  map$dependencies <- c(map$dependencies, leafletDGGSProviderDependencies())
  invokeMethod(map, getMapData(map), "addNumericalDGGSLayer",
               layer,tid,filter, layerId, group, options)
}


# addNumericalDGGSLayer <- function(classificationType="EqInterval",classNumber=5,geostat =list(avg=NULL,median=NULL,sum=NULL,max=NULL,min=NULL,variance=NULL), resolution=NULL, ...) {
#
#   opts <- filterNULL(list(
#     resolution = resolution,classificationType=classificationType,classNumber=classNumber,geostat=geostat,
#     ...))
#   opts
# }

#' setServerAddress
#' @description  Configure Tileserves's Access URL.
#' @param map a leaflet map
#' @param server_URL URL of the server. This must be set if you are connecting to another server than IDEAS tile server
#'
#' @return leaflerR map object
#'
#' @examples
#'\dontrun{ m <- leaflet() %>%
#' setServerAddress("https://spatial.wlu.ca/tileserver/")
#' }

setServerAddress <- function(map,server_URL) {
  map$dependencies <- c(map$dependencies, leafletDGGSProviderDependencies())
  invokeMethod(map, getMapData(map), "setServerAddress",server_URL)
}



addDGGSProvider <- function(
  map,
  layer,
  tid=NULL,
  filter=NULL,
  layerId = NULL,
  group = NULL,
  options = dggsTileOptions()
) {
  map$dependencies <- c(map$dependencies, leafletDGGSProviderDependencies())
  invokeMethod(map, getMapData(map), "addDGGSProvider",
               layer,tid,filter, layerId, group, options)
}

dggsTileOptions <- function(geostat =list(avg=NULL,median=NULL,sum=NULL,max=NULL,min=NULL,variance=NULL),resolution=NULL,legend=list(legendType="nominal",addSymbologyControl=T,classificationType="EqInterval",classNumber=NULL,classNames=NULL), colorScale=NULL, ...) {

  opts <- filterNULL(list(
    geostat = geostat, resolution = resolution,legend=legend,
      colorScale = colorScale,
    ...))
  opts
}

dggslayer <- function(message, width = NULL, height = NULL, elementId = NULL) {

  # forward options using x
  x = list(
    message = message
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'dggslayer',
    x,
    width = width,
    height = height,
    package = 'dggslayer',
    elementId = elementId
  )
}

#' Shiny bindings for dggslayer
#'
#' Output and render functions for using dggslayer within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a dggslayer
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name dggslayer-shiny
#'
#' @export
dggslayerOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'dggslayer', width, height, package = 'dggslayer')
}

#' @rdname dggslayer-shiny
#' @export
renderDggslayer <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, dggslayerOutput, env, quoted = TRUE)
}

