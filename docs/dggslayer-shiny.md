# `dggslayer-shiny`: Shiny bindings for dggslayer

## Description


 Output and render functions for using dggslayer within Shiny
 applications and interactive Rmd documents.


## Usage

```r
dggslayerOutput(outputId, width = "100%", height = "400px")
renderDggslayer(expr, env = parent.frame(), quoted = FALSE)
```


## Arguments

Argument      |Description
------------- |----------------
```outputId```     |     output variable to read from
```width, height```     |     Must be a valid CSS unit (like `'100%'` , `'400px'` , `'auto'` ) or a number, which will be coerced to a string and have `'px'` appended.
```expr```     |     An expression that generates a dggslayer
```env```     |     The environment in which to evaluate `expr` .
```quoted```     |     Is `expr` a quoted expression (with `quote()` )? This is useful if you want to save an expression in a variable.

