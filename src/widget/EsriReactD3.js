'use strict';

define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dojo/_base/lang',

	'esri/arcgis/utils',
	'esri/layers/GraphicsLayer',
	'esri/graphic',
	'esri/symbols/SimpleMarkerSymbol',
	'esri/symbols/SimpleLineSymbol',
	'esri/symbols/SimpleFillSymbol',
	'esri/Color',
	'esri/geometry/geometryEngine',

	'dojo/_base/array',

	'react', 
	'react-dom',

	//'d3',
	'react-d3',

	'xstyle/css!./EsriReactD3/css/style.css'
], function(
	declare, 
	_WidgetBase,
	lang, 

	arcgisUtils, 
	GraphicsLayer,
	Graphic,
	SimpleMarkerSymbol,
	SimpleLineSymbol,
	SimpleFillSymbol,
	Color,
	geometryEngine,

	arrayUtils,

	React, 
	ReactDOM,

	//D3,
	ReactD3
) {

	return declare([_WidgetBase], {
        //i18n: i18n,
        title: 'EsriReactD3',
        options: {
        	map: null,
        	sources: [],
        	zoomLevel: 12
        },
        constructor: function(options, srcRefNode) {
        	declare.safeMixin(this.options, options);
        	console.log(this.options);
        	this.set('map', this.options.map);
        	this.set('source', this.options.source);
        	this.set('zoomLevel', this.options.zoomLevel);
        	this.set('chartType', this.options.chartType);
        	this.set('_chartDivID', srcRefNode);
        	this.startup();
        },
        startup: function() {
        	console.log('EsriFixedDataTable::startup')
        	if(!this.map) {
        		this.destroy();
        		console.log('EsriFixedDataTable::map required');
        	}
        	if(this.map.loaded) {
        		this._init();
        	}
        	else {
        		on(this.map, 'load', lang.hitch(this, function() {
        			this._init();
        		}));
        	}
        },
        destroy: function() {
        	this.inherited(arguments);
        },
        _init: function() {
        	if(!this.get('source')) {
        		console.log('EsriFixedDataTable::source required');
        	}
        	this.set('loaded', true);
        	this.emit('load', {});
        	if(this.chartType === 'BarChart') {
        		this._initEsriReactD3BarChart();
        	}
        	else if(this.chartType === 'PieChart') {
        		this._initEsriReactD3PieChart();
        	}
        	else if(this.chartType === 'AreaChart') {
        		this._initEsriReactD3AreaChart();
        	}
        	else if(this.chartType === 'ScatterPlot') {
        		this._initEsriReactD3ScatterPlot();
        	}
        	else if(this.chartType === 'LineChart') {
        		this._initEsriReactD3LineChart();
        	}
        }, 
        _initEsriReactD3BarChart: function() {
        	console.log('EsriReactD3::_initEsriReactD3BarChart');

			var _chartDivID = this._chartDivID;
			var map = this.map;
			var _source = this.source;
			var _getFeatureAttributes = this._getFeatureAttributes;

		    var BarChart = ReactD3.BarChart;              
		    var PieChart = ReactD3.PieChart;
		    var AreaChart = ReactD3.AreaChart;
		    var ScatterPlot = ReactD3.ScatterPlot;
		    var LineChart = ReactD3.LineChart;
		    var Brush = ReactD3.Brush;

			console.log(_source);
			console.log(_source.layer);

			//** テスト実装 **//

			var data = [{
				label: _source.layer.name,
				values: _getFeatureAttributes(_source, map.extent)
				//values: [{ x: 'SomethingA', y: 10 }, { x: 'SomethingB', y: 4 }, { x: 'SomethingC', y: 3 }]
			}];

			var tooltip = function(x, y0, y, total) {
				return y.toString();
			};

			var EsriReactD3BarChart = React.createClass({
				displayName: 'EsriReactD3BarChart',
				getInitialState: function getInitialState() {
					return { data: data };
				},
				componentDidMount: function componentDidMount() {
					this.props.map.on('extent-change', function(e) {
						console.log('map::extent-change');
						this.setState({ data: { label: _source.layer.name, values: _getFeatureAttributes(_source, e.extent) } });
					}.bind(this));
			  	},
				render: function render() {
					return React.createElement(BarChart, {
						data: this.state.data,
						width: 900,
						height: 300,
						margin: { top: 10, bottom: 50, left: 50, right: 10 },
						tooltipHtml: tooltip
					});
				}
			});

			ReactDOM.render(React.createElement(EsriReactD3BarChart, { map: map }), document.getElementById(_chartDivID));

			//** テスト実装ここまで **//
        },

        _initEsriReactD3PieChart: function() {
        	console.log('EsriReactD3::_initEsriReactD3PieChart');

			var _chartDivID = this._chartDivID;
			var map = this.map;
			var _source = this.source;
			var _getFeatureAttributes = this._getFeatureAttributes;

		    var PieChart = ReactD3.PieChart;
		    var tooltipPie = function tooltipPie(x, y) {
			    return y.toString();
			};
			var data = {
				label: _source.layer.name,
				values: _getFeatureAttributes(_source, map.extent)
			};

			var EsriReactD3PieChart = React.createClass({
				displayName: 'EsriReactD3PieChart',
				getInitialState: function getInitialState() {
					return { data: data };
				},
				componentDidMount: function componentDidMount() {
					this.props.map.on('extent-change', function(e) {
						console.log('map::extent-change');
						this.setState({ data: { label: _source.layer.name, values: _getFeatureAttributes(_source, e.extent) } });
					}.bind(this));
			  	},
				render: function render() {
					return React.createElement(PieChart, {
						data: this.state.data,
						width: 600,
						height: 300,
						margin: { top: 10, bottom: 10, left: 100, right: 100 },
			    		tooltipOffset: { top: 0, left: 15 },
						tooltipHtml: tooltipPie,
						tooltipMode: 'fixed',
						sort: null
					});
				}
			});

			ReactDOM.render(React.createElement(EsriReactD3PieChart, { map: map }), document.getElementById(_chartDivID));
        },

        _initEsriReactD3AreaChart: function() {
        	console.log('EsriReactD3::_initEsriReactD3AreaChart');

			var _chartDivID = this._chartDivID;
			var map = this.map;
			var _source = this.source;
			var _getFeatureAttributes = this._getFeatureAttributes;
			var _compareNumbers = this._compareNumbers;

		    var AreaChart = ReactD3.AreaChart;
		    var tooltipArea = function tooltipArea(y, cumulative, x) {
			    return "Total: " + cumulative + " X: " + x + " Y: " + y;
			};
			var data = {
				label: _source.layer.name,
				values: _getFeatureAttributes(_source, map.extent).sort(_compareNumbers)
			};

			var EsriReactD3AreaChart = React.createClass({
				displayName: 'EsriReactD3AreaChart',
				getInitialState: function getInitialState() {
					return { data: data };
				},
				componentDidMount: function componentDidMount() {
					this.props.map.on('extent-change', function(e) {
						console.log('map::extent-change');
						this.setState({ data: { label: _source.layer.name, values: _getFeatureAttributes(_source, e.extent).sort(_compareNumbers) } });
					}.bind(this));
			  	},
				render: function render() {
					return React.createElement(AreaChart, {
						data: this.state.data,
						width: 900,
						height: 300,
    					margin: { top: 10, bottom: 50, left: 50, right: 10 },
						tooltipHtml: tooltipArea
					});
				}
			});

			ReactDOM.render(React.createElement(EsriReactD3AreaChart, { map: map }), document.getElementById(_chartDivID));
        },

        _initEsriReactD3ScatterPlot: function() {
        	console.log('EsriReactD3::_initEsriReactD3ScatterPlot');

			var _chartDivID = this._chartDivID;
			var map = this.map;
			var _source = this.source;
			var _getFeatureAttributes = this._getFeatureAttributes;

		    var ScatterPlot = ReactD3.ScatterPlot;
		    var tooltipScatter = function tooltipScatter(x, y) {
			    return "x: " + x + " y: " + y;
			};
			var data = {
				label: _source.layer.name,
				values: _getFeatureAttributes(_source, map.extent)
			};

			var EsriReactD3ScatterPlot = React.createClass({
				displayName: 'EsriReactD3ScatterPlot',
				getInitialState: function getInitialState() {
					return { data: data };
				},
				componentDidMount: function componentDidMount() {
					this.props.map.on('extent-change', function(e) {
						console.log('map::extent-change');
						this.setState({ data: { label: _source.layer.name, values: _getFeatureAttributes(_source, e.extent) } });
					}.bind(this));
			  	},
				render: function render() {
					return React.createElement(ScatterPlot, {
						data: this.state.data,
						width: 600,
						height: 300,
    					margin: { top: 10, bottom: 50, left: 50, right: 10 },
					    tooltipHtml: tooltipScatter,
					    xAxis: { innerTickSize: 6, label: _source.attributes.x.label },
					    yAxis: { label: _source.attributes.y.label }
					});
				}
			});

			ReactDOM.render(React.createElement(EsriReactD3ScatterPlot, { map: map }), document.getElementById(_chartDivID));
        },

        _initEsriReactD3LineChart: function() {
        	console.log('EsriReactD3::_initEsriReactD3LineChart');

			var _chartDivID = this._chartDivID;
			var map = this.map;
			var _source = this.source;
			var _getFeatureAttributes = this._getFeatureAttributes;
			var _compareNumbers = this._compareNumbers;

		    var LineChart = ReactD3.LineChart;
		    var tooltipLine = function tooltipLine(label, data) {
			    return label + " x: " + data.x + " y: " + data.y;
			};
			var data = {
				label: _source.layer.name,
				values: _getFeatureAttributes(_source, map.extent).sort(_compareNumbers)
			};
			var dashFunc = function dashFunc(label) {
			    if (label == _source.layer.name) {
			        return '4 4 4';
			    }
			    if (label == '') {
			        return '3 4 3';
			    }
			};
			var widthFunc = function widthFunc(label) {
			    if (label == _source.layer.name) {
			        return '4';
			    }
			    if (label == '') {
			        return '2';
			    }
			};	

			var EsriReactD3LineChart = React.createClass({
				displayName: 'EsriReactD3LineChart',
				getInitialState: function getInitialState() {
					return { data: data };
				},
				componentDidMount: function componentDidMount() {
					this.props.map.on('extent-change', function(e) {
						console.log('map::extent-change');
						this.setState({ data: { label: _source.layer.name, values: _getFeatureAttributes(_source, e.extent).sort(_compareNumbers) } });
					}.bind(this));
			  	},
				render: function render() {
					return React.createElement(LineChart, {
						data: this.state.data,
						width: 600,
						height: 300,
					    margin: { top: 10, bottom: 50, left: 50, right: 10 },
					    tooltipHtml: tooltipLine,
					    tooltipContained: true,
					    xAxis: { innerTickSize: 6, label: _source.attributes.x.label },
					    yAxis: { label: _source.attributes.y.label },
					    shapeColor: "red",
					    stroke: { strokeDasharray: dashFunc, strokeWidth: widthFunc }
					});
				}
			});

			ReactDOM.render(React.createElement(EsriReactD3LineChart, { map: map }), document.getElementById(_chartDivID));

        },

        _getFeatureAttributes: function(source, extent) {
        	var layer = source.layer;
        	var attributes = source.attributes;
			var values = [];
			arrayUtils.forEach(layer.graphics, function(g) {
				if(geometryEngine.contains(extent, g.geometry)) {
					var value = { x: g.attributes[attributes.x.name], y: g.attributes[attributes.y.name] };
					values.push(value);
				}
			});
			return values;
        },

        _compareNumbers: function(a, b) {
        	return a.y - b.y;
        }
	});
});