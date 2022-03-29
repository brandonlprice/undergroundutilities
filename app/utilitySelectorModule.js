define(["dojo/on", "dojo/_base/declare", "dojo/dom-construct",
    "esri/tasks/QueryTask", "esri/tasks/query", "esri/geometry/Polyline", "esri/symbols/CartographicLineSymbol",
    "esri/graphic", "app/utilitySelectorConfig", "esri/Color", "esri/geometry/webMercatorUtils"],
    function (on, declare, domConstruct,
        QueryTask, Query, Polyline, CartographicLineSymbol,
        Graphic, UtilitySelectorConfig, Color, WebMercatorUtils) {
        return declare(null, {

            postMilePnlID: '#SelectorTable',

            isVisible: false,
            template: undefined,
            panel: undefined,
            countyDllEl: undefined,
            routeDllEl: undefined,
            beginPostMarkerDdlEl: undefined,
            endPostMarkerDdlEl: undefined,
            postmileMarkers: undefined,
            _config: new UtilitySelectorConfig(),

            pnlPostMileSelector: undefined,
            utilityGraphicsLayer: undefined,

            init: function () {
                let ctx = this;

                // TODO Create our own graphics layer
                //ctx.utilityGraphicsLayer = new Graphicslayer();
                //app.map.add(ctx.utilityGraphicsLayer);

                ctx.pnlPostMileSelector = $(this.postMilePnlID);

                ctx.countyDllEl = $('#usCountyDdl');
                ctx.countyDllEl.on('change', function (evt) {
                    ctx.onCountyDdlChange(evt, ctx)
                });

                ctx.routeDllEl = $('#usRouteDdl');
                ctx.routeDllEl.on('change', function (evt) {
                    ctx.onRouteDdlChange(evt, ctx);
                });

                ctx.beginPostMarkerDdlEl = $('#usStartMarkerDdl');
                ctx.endPostMarkerDdlEl = $('#usEndMarkerDdl');

                ctx.populateCountyDdl(null, ctx);

                //Link to go button
                $('#goButton').click(evt => {
                    ctx.go();
                })
            }, // init

            hide: function () {
                this.pnlPostMileSelector.hide();
                this.isVisible = false;
                // TODO: create our own layer and not use the default for portability reasons.
                app.map.graphics.clear();
            },

            show: function () {
                this.pnlPostMileSelector.show();
                this.isVisible = true;
            }, //onShow

            go: function () {
                let ctx = this;
                // TODO: create our own layer and not use the default for portability reasons.
                //ctx.utilityGraphicsLayer.clear();

                // ctx.postmileMarkers
                let post1 = ctx.beginPostMarkerDdlEl.val();
                let post2 = ctx.endPostMarkerDdlEl.val();

                let resultSet = [];
                let isCaptureOn = false;
                $.map(ctx.postmileMarkers, (item, idx) => {
                    if (post1 == item.attributes['DYNSEGPM'] || post2 == item.attributes['DYNSEGPM']) {
                        if (isCaptureOn) {
                            resultSet.push(item);
                        }
                        isCaptureOn = !isCaptureOn;
                    }
                    if (isCaptureOn) {
                        resultSet.push(item);
                    }
                });

                let paths = [];
                $.map(resultSet, (line, idx) => {
                    $.merge(paths, line.geometry.paths);
                });

                let postMileMarkerPolyline = new Polyline({
                    paths: paths,
                    spatialReference: resultSet[0].geometry.spatialReference
                });

                let lineSymbol = new CartographicLineSymbol();
                lineSymbol.setColor(new Color([255, 0, 0, 1]));
                lineSymbol.setCap(CartographicLineSymbol.CAP_SQUARE);
                lineSymbol.setStyle(CartographicLineSymbol.STYLE_DASH);
                lineSymbol.setWidth(4);

                //let convertedGeom = WebMercatorUtils.geographicToWebMercator(postMileMarkerPolyline);
                app.map.graphics.add(new Graphic(postMileMarkerPolyline, lineSymbol));

                // watch out for points here in future projects - points have no extent
                app.map.setExtent(postMileMarkerPolyline.getExtent().expand(1.5), false);

                // execute buffered query

            },

            populateCountyDdl: function (evt, ctx) {
                var countyUrl = ctx._config.utilitySelectorUrl;
                var queryTask = new QueryTask(countyUrl);
                var query = new Query();
                query.returnGeometry = false;
                query.outFields = [ctx._config.countyField];
                query.orderByFields = [ctx._config.countyField];
                query.where = "1=1";
                query.returnDistinctValues = true;
                queryTask.execute(query).then( function (results) {
                    if (results.features != undefined && results.features.length > 0) {
                        var items = $.map(results.features, function (countyRec, idx) {
                            return countyRec.attributes.Cnty;
                        });

                        var optionsHtml = '';
                        $.each(items, function (idx, county) {
                            //<option value="">Test</option>
                            optionsHtml = optionsHtml.concat('<option value="' + county + '">' + county + '</option>');
                        });

                        ctx.countyDllEl.html(optionsHtml);
                        ctx.populateRouteDdl(null, ctx);
                    } // If there are any results
                }// Call back function
                ); // execute.then
            },//populateCountyDdl

            populateRouteDdl: function (evt, ctx) {
                var routeUrl = ctx._config.utilitySelectorUrl;
                var queryTask = new QueryTask(routeUrl);
                var query = new Query();
                query.returnGeometry = false;
                query.outFields = [ctx._config.routeField];
                query.orderByFields = [ctx._config.routeField];
                query.where = ctx._config.countyField + "= '" + ctx.countyDllEl.val() + "'";
                query.returnDistinctValues = true;

                // When resolved, returns features and graphics that satisfy the query.
                queryTask.execute(query).then(function (results) {
                    if (results.features != undefined && results.features.length > 0) {
                        var items = $.map(results.features, function (routeRec, idx) {
                            return routeRec.attributes.Route;
                        });

                        var optionsHtml = '';
                        $.each(items, function (idx, route) {
                            //<option value="">Test</option>
                            optionsHtml = optionsHtml.concat('<option value="' + route + '">' + route + '</option>');
                        });

                        ctx.routeDllEl.html(optionsHtml);
                        ctx.populatePostmileDdls(null, ctx);
                    }
                });
            },//populateRouteDdl
            populatePostmileDdls: function (evt, ctx) {
                var beginpostmileUrl = ctx._config.utilitySelectorUrl;
                var queryTask = new QueryTask(beginpostmileUrl);
                var query = new Query();
                query.returnGeometry = true;
                query.outSpatialReference = app.map.spatialReference;
                query.outFields = [ctx._config.postmileField];
                query.orderByFields = [ctx._config.postmileOrderByField];
                query.where = ctx._config.countyField + "= '" + ctx.countyDllEl.val() + "'and " + ctx._config.routeField + "= '" + ctx.routeDllEl.val() + "'";
                query.returnDistinctValues = true;

                var postmileField = ctx._config.postmileField;
                queryTask.execute(query).then(function (results) {
                    if (results.features != undefined && results.features.length > 0) {
                        // persist all postmile geom
                        ctx.postmileMarkers = $.map(results.features, function (postmileRec, idx) {
                            return postmileRec;
                        });

                        var items = $.map(results.features, function (postmileRec, idx) {
                            return postmileRec.attributes[postmileField];
                        });

                        var optionsHtml = '';
                        $.each(items, function (idx, postmile) {
                            //<option value="">Test</option>
                            if (postmile.trim().length > 0) {
                                optionsHtml = optionsHtml.concat('<option value="' + postmile + '">' + postmile + '</option>');
                            }
                        });

                        ctx.beginPostMarkerDdlEl.html(optionsHtml);
                        ctx.endPostMarkerDdlEl.html(optionsHtml);
                    }
                });
            }, // populatePostmileDdls

            onCountyDdlChange: function (evt, ctx) {
                // reset/check route
                console.log('onCountyDdlChange');
                ctx.populateRouteDdl(evt, ctx);
            },//onCountyDllChange

            onRouteDdlChange: function (evt, ctx) {
                // reset/check Post Marker DDL's
                console.log('onRouteDdlChange');
                ctx.populatePostmileDdls(evt, ctx);
            },//onCountyDllChange

        });
    }
);
