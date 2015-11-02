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
	'fixedDataTable',

	'xstyle/css!./EsriFixedDataTable/css/style.css'
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
	FixedDataTable
) {

	return declare([_WidgetBase], {
        //i18n: i18n,
        title: 'EsriFixedDataTable',
        options: {
        	map: null,
        	sources: [],
        	zoomLevel: 12,
        	viewSourceIndex: 0
        },
        constructor: function(options, srcRefNode) {
        	declare.safeMixin(this.options, options);
        	console.log(this.options);
        	this.set('map', this.options.map);
        	this.set('sources', this.options.sources);
        	this.set('viewSourceIndex', 0);
        	this.set('zoomLevel', this.options.zoomLevel);
        	this.set('_tableDivID', srcRefNode);
        	this.startup();
        },
        startup: function() {
        	console.log('EsriFixedDataTable::startup');
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
        	if(!this.get('sources')) {
        		console.log('EsriFixedDataTable::sources required');
        	}
        	this.set('loaded', true);
        	this.emit('load', {});
        	this._initEsriFixedDataTable();
        },
        _initEsriFixedDataTable: function() {
        	var rows = [];
		  	var Table = FixedDataTable.Table;
			var Column = FixedDataTable.Column;
			var map = this.map;
			var viewSourceIndex = this.viewSourceIndex;
			var _sources = this.sources;
			var _selectRowZoomLevel = this.zoomLevel;
			var _tableDivID = this._tableDivID;
			var _getFeatureAttributes = this._getFeatureAttributes;
			var _getTargetFeature = this._getTargetFeature;
			var _listingLayerName = this._listingLayerName;
			var _getLayerInfoIndex = this._getLayerInfoIndex;

        	// Highlight Layer
			var highlightLayer = new GraphicsLayer();
			map.addLayer(highlightLayer);

			// Esri Fixed Data Table UI
			var EsriFixedDataTable = React.createClass({
				displayName: 'EsriFixedDataTable',

				getInitialState: function getInitialState() {
					return {
						rows : _getFeatureAttributes(_sources[viewSourceIndex].layer, _sources[viewSourceIndex].attributes, map.extent),
						selectLayer: this.props.layers[0]
					};
				},

				_rowGetter: function _rowGetter(rowIndex) {
					return this.state.rows[rowIndex];
				},

				getDefaultProps: function getDefaultProps() {
					return {
						layers: _listingLayerName(_sources)
					};
				},

				_onRowSelect: function _onRowSelect(e, index) {
					//console.log(e, index);
					//console.log(this.state.rows[index][0]);
					var g = _getTargetFeature(_sources[viewSourceIndex].layer, _sources[viewSourceIndex].featureId, this.state.rows[index][0], 'click');
					//console.log(g);
					if (g.geometry.type === 'point') {
						map.centerAndZoom(g.geometry, _selectRowZoomLevel);
					} else {
						map.setExtent(g._extent);
					}
				},  

				_onRowMouseEnter: function _onRowMouseEnter(e, index) {
					//console.log(e, index);
					var g = _getTargetFeature(_sources[viewSourceIndex].layer, _sources[viewSourceIndex].featureId, this.state.rows[index][0], 'enter');
					//console.log(g);
					highlightLayer.add(g);
				},

				_onRowMouseLeave: function _onRowMouseLeave(e, index) {
					highlightLayer.clear();
				},

				componentDidMount: function componentDidMount() {
					this.props.map.on('extent-change', function(e) {
						this.setState({ rows: _getFeatureAttributes(_sources[viewSourceIndex].layer, _sources[viewSourceIndex].attributes, e.extent) });
					}.bind(this));
			  	},

				onChangeSelectLayer: function onChangeSelectValue(e) {
					viewSourceIndex = _getLayerInfoIndex(e.target.value, _sources);
					this.setState({
						selectLayer: e.target.value,
						rows: _getFeatureAttributes(_sources[viewSourceIndex].layer, _sources[viewSourceIndex].attributes, map.extent)
					});
				},
			  
				render: function render() {
					var options = this.props.layers.map(function (layer) {
						return React.createElement(
							'option',
							{ className: 'EFDT-option', value: layer, key: layer },
							layer
						);
					});
					return React.createElement(
						'div',
						null,
						React.createElement(
							'div',
							{ className: 'EFDT-layer-select' },
							React.createElement(
								'select',
								{ className: 'EFDT-select', value: this.state.selectLayer, onChange: this.onChangeSelectLayer },
								options
							)
						),
						React.createElement(
							'div',
							{ className: 'EFDT-table' },
							React.createElement(
								Table,
								{
									rowHeight: 30,
									rowGetter: this._rowGetter,
									rowsCount: this.state.rows.length,
									width: 5000,
									height: 300,
									headerHeight: 50,
									onRowClick: this._onRowSelect,
									onRowMouseEnter: this._onRowMouseEnter,
									onRowMouseLeave: this._onRowMouseLeave 
								},
								(function () {
									//console.log(viewSourceIndex);
									return _sources[viewSourceIndex].attributes.map(function (a) {
										var i = _sources[viewSourceIndex].attributes.indexOf(a);
										//console.log(a, i);
										if (i === _sources[viewSourceIndex].attributes.length - 1) {
											return React.createElement(Column, {
												label: a.label,
												width: 200,
												dataKey: i,
												key: i,
												flexGrow: 1
											});
										} else {
											return React.createElement(Column, {
												label: a.label,
												width: 200,
												dataKey: i,
												key: i
											});
										}
									});
								})()
							)
						)
					);
				}
			});

			ReactDOM.render(React.createElement(EsriFixedDataTable, { map: map }), document.getElementById(_tableDivID));
        },
        _listingLayerName: function(sources) {
        	console.log('_listingLayerName');
			var layerNameList = [];
			arrayUtils.forEach(sources, function (s) {
				console.log(s.layer);
				if (s.layer.name) {
					layerNameList.push(s.layer.name);
				} else {
					layerNameList.push(s.layer.id);
				}
			});
			return layerNameList;
		},
		_getLayerInfoIndex: function(name, sources) {
        	console.log('_getLayerInfoIndex');
			var index;
			arrayUtils.forEach(sources, function (s, i) {
				if (s.layer.name === name) {
					index = i;
				}
			});
			return index;
		},
        _getFeatureAttributes: function(layer, attributes, extent) {
			var setRows = [];
			//console.log('getFeatureAttributes');
			arrayUtils.forEach(layer.graphics, function(g) {
				if(geometryEngine.contains(extent, g.geometry)) {
					var row = [];
					arrayUtils.forEach(attributes, function(a, i) {
						row.push(g.attributes[a.name]);
					});
					setRows.push(row);
				}
			});
			//console.log('updatedRowsCount: ', setRows.length);
			return setRows;
        },
        _getTargetFeature: function(layer, featureId, id, type) {
			var targetFeature;
			var _featureId = featureId;
			arrayUtils.forEach(layer.graphics, function(g) {
				if(g.attributes[_featureId] === id) {
					if(type === 'click') {
						//console.log('click!', g);
						targetFeature = g;
					}
					else if(type === 'enter') {
						//console.log('enter!', g);
						var highlightSymbol;
						if(g.geometry.type === 'point') {
							if(g.symbol === undefined) {
								highlightSymbol = new SimpleMarkerSymbol(
									SimpleMarkerSymbol.STYLE_CIRCLE, 
									10,
		    						new SimpleLineSymbol(
		    							SimpleLineSymbol.STYLE_SOLID,
		    							new Color([255,0,0,0.5]), 
		    							2
		    						),
		    						new Color([0,0,0,0])
		    					);
							}
							else {
								highlightSymbol = g.symbol.setOutline(
									new SimpleLineSymbol(
										SimpleLineSymbol.STYLE_SOLID,
		    							new Color([255,0,0,0.5]), 
		    							2
		    						)
		    					);
							}
						}
						else if(g.geometry.type === 'line') {
							if(g.symbol === undefined) {
								highlightSymbol = new SimpleLineSymbol(
									SimpleLineSymbol.STYLE_SOLID,
		    						new Color([255,0,0,0.25]), 
		    						2
		    					);
							}
							else {
								highlightSymbol = g.symbol.setStyle(SimpleLineSymbol.STYLE_SOLID).setColor(new Color([255,0,0,0.5])).setWidth(2);
							}
						}
						else if(g.geometry.type === 'polygon') {
							if(g.symbol === undefined) {
								highlightSymbol = new SimpleFillSymbol(
		          					SimpleFillSymbol.STYLE_SOLID, 
		          					new SimpleLineSymbol(
		            					SimpleLineSymbol.STYLE_SOLID, 
		            					new Color([255,0,0,0.25]), 
		            					3
		          					), 
		          					new Color([0,0,0,0])
		        				);
							}
							else {
								highlightSymbol = g.symbol.setOutline(
									new SimpleLineSymbol(
										SimpleLineSymbol.STYLE_SOLID,
		    							new Color([255,0,0,0.25]), 
		    							2
		    						)
		    					);
							}
						}
						targetFeature = new Graphic(g.geometry, highlightSymbol);
					}
				}
			});

			return targetFeature;
        }
	});
});