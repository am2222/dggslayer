setwd('C:/Users/asd56/Documents/Nodejs/rdggslayer/dggslayer/dggslayer')
library(leaflet)
devtools::build()



library(dggslayer)
m <- leaflet() %>%
  leaflet::setView(lng=-106.34, lat=56.13,zoom = 2)%>%
  addMarkers(lng=-106.34, lat=56.13, popup="Canada")

m%>%addDGGSProvider(provider = "test")
m
