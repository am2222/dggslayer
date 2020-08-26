# `addContinuousDGGSLayer`: Adds a DGGS Continious Type layer.

## Description


 Adds a DGGS Continious Type layer.


## Usage

```r
addContinuousDGGSLayer(
  map,
  layer,
  tid = NULL,
  filter = NULL,
  layerId = NULL,
  group = NULL,
  options = dggsContinuousTileOptions()
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
```options```     |     use dggsContinuousOptions() function.

## Value


 


