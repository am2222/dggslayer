# `addNumericalDGGSLayer`: Adds a DGGS Numerical Type layer.

## Description


 Adds a DGGS Numerical Type layer.


## Usage

```r
addNumericalDGGSLayer(
  map,
  layer,
  tid = NULL,
  filter = NULL,
  layerId = NULL,
  group = NULL,
  options = dggsNumericalTileOptions()
)
```


## Arguments

Argument      |Description
------------- |----------------
```map```     |     a leaflet map
```layer```     |     the dataset name. it is the table name which has a dggid,key,tid,value structure in nz
```tid```     |     tid value.
```filter```     |     filter data, can be in a form of key='something', it is mostly an SQL where statement
```layerId```     |     the layerid same as leaflet layerid
```group```     |     groupid same as leaflet group id
```options```     |     use dggsNumericalTileOptions() function

## Value


 


