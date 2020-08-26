# `setServerAddress`: setServerAddress
 Configure Tileserves's Access URL.

## Description


 setServerAddress
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


 


## Examples

```   
m <- leaflet() %>%
setServerAddress("https://spatial.wlu.ca/tileserver/")%>% ```   