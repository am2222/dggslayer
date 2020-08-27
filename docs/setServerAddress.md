# `setServerAddress`: setServerAddress

## Description


 Configure Tileserves's Access URL.


## Usage

```r
setServerAddress(map, server_URL)
```


## Arguments

Argument      |Description
------------- |----------------
```map```     |     a leaflet map
```server_URL```     |     URL of the server. This must be set if you are connecting to another server than IDEAS tile server

## Value


 leaflerR map object


## Examples

```r

m <- leaflet() %>%
setServerAddress(\"https://spatial.wlu.ca/tileserver/")
```