L.Control.HtmlLegend = L.Control.extend({
    _map: null,
    _activeLayers: 0,
    _alwaysShow: false,
    _legendSymbologies: [
        ["yellow-008ae5", ['yellow', '008ae5']],
        ["yellow-red-black", ['yellow', 'red', 'black']],
        ["yellow-navy", ['yellow', 'navy']],
        ["red-green", ['#f00', '#0f0']],
        ["RdYlBu", 'RdYlBu'],
        ["OrRd", 'OrRd'],
        ["YlGnBu", 'YlGnBu'],
        ["Spectral", 'Spectral'],
        ["Spectral", 'Spectral']
    ],
    _classificationMethods: [
        ["EqInterval", "EqInterval"],
        ["StdDeviation", "StdDeviation"],
        ["GeometricProgression", "GeometricProgression"],
        ["ArithmeticProgression", "ArithmeticProgression"]
    ],
    legendTypes:{
        NOMINAL:1,
        CONTINIUES:2,
        DISCRATE:3
    },
    options: {
        position: 'topright',

        // array of legend entries - see README for format
        legends: [],

        // if true, legend entries that are from a simple renderer will use compact presentation
        collapseSimple: false,

        // if true, will test to see if legend entries look stretched; these are usually in sets of 3 with the middle element having no label
        detectStretched: false,

        // if true, legends will be collapsed when a new instance is initialized
        collapsedOnInit: false,

        disableOpacityControl: false,
        disableSymbologyControl: false,
        updateOpacity: null,
        defaultOpacity: 1,
        visibleIcon: 'leaflet-html-legend-icon-eye',
        hiddenIcon: 'leaflet-html-legend-icon-eye-slash',
        toggleIcon: 'leaflet-html-legend-icon-eye'
    },

    onAdd(map) {
        this._map = map;
        this._container = L.DomUtil.create('div', 'leaflet-control leaflet-bar leaflet-html-legend');
        this._lastId = 0;
        this._entries = {};

        // Disable events on container
        L.DomEvent.disableClickPropagation(this._container);
        L.DomEvent.disableScrollPropagation(this._container);

        this.render();

        return this._container;
    },

    render() {
        L.DomUtil.empty(this._container);

        this.options.legends.forEach(legend => this._renderLegend(legend), this);

        this._checkVisibility();
    },

    addLegend(legend) {
        if (this._map) {
            this._renderLegend(legend);
            return this._lastId;
        }
        throw Error('Legend control must be added to the map first.')
    },

    removeLegend(itemIdx) {
        const entry = this._entries[itemIdx]
        if (entry) {
            if (entry.layer && entry.events) {
                Object.entries(entry.events).forEach(([event, handler]) => entry.layer.off(event, handler))
            }
            L.DomUtil.remove(this._entries[itemIdx].container)
            delete this._entries[itemIdx]
        }
    },

    _renderLegend(legend) {
        if (!legend.elements) {
            return;
        }

        const elements = legend.elements;

        let className = 'legend-block';

        if (this.options.detectStretched) {
            if (
                elements.length === 3 &&
                elements[0].label !== '' &&
                elements[1].label === '' &&
                elements[2].label !== ''
            ) {
                className += ' legend-stretched';
            }
        }

        const block = L.DomUtil.create('div', className, this._container);
        const entryIdx = ++this._lastId;
        this._entries[entryIdx] = {
            container: block
        }

        if (this.options.collapseSimple && elements.length === 1 && !elements[0].label) {
            this._addElement(elements[0].html, legend.name, elements[0].style, block, legend);
            this._connectLayer(block, legend, entryIdx);
            return block;
        }

        if (legend.name) {
            const header = L.DomUtil.create('h4', null, block);
            L.DomUtil.create('div', 'legend-caret', header);
            L.DomUtil.create('span', null, header).innerHTML = legend.name;

            if (this.options.collapsedOnInit) {
                L.DomUtil.addClass(header, 'closed');
            }

            L.DomEvent.on(header, 'click', () => {
                if (L.DomUtil.hasClass(header, 'closed')) {
                    L.DomUtil.removeClass(header, 'closed');
                } else {
                    L.DomUtil.addClass(header, 'closed');
                }
            }, this);
        }

        const elementContainer = L.DomUtil.create('div', 'legend-elements', block);

        elements.forEach((element) => {
            this._addElement(element.html, element.label, element.style, elementContainer, element);
        }, this);

        this._connectLayer(block, legend, entryIdx);
        return block;
    },

    _addElement(html, label, style, container, legend) {
        const row = L.DomUtil.create('div', 'legend-row', container);
        const symbol = L.DomUtil.create('span', ' legend', row);
        if (style) {
            Object.entries(style).forEach(([k, v]) => {
                symbol.style[k] = v;
            });
        }
        symbol.innerHTML = this._resRec(label, legend, symbol);

    },

    IsNumeric(val) {
        return Number(parseFloat(val)) === val;
    },

    // _showColors(lable) {

    //     var resDisplay = L.DomUtil.create('div', 'info legend');
    //     try {
    //         resDisplay.innerHTML = resRec(colorFunction)
    //     } catch (e) {
    //         console.warn(e);
    //     }
    //     return resDisplay;
    // },

    _resRec(label, legend, container) {
        // if (Array.isArray(d)) {
        //     //TODO:For disperse classes
        //     return '[' + d.map(d.length > 2 ? resShort : resLong).join(',') + ']';
        // }
        return this._resLong(label, legend, container);

    },
    _getNumericalLegendItemHTML(layer){
        var ranges = layer.options.legend.geoStatObject.getRanges();
        if (!ranges){
            throw  Error('Numerical Legend needs to have geoStat object');
        }
        var elements = []
        var result = "";
        for (var i = 0; i < (ranges.length); i++) {

            console.log("Ranges : " + ranges[i]);
            // default mode
            var tmp = ranges[i].split(layer.options.legend.geoStatObject.getSeparator());
            var start_value = parseFloat(tmp[0]).toFixed(layer.options.legend.geoStatObject.getPrecision());
            var end_value = parseFloat(tmp[1]).toFixed(layer.options.legend.geoStatObject.getPrecision());
            // if mode == 'distinct' and we are not working on the first value
            if (layer.options.legend.mode && layer.options.legend.mode == 'distinct' && i != 0) {
                if (isInt(start_value)) {
                    start_value = parseInt(start_value) + 1;
                    // format to float if necessary
                    if (layer.options.legend.geoStatObject.getPrecisionFlag() == 'manual' && layer.options.legend.geoStatObject.getPrecision() != 0)
                        start_value = parseFloat(start_value).toFixed(layer.options.legend.geoStatObject.getPrecision());
                }
                else {
                    start_value = parseFloat(start_value) + (1 / Math.pow(10, layer.options.legend.geoStatObject.getPrecision()));
                    // strangely the formula above return sometimes long decimal values,
                    // the following instruction fix it
                    start_value = parseFloat(start_value).toFixed(layer.options.legend.geoStatObject.getPrecision());
                }
            }
            // if mode == 'discontinuous'
            // if (legend.layer.options.legend.mode && legend.layer.options.legend.mode  == 'discontinuous') {
            // 	var tmp = this.inner_ranges[i].split(legend.layer.options.legend.geoStatObject.getSeparator()));
            // 	// console.log("Ranges : " + this.inner_ranges[i]);
            // 	var start_value = parseFloat(tmp[0]).toFixed(legend.layer.options.legend.geoStatObject.getPrecision());
            // 	var end_value = parseFloat(tmp[1]).toFixed(legend.layer.options.legend.geoStatObject.getPrecision());
            // }
            // we apply callback function
            var el = (start_value) + layer.options.legend.geoStatObject.getSeparator() + (end_value);
            var block = '<i style="border: 1px solid #000;background: '+layer.options.legend.geoStatObject.colors[i]+'"></i><span>'+el+'</span><br>';
            elements.push(block);
            // var block = '<div><div class="geostats-legend-block" style="background-color:' + ccolors[i] + '"></div> ' + el + cnt + '</div>';
            // elements.push(block);
        }
        if (layer.options.legend.order === 'DESC')
            elements.reverse();

        for (var i = 0; i < (elements.length); i++) {
            result += elements[i];
        }
        return result;
    },
    _resLong(label, legend, container) {


        if (legend.layer.options.legend.addTransparencyControl) {

        }

        if (legend.layer.options.legend.addSymbologyControl) {

        }

        if (legend.layer.options.legend.continus) {

        }
        var colSpan = legend.layer.options.legend.addSymbologyControl ? 4 : 3


        if (legend.layer.options.vectorTileLayerName.vectorTileLayerName) {

        }

        if (legend.layer.options.legend.type === "continuous") {
            var rowSpan = legend.layer.options.legend.classLables ? layerOptions.legend.classLables : 3

            const div = L.DomUtil.create('div', 'custom-table-wrapper');
            const table = L.DomUtil.create('table', 'custom-table', div);
            const tbody = L.DomUtil.create('tbody', null, table);

            const tr = L.DomUtil.create('tr', null, tbody);
            const th = L.DomUtil.create('th', null, tr);
            th.colSpan = 4;
            th.innerText = legend.layer.options.vectorTileLayerName ? legend.layer.options.vectorTileLayerName : "Lable"
            if (legend.name) {
                L.DomUtil.create('label', null, th).innerHTML = name;
            }

            [colors, dmax, dmin] = this._getContinuousLegendColors(legend.layer.options)


            const tr2 = L.DomUtil.create('tr', null, tbody);
            const td1 = L.DomUtil.create('td', 'slidercontainer', tr2);
            td1.style = "background-image: linear-gradient(to top," + colors.join(',') + ");"
            td1.rowSpan = rowSpan
            td1.id = "backgroundCell"



            const td2 = L.DomUtil.create('td', 'line', tr2);
            L.DomUtil.create('hr', null, td2);
            const td3 = L.DomUtil.create('td', 'data', tr2);
            td3.innerText = dmax.toFixed(2).toString();




            for (let i = 0; i < rowSpan - 1; i++) {
                const _tr = L.DomUtil.create('tr', null, tbody);
                const _td1 = L.DomUtil.create('td', 'line', _tr);
                L.DomUtil.create('hr', null, _td1);
                const _td2 = L.DomUtil.create('td', 'data', _tr);
                _td2.innerText = (dmax - (i + 1) * (Math.abs(dmax - dmin) / rowSpan)).toFixed(2).toString()
            }

            const selectContainer = L.DomUtil.create('tr', null, tbody);
            const td_0 = L.DomUtil.create('td', 'selectContainer', selectContainer);
            td_0.colSpan = 4;

            return div.innerHTML;

        }else if (legend.layer.options.legend.type === "nominal"){
            //we need to disable change of symbology for the nominal methods since they have to be colored based on the colorfunction
            this.options.disableOpacityControl=false;
            this.options.disableSymbologyControl=true;
            if(!legend.layer.options.legend.classNames||Object.keys(legend.layer.options.legend.classNames).length==0){
                throw "for the nominal type of legend you must provide a none empty two dimentional classNames option!";
            }
            var div = L.DomUtil.create("div", "legend");
            if (legend.name) {
                div.innerHTML += "<h4>"+legend.name+"</h4>";
            }

            Object.keys(legend.layer.options.legend.classNames).forEach(key => {
                var value= legend.layer.options.legend.classNames[key];
                div.innerHTML += '<i style="border: 1px solid #000;background: '+value[2]+'"></i><span>'+value[0]+'</span><br>';
            });
            // const selectContainer = L.DomUtil.create('div', null, div);
            // const td_0 = L.DomUtil.create('div', 'selectContainer', selectContainer);
            const sliderContainer = L.DomUtil.create('div', null, div);
            const td_1 = L.DomUtil.create('div', 'slidercontainer', sliderContainer);
            return div.innerHTML

        }else if (legend.layer.options.legend.type === "numerical"){
            // numerical classes

            //we need to disable change of symbology for the nominal methods since they have to be colored based on the colorfunction
            this.options.disableOpacityControl=false;
            this.options.disableSymbologyControl=false;

            var div = L.DomUtil.create("div", "legend");
            if (legend.name) {
                div.innerHTML += "<h4>"+legend.name+"</h4>";
            }

            if (!legend.layer.options.legend.order || legend.layer.options.legend.order!= 'DESC')
                    legend.layer.options.legend.order = 'ASC';

            const legendItemsContainer = L.DomUtil.create('div', "legendcontainer", div);
            legendItemsContainer.style = " line-height: 2;";
            //FIXME:
            
            legendItemsContainer.innerHTML += this._getNumericalLegendItemHTML(legend.layer);
            //for opacity control
            const sliderContainer = L.DomUtil.create('div', null, div);
            const td_0 = L.DomUtil.create('div', 'slidercontainer', sliderContainer);

            //for the classification control
            const classificationContainer = L.DomUtil.create('div', null, div);
            const td_1 = L.DomUtil.create('div', 'classificationcontainer', classificationContainer);

            //for class number control
            const classNumberContainer = L.DomUtil.create('div', null, div);
            const td_2= L.DomUtil.create('div', 'classnumbercontainer', classNumberContainer);

            //for color spectrom
            const selectContainer = L.DomUtil.create('div', null, div);
            const td_3 = L.DomUtil.create('div', 'selectContainer', selectContainer);
            return div.innerHTML
        }




    },
    _getContinuousLegendColors(layerOptions) {

        var dom = layerOptions.legend.domain ? layerOptions.legend.domain : [0, 1],
            dmin = Math.min(dom[0], dom[dom.length - 1]),
            dmax = Math.max(dom[dom.length - 1], dom[0]);
        var colors = []

        for (var i = 0; i <= 100; i++) {
            colors.push(layerOptions.vectorTileLayerStyles[layerOptions.vectorTileLayerName]({
                VALUE: (dmin + i / 100 * (dmax - dmin))
            }).fillColor)
        }
        return [colors, dmax, dmin];
    },
    _resShort(d) {
        if (typeof d == 'string') {
            // string color, e.g. hex value
            return '<span class="cm-string cm-color cm-small" data-color="' + d +
                '"><span class="cm-hidden-text">\'' + chroma(d).hex() + '\'</span></span>';
        } else if (typeof d == 'object' && d._rgb) {
            // chroma.js object
            return '<span class="cm-string cm-color cm-small" data-color="' + d.css() +
                '"><span class="cm-hidden-text">\'' + d.hex() + '\'</span></span>';
        } else if (isNumeric(d)) {
            return '<span class="cm-number">' + round(d, 2) + '</span>';
        } else if (isNaN(d)) {
            return '<span class="cm-number cm-nan">NaN</span>';
        }
    },

    _round(d, p) {
        var n = Math.pow(10, p);
        return Math.round(d * n) / n;
    },

    _updateOpacity(layer, opacity) {
        if (typeof this.options.updateOpacity === 'function') {
            this.options.updateOpacity(layer, opacity)
        } else if (typeof layer.setOpacity === 'function') {
            layer.setOpacity(opacity);
        } else if (typeof layer.setStyle === 'function') {
            layer.setStyle({
                opacity
            });
        }
    },

    _layerAdd(container) {
        this._activeLayers += 1;
        container.style.display = '';
        this._checkVisibility();
    },

    _layerRemove(container) {
        this._activeLayers -= 1;
        container.style.display = 'none';
        this._checkVisibility();
    },

    _updateLegendItems(layer) {
       switch(layer.options.legend.type){
                  case "numerical":
                     
                     var slider = document.getElementsByClassName('legendcontainer')[0]
                    slider.innerHTML = this._getNumericalLegendItemHTML(layer);
                    break;
                  case "continuous":
                    [colors, dmax, dmin] = this._getLegendColors(layer.options);
                    var slider = document.getElementsByClassName('slidercontainer')[0]
                    slider.style.backgroundImage = "linear-gradient(to top,"+colors.join(',')+")";

                    break;
                }
    },
    _connectLayer(container, legend, entryIdx) {
        const layer = legend.layer;

        if (!layer) {
            this._alwaysShow = true;
            return;
        }

        if (this._map.hasLayer(layer)) {
            this._activeLayers += 1;
        } else {
            container.style.display = 'none';
        }

        container.classList.add('layer-control');

        if (!this.options.disableOpacityControl) {
            const opacity = layer.opacity || this.options.defaultOpacity || 1;
            this._updateOpacity(layer, opacity);

            const toggleButton = L.DomUtil.create('i', `visibility-toggle ${this.options.toggleIcon}`, container);
            toggleButton.dataset.visibileOpacity = opacity;


            L.DomEvent.on(toggleButton, 'click', (e) => {
                const button = e.target;
                if (L.DomUtil.hasClass(button, 'disabled')) {
                    L.DomUtil.removeClass(button, 'disabled');
                    this._updateOpacity(layer, button.dataset.visibileOpacity);
                } else {
                    L.DomUtil.addClass(button, 'disabled');
                    this._updateOpacity(layer, 0);
                }
            });



            var slider = container.getElementsByClassName('slidercontainer')[0]
            const opacityController = L.DomUtil.create('span', '', slider);
            // L.DomUtil.create('span', 'slider-label', opacityController).innerHTML = 'Transparency:';

            // L.DomUtil.create('i', this.options.visibleIcon, opacityController);

            const opacitySlider = L.DomUtil.create('input', null, opacityController);
            opacitySlider.type = 'range';
            opacitySlider.min = 0;
            opacitySlider.max = 1;
            opacitySlider.step = 0.1;
            if(legend.layer.options.legend.type=="continuous"){
                opacitySlider.orient = 'vertical';
                opacitySlider.style = '-webkit-appearance: slider-vertical;    width: 0px;';
            }else{
                opacitySlider.style = 'width: 100%;';
            }

            opacitySlider.onchange = ((e) => {
                const newOpacity = 1 - e.target.value || 0;
                this._updateOpacity(layer, newOpacity);
                toggleButton.dataset.visibileOpacity = newOpacity;
                L.DomUtil.removeClass(toggleButton, 'disabled');
            });
            opacitySlider.value = 1 - (opacity);

            // L.DomUtil.create('i', this.options.hiddenIcon, opacityController);
        };


        if(!this.options.disableSymbologyControl){
            var select = container.getElementsByClassName('selectContainer')[0]
            const selectController = L.DomUtil.create('select', '', select);
            selectController.style = "width: 100%;"
            selectController.id = "symbology_select"

            for (let i = 0; i < this._legendSymbologies.length; i++) {
                var o1 = L.DomUtil.create('option', '', selectController);
                o1.value = i;
                o1.innerText =  this._legendSymbologies[i][0]

            }


            L.DomEvent.on(selectController, 'change', (e) => {
                console.log(e)
                var select_id = document.getElementById("symbology_select");


                var scale = chroma.scale(this._legendSymbologies[select_id.selectedIndex][1]).domain(layer.options.legend.domain).mode('lrgb');
                layer.setStyle(scale)

                this._map.invalidateSize();
                layer.redraw();
                //update legend items that only happens for the continuous and numerical types
                this._updateLegendItems(layer);


            });

            if(layer.options.legend.type == "numerical"){
                var select = container.getElementsByClassName('classificationcontainer')[0]
                const classificationController = L.DomUtil.create('select', '', select);
                classificationController.style = "width: 100%;"
                classificationController.id = "classification_select"

                for (let i = 0; i < this._classificationMethods.length; i++) {
                    var o1 = L.DomUtil.create('option', '', classificationController);
                    o1.value = this._classificationMethods[i][1];
                    o1.innerText =  this._classificationMethods[i][0]
                    if (layer.options.legend.classificationType == o1.value)
                        o1.selected = true;

                }
                L.DomEvent.on(classificationController, 'change', (e) => {
                    console.log(e)
                    //change map rendering
                    layer.options.legend.classificationType = e.target.value;
                    switch (e.target.value) {
                        case "StdDeviation":
                            layer.options.legend.geoStatObject.getClassStdDeviation(layer.options.legend.classNumber)
                            break;
                        case "GeometricProgression":
                            layer.options.legend.geoStatObject.getClassGeometricProgression(layer.options.legend.classNumber)
                            break;
                        case "ArithmeticProgression":
                            layer.options.legend.geoStatObject.getClassArithmeticProgression(layer.options.legend.classNumber)
                            break;
                        default: 
                        case "EqInterval":
                            layer.options.legend.geoStatObject.getClassEqInterval(layer.options.legend.classNumber)
                            break;
                    }
        
        
                    layer.options.colorFunction= function(value){
                        return layer.options.legend.geoStatObject.getColor(value);
                    };


                    layer.setStyle(layer.options.scale,layer.options.colorFunction);
                    this._map.invalidateSize();
                    layer.redraw();
                    //update legend items that only happens for the continuous and numerical types
                    this._updateLegendItems(layer);


                  });

                var select = container.getElementsByClassName('classnumbercontainer')[0]
                const classNumberController = L.DomUtil.create('select', '', select);
                classNumberController.style = "width: 100%;"
                classNumberController.id = "classNumberController_select"
                for (let i = 0; i < 10; i++) {
                    var o1 = L.DomUtil.create('option', '', classNumberController);
                    o1.value = i;
                    o1.innerText = i;
                    if (layer.options.legend.classNumber == o1.value)
                         o1.selected = true;

                }

                L.DomEvent.on(classNumberController, 'change', (e) => {
                    console.log(e)
                    //change map rendering
                    layer.options.legend.classNumber = e.target.value;
                    switch (layer.options.legend.classificationType) {
                        case "StdDeviation":
                            layer.options.legend.geoStatObject.getClassStdDeviation(layer.options.legend.classNumber)
                            break;
                        case "GeometricProgression":
                            layer.options.legend.geoStatObject.getClassGeometricProgression(layer.options.legend.classNumber)
                            break;
                        case "ArithmeticProgression":
                            layer.options.legend.geoStatObject.getClassArithmeticProgression(layer.options.legend.classNumber)
                            break;
                        default: 
                        case "EqInterval":
                            layer.options.legend.geoStatObject.getClassEqInterval(layer.options.legend.classNumber)
                            break;
                    }
        
                    layer.options.colorFunction= function(value){
                        return layer.options.legend.geoStatObject.getColor(value);
                    };


                    layer.setStyle(layer.options.scale,layer.options.colorFunction);
                    this._map.invalidateSize();
                    layer.redraw();
                    //update legend items that only happens for the continuous and numerical types
                    this._updateLegendItems(layer);


                  });


            }

        }
        const layerAdd = this._layerAdd.bind(this, container)
        const layerRemove = this._layerRemove.bind(this, container)
        layer.on('add', layerAdd).on('remove', layerRemove)
        this._entries[entryIdx].layer = layer
        this._entries[entryIdx].events = {
            add: layerAdd,
            remove: layerRemove
        }
    },

    _checkVisibility() {
        if (this._alwaysShow || this._activeLayers) {
            this._container.style.display = '';
        } else {
            this._container.style.display = 'none';
        }
    }
});

L.control.htmllegend = options => new L.Control.HtmlLegend(options);
