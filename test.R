setwd(paste(dirname(rstudioapi::getActiveDocumentContext()$path),"dggslayer",sep = "/"))

package <- paste(dirname(rstudioapi::getActiveDocumentContext()$path),"dggslayer_0.0.0.9000.tar.gz",sep = "/")
devtools::dev_mode(T,package)
if (file.exists(package)){
  file.remove(package)
}

devtools::build()

# remove.packages("dggslayer",lib=.libPaths()[2])
# remove.packages("dggslayer",lib=.libPaths()[1])
# remove.packages("dggslayer")
install.packages(package, lib=.libPaths()[2],repos = NULL, type="source")

library(leaflet)
library(dggslayer)
devtools::reload()
m <- leaflet() %>%
  leaflet::setView(lng=-106.34, lat=56.13,zoom = 2)%>%
  addMarkers(lng=-106.34, lat=56.13, popup="Canada")

nominalLayerOptions <-list(
  classNames=list(
    c("Evergreen Needleleaf Forests",1,"#006300"),
    c("Evergreen Broadleaf Forests", 2,"#006300"),
    c("Deciduous Needleleaf Forests", 3,"#148c3d"),
    c("Deciduous Broadleaf Forests", 4,"#1eab05"),
    c("Mixed Forests", 5,"#5c752b"),
    c("Closed Shrublands", 6,"#bad48f"),
    c("Open Shrublands", 7,"#b39e2b"),
    c("Woody Savannas", 8,"#b38a33"),
    c("Savannas", 9,"#9c7554"),
    c("Grasslands", 10,"#e1cf8a"),
    c("Permanent Wetlands", 11,"#6ba38a"),
    c("Croplands", 12,"#e6ae66"),
    c("Urban and Built-up Lands", 13,"#dc2126"),
    c("Cropland/Natural Vegetation Mosaics", 14,"#949c70"),
    c("Permanent Snow and Ice", 15,"#fffaff"),
    c("Barren", 16,"#a8abae"),
    c("Water Bodies", 17,"#4c70a3")

  ))


m%>%addNominalDGGSLayer(layer="MOD12Q1DATA",tid='2003-01-01',group="nominalLayer",options = nominalLayerOptions)


continuousLayerOptions <-list(
  colorScale=c("OrRd"))
m%>%addContinuousDGGSLayer  (layer="cumsumData",filter="key='MAXTEMP_MAX'",group="continuousLayer",options = continuousLayerOptions)


numericalLayerOptions <-list(
  colorScale=c("OrRd"))
m%>%addNumericalDGGSLayer(layer="cumsumData",filter="key='MAXTEMP_MIN'",group="numericalLayer")


