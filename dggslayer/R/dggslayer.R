
#geojson-vt.js
leafletDGGSProviderDependencies <- function() {
  list(
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
      script = "Leaflet.VectorGrid.DGGS.js"
    ),

    htmltools::htmlDependency(
      "leaflet-dggs-plugin",
      packageVersion("leaflet"),
      system.file("htmlwidgets/", package = "dggslayer"),
      script = "dggslayer.js"
    )
  )
}

addDGGSProvider <- function(
  map,
  provider,
  layerId = NULL,
  group = NULL,
  options = providerTileOptions()
) {
  map$dependencies <- c(map$dependencies, leafletDGGSProviderDependencies())
  invokeMethod(map, getMapData(map), "addDGGSProvider",
               provider, layerId, group, options)
}
#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
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
