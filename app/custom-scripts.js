require(["dojo/topic", "dijit/Dialog", "dojo/dom-style",
    "dojo/dom", "dijit/form/Button", "dojo/on",
    "dijit/registry", "esri/map", "esri/layers/VectorTileLayer", "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/geometry/webMercatorUtils", "esri/dijit/Popup", "esri/dijit/PopupTemplate", "dojo/dnd/Moveable", "dojo/dom-class",
    "app/utilitySelectorModule", "app/splashScreenModule", "dojo/query", "esri/dijit/LayerList", "esri/arcgis/utils", "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane", 
    "dojo/domReady!"],
    function (topic, Dialog, domStyle,
        dom, Button, on,
        registry, Map, VectorTileLayer, ArcGISTiledMapServiceLayer,
        webMercatorUtils, Popup, PopupTemplate, Moveable, domClass,
        utilitySelectorModule, splashScreenModule, query, LayerList, arcgisUtils, 
    ) {

  /*
   * Custom Javascript to be executed while the application is initializing goes here*/
		
		

		/*var myWidget = new LayerList({
           map: app.map,
           showLegend: true,
           showSubLayers: true,
           layers: arcgisUtils.getLayerList(app)
        },"layerList");
        myWidget.startup();
		});*/
	
		var togglebasemap = dom.byId("togglebasemap");
        on(togglebasemap, "click", function () {
            var baseLyr = app.map.getLayer(app.map.layerIds[0]);
            if (baseLyr.url === "https://www.arcgis.com/sharing/rest/content/items/0e0aa048cb9a42de91ae287fc5632fac/resources/styles/root.json") {
                app.map.removeLayer(baseLyr);
                var tiled = new ArcGISTiledMapServiceLayer("http://public.gis.lacounty.gov/public/rest/services/LACounty_Cache/LACounty_Base/MapServer");
                app.map.addLayer(tiled, 0);
                $('#togglebasemap').css('background-image', 'url(http://caltrans.maps.arcgis.com/sharing/rest/content/items/0e0aa048cb9a42de91ae287fc5632fac/info/thumbnail/thumbnail.png)');
            } else if (baseLyr.url === "http://public.gis.lacounty.gov/public/rest/services/LACounty_Cache/LACounty_Base/MapServer") {
                app.map.removeLayer(baseLyr);
                var vectorTileLayer = new VectorTileLayer("http://www.arcgis.com/sharing/rest/content/items/0e0aa048cb9a42de91ae287fc5632fac/resources/styles/root.json");
                app.map.addLayer(vectorTileLayer, 0);
                $('#togglebasemap').css('background-image', 'url(http://caltrans.maps.arcgis.com/sharing/rest/content/items/10df2279f9684e4a9f6a7f08febac2a9/info/thumbnail/ago_downloaded.jpg)');
            }
        });

        var prevx = 1;
        var thestreet;
        var streetcurs = "normal";
        init();

        $("[data-toggle='tooltip']").tooltip({
            trigger: 'hover',
            container: 'body'
        });

        function init() {
            topic.subscribe('story-load-section', streetview);
            function streetview(evt) {
                // If the section is a webmap, show the streetview button
                whatisit = app.data.getCurrentSection();
                infoIneed = whatisit.media.type;
                if (infoIneed == "webmap") {
                    $("#streetv").fadeIn();
                } else {
                    $("#streetv").hide();
                }
            }
        }

        topic.subscribe("story-perform-action-media", function (media) {
            if (media.type == "webpage") {
                $("#streetv").hide();
            } else {
                $("#streetv").fadeIn();
            }
        });

        $(".mediaBackContainer").click(function () {
            $("#streetv").fadeIn();
        });

        // Street View
        $("#streetv").click(function () {
            if (streetcurs == "street") {
                $(document).unbind('mousemove');
                document.getElementById('image').style.display = "none";
                document.getElementById('image2').style.display = "none";
                streetcurs = "normal";
                $("#streetv").blur();
                thestreet.remove();
            } else {
                // Street view image following cursor
                $(document).mousemove(function (e) {
                    if (prevx > e.pageX) {
                        document.getElementById('image').style.display = "block";
                        document.getElementById('image2').style.display = "none";
                        prevx = e.pageX;
                    } else if (prevx < e.pageX) {
                        document.getElementById('image2').style.display = "block";
                        document.getElementById('image').style.display = "none";
                    }
                    $("#image2").css({ left: e.pageX - 20, top: e.pageY - 40 });
                    $("#image").css({ left: e.pageX - 20, top: e.pageY - 40 });
                    prevx = e.pageX;
                });
                //////////////////////////////////////////////////////
                streetcurs = "street";

                thestreet = app.map.on("click", function (evt) {
                    $("#streetv").blur();
                    xycoor = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
                    document.getElementById('image').style.display = "none";
                    document.getElementById('image2').style.display = "none";
                    Lati = xycoor.y;
                    Longi = xycoor.x;
                    streetviewurl = "http://maps.google.com/?cbll=" + Lati + "," + Longi + "&cbp=12,20.09,,0,5&layer=c";
                    streetcurs = "normal";
                    var win = window.open(streetviewurl, '_blank');
                    win.focus();
                    $(document).off("mousemove");
                    thestreet.remove();
                });
            }
        });
		//(show xy coordinates widget)
        app.coordDragHandler;
        app.coordMoveHandler;
        function showCoordinates(evt) {
            //the map is in web mercator but display coordinates in geographic (lat, long)
            var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
            //display mouse coordinates
            dom.byId("coordInfo").innerHTML = mp.y.toFixed(4) + ", " + mp.x.toFixed(4);
        };

        topic.subscribe("story-loaded-map", function (result) {
            if (app.coordDragHandler) {
                app.coordDragHandler.remove();
                app.coordMoveHandler.remove();
            }
            app.coordDragHandler = app.map.on("mouse-drag", showCoordinates);
            app.coordMoveHandler = app.map.on("mouse-move", showCoordinates);
        });

		/*topic.subscribe("story-loaded-map", function (result) {
			var baseLyr = app.map.getLayer(app.map.layerIds[0]);
			if (baseLyr.url === "https://www.arcgis.com/sharing/rest/content/items/0e0aa048cb9a42de91ae287fc5632fac/resources/styles/root.json") {
				app.map.setBasemap(baseLyr);
			}
			else if (baseLyr.url === "http://public.gis.lacounty.gov/public/rest/services/LACounty_Cache/LACounty_Base/MapServer") {
					app.map.setBasemap(baseLyr);
			}
		)};*/
		
		/*topic.subscribe("story-loaded-map", function (result) {
			do not wipe graphics layer on switch
		)};*/
		 app.utilitySelector = new utilitySelectorModule();
            app.utilitySelector.init();
            var utilitySelectorToolBtn = dom.byId("PMSelect");
            on(utilitySelectorToolBtn, "click", function (event) {
                if (app.utilitySelector.isVisible === true) {
                    app.utilitySelector.hide();
                } else { // not open
                    app.utilitySelector.show();
                }
            });		//splash pages
        let sp = new splashScreenModule();
            sp.okMessage = 'I Accept';
            sp.cancelMessage = 'I Decline';
            sp.isDeclined = false;
            sp.title= '<b>Disclaimer<b>';
            sp.content= '<p>&nbsp;<p>I acknowledge that the information from these maps are not intended to replace any procedure, policy or law concerning subsurface utilities; for example, contacting DigAlert, or the individual utility providers directly.<p>&nbsp; <p>I acknowledge and understand that information from these maps are from second and third party sources such as utility providers or unconventional sources. This information is not maintained or controlled by Caltrans. <p>&nbsp;<p>I understand that mapping underground utilities is very difficult. Due to this fact, these maps may not be accurate. Caltrans disclaims all liability for the information provided.<p>&nbsp; <p><b><u><span style="color:red;">Accept if you agree to the terms above to acces the map:</span></u><b></p><p>&nbsp;';
            sp.style='width: 500px; height: 410px;border: 3px #b6dbff solid; padding-bottom: 10px;';
            sp.show().then(function(wasOkBtnClicked){
                if (wasOkBtnClicked){
                    sp.okMessage = 'Continue';
                    sp.isDeclined = true;
                    sp.title= '<b>Map Tips<b>';
                    sp.content= '<p><b>1.</b> Each tab contains a unique map.  When you switch tabs, the <span style="color:red;">geographic location</span> from the last map carries to the next<p>&nbsp;<p><b>2.</b> Zoom to <span style="color:red;">street level</span> to view all layers on each map (zoom in/out using the <span style="color: red">+/-</span> buttons or <span style="color: red">double-click</span> to just zoom in)<p>&nbsp;<p><b>3.</b> Click on a <span style="color:red;">map feature</span> to view more info; e.g. outlet<p>&nbsp;<p><b>4.</b> Use the <span style="color:red;">magnifier</span> to search by address or place</p><p>&nbsp;<p><b>5.</b> <span style="color:red;">Hover</span> over each tab for more info</p><p>&nbsp;<p><b>6.</b> Click the google man button, then click anywhere on the map to access <span style="color:red;">google streetview</span> in a new tab (zoom in as far in as possible for accuracy)</p><p>&nbsp;</p><p><b>7.</b> Coordinates based on <span style="color:red;">mouse hover</span> are at the bottom of each tab (decimal degrees) </p><p>&nbsp;</p><p><b>8.</b> Use the PM button to <span style="color:red;">select a range</span> of postmiles on the map (click the button again to <span style="color:red">clear</span> the selection)</p><p>&nbsp;</p><p><b>9.</b> Use the thumbnail at the bottom right to <span style="color:red;">toggle basemaps</span><p>&nbsp;</p><p><b>10.</b> Click the download button to download gis source data	(Sanitation/Stormwater<span style="color:red;"> only </span>. Check the source links for more)</span></p><p>&nbsp;</p>';
                    sp.style='width: 450px; height: 573px; border: 3px #b6dbff solid;font-size: 13px';
                    sp.show().then(function(wasOkBtnClicked){
                    });        
                }else{
                    window.location.replace('https://lacounty.gov');
                }
            });
            
            //tooltip creation for tabs and removes buttons off on last tab (since it is not a map(resource page)) and turns them back on when another tab is clicked 
			//.footerMobile .embed-btn-right .embed-btn
            let tabs = $('.entries > .nav > .entry > .entryLbl ');
            tabs.each(function (idx, liItem) {
                switch (liItem.text) {
                    case 'Electric':
                        //liItem.on('click', function () {
                        //    console.log('got a click on electric');
                        //});
                        liItem.setAttribute('title', 'To download a City of Los Angeles Substructure Plan: \n 1. Zoom to a substructure quad\n 2. Click the area inside the quad \n 3. Click "More info"');
                        $(liItem).click(function () {
                            $('#streetv').show();
                            $('#xy').show();
                            $('#togglebasemapouter').show();
                            $('#PMSelectOuter').show();
                            $('#sanitationdownload').hide();
                            $('#electric').hide();
                            $('#stormwaterdownload').hide();
							$('#SelectorTable').hide();
                        });
                        break;
                    case 'Gas/Oil':
                        liItem.setAttribute('title', 'This tab contains non-hazardous\n gas/oil utilities. Visit our confidential \n gas/oil application at:\n http://sv07gis6/undergroundconfidential');
                        $(liItem).click(function () {
                            $('#streetv').show();
                            $('#xy').show();
                            $('#togglebasemapouter').show();
                            $('#PMSelectOuter').show();
                            $('#sanitationdownload').hide();
                            $('#stormwaterdownload').hide();
                            $('#electric').hide();
							$('#SelectorTable').hide();
                        });
                        break;
                    case 'Sanitation':
                        liItem.setAttribute('title', 'To download a City of Los Angeles Sewer Plan: \n 1. Click a storm pipe (green) \n 2. Scroll down and click the plan number \n To download a County of Los Angeles Operation Map: \n 1. Click a blank space inside an operation map boundary to get the popup\n 2. Reference the map id from the popup at:\n http://dpw.lacounty.gov/SMD/SMDMapBookPDF/MapLinxAll.cfm');
                        $(liItem).click(function () {
                            $('#streetv').show();
                            $('#xy').show();
                            $('#togglebasemapouter').show();
                            $('#PMSelectOuter').show();
                            $('#sanitationdownload').show();
                            $('#stormwaterdownload').hide();
                            $('#electric').hide();
							$('#SelectorTable').hide();
                        });
                        break;
                    case 'Stormwater':
                        liItem.setAttribute('title', 'Currently, this is the only map tab that includes Caltrans Assets\n Photos are available when you click on a asset\n To download a City of Los Angeles Storm Drainage Plan: \n 1. Click on a drainage feature in LA City proper\n 2. Click on the plan number in the popup');
                        $(liItem).click(function () {
                            $('#streetv').show();
                            $('#xy').show();
                            $('#togglebasemapouter').show();
                            $('#PMSelectOuter').show();
                            $('#sanitationdownload').hide();
                            $('#electric').hide();
                            $('#stormwaterdownload').show();
							$('#SelectorTable').hide();
                        });
                        break;
                    case 'Download':
                        liItem.setAttribute('title', 'Use this tab to download snippets of all utility types within\n up to a 500-foot range in .shp or .dgn formats');
                        $(liItem).click(function () {
                            $('#streetv').show();
                            $('#xy').show();
                            $('#togglebasemapouter').show();
                            $('#PMSelectOuter').show()
                            $('#sanitationdownload').show();
                            $('#electric').hide();
                            $('#stormwaterdownload').show();
							$('#SelectorTable').hide();
                        });
                        break;
                    case 'Resources':
                        liItem.setAttribute('title', 'Please contact D7GIS to help with our resources list');
                        $(liItem).click(function () {
                            $('#streetv').hide();
                            $('#xy').hide();
                            $('#togglebasemapouter').hide();
                            $('#PMSelectOuter').hide();
                            $('#electric').hide();
                            $('#sanitationdownload').hide();
                            $('#stormwaterdownload').hide();
							$('#SelectorTable').hide();
                        });
                        break;
                }
            });
           
        var popup = app.map.infoWindow;
				on(popup, "maximize", function(){
				popup.resize(500,500);
			});
			
			//makes esri popup moveable
			var handle = query(".title", ".contentPane", app.map.infoWindow.domNode)[0];
				var dnd = new Moveable(app.map.infoWindow.domNode, {
				handle: handle
			});
			
			on(dnd, 'FirstMove', function() {
			// hide pointer and outerpointer (used depending on where the pointer is shown)
				var arrowNode =  query(".outerPointer", app.map.infoWindow.domNode)[0];
				domClass.add(arrowNode, "hidden");
            
			//removes arrow pointer when moved
				var arrowNode =  query(".pointer", app.map.infoWindow.domNode)[0];
				domClass.add(arrowNode, "hidden");
			}.bind(this));
         
            // The application is ready
        topic.subscribe("tpl-ready", function () {

            /*
            var downloadBtn1 = dom.byId("Download");
            on(downloadBtn1, "click", function (event) {
            app.map.infoWindow.setTitle("Download");
            app.map.infoWindow.setContent(
                <iframe width="600" height="490" src="https://egis3.lacounty.gov/dataportal/2013/11/07/los-angeles-county-sanitary-sewers)" style="margin-left: -268px; margin-top: -326px;"></iframe>
            );
            app.map.infoWindow.show();
            }
            });
            */

			//utility selector open/close onclick
           
			
			//resizes the deafult esri popup max
			
			
			//var moveableSelector = dom.byId("SelectorTable");
           // on(moveableSelector, "click", function () {
             //   var dnd = new Moveable(moveableSelector);
           // });
			
			
            
			
			
			/*var splashPage1 = new Dialog({
                title: '<b>Disclaimer<b>',
                content: '<p>&nbsp;<p>I acknowledge that the information from these maps are not intended to replace any procedure, policy or law concerning subsurface utilities; for example, contacting DigAlert, or the individual utility providers directly.<p>&nbsp; <p>I acknowledge and understand that information from these maps are from second and third party sources such as utility providers or unconventional sources. This information is not maintained or controlled by Caltrans. <p>&nbsp;<p>I understand that mapping underground utilities is very difficult. Due to this fact, these maps may not be accurate. Caltrans disclaims all liability for the information provided.<p>&nbsp; <p><b><u><span style="color:red;">Accept if you agree to the terms above to access the map:</span></u><b></p><p>&nbsp;',
                style: 'width: 500px; height: 410px;border: 3px #b6dbff solid; padding-bottom: 10px;'

            });

            var splashPage2 = new Dialog({
                title: '<b>Map Tips<b>',
                content: '<p><b>1.</b> Each tab contains a unique map.  When you switch tabs, the <span style="color:red;">geographic location</span> from the last map carries to the next<p>&nbsp;<p><b>2.</b> Zoom to <span style="color:red;">street level</span> to view all layers on each map (zoom in/out using the <span style="color: red">+/-</span> buttons or <span style="color: red">double-click</span> to just zoom in)<p>&nbsp;<p><b>3.</b> Click on a <span style="color:red;">map feature</span> to view more info; e.g. outlet<p>&nbsp;<p><b>4.</b> Use the <span style="color:red;">magnifier</span> to search by address or place</p><p>&nbsp;<p><b>5.</b> <span style="color:red;">Hover</span> over each tab for more info</p><p>&nbsp;<p><b>6.</b> Click the streetview (google man) button, then click anywhere on the map to get the <span style="color:red;">google streetview</span> in a new tab</p><p>&nbsp;</p><p><b>7.</b> Coordinates based on <span style="color:red;">mouse hover</span> are at the bottom of each tab (decimal degrees) </p><p>&nbsp;</p><p><b>8.</b> Use the PM button to <span style="color:red;">select a range</span> of postmiles on the map (click the button again to <span style="color:red">clear</span> the selection)</p><p>&nbsp;</p><p><b>9.</b> Use the thumbnail at the bottom right to <span style="color:red;">toggle basemaps</span><p>&nbsp;</p><p><b>10.</b> Click the download button to download gis source data	(Sanitation/Stormwater<span style="color:red;"> only </span>. Check the source links for more)</span></p><p>&nbsp;</p>',
                style: 'width: 450px; height: 613px; border: 3px #b6dbff solid;'


            });


            var myButton1 = new Button({
                label: "I Accept",
                onClick: function () {
                    splashPage2.show();
                    splashPage1.hide();
                    domStyle.set(splashPage2.closeButtonNode, { display: 'none' });
                    domStyle.set(myButton1, "width", "100px");
                }
            }).placeAt(splashPage1.containerNode);


            var myButton2 = new Button({
                label: "I Decline",
                onClick: function () {
                    window.location.replace('http://onramp');
                }
            }).placeAt(splashPage1.containerNode);

            var myButton3 = new Button({
                label: "Continue",
                onClick: function () {
                    splashPage2.hide();
                }
            }).placeAt(splashPage2.containerNode);


            splashPage1.show();
            domStyle.set(splashPage1.closeButtonNode, { display: 'none' });*/

			

			
			//.embed-btn-container > .embed-btn-right > .disabled
				//$('#streetv').hide();
			//});
			
			/*$('.entries > .nav > .entry > .entryLbl').first().click(function() {
					$("#position3").hide();
			 });.embed-btn .footerMobile
			$('.entries > .nav > .entry > .entryLbl').first().click(function() {
					if ($("#mydiv").hasClass("visible")) {$("#Download").hide();
			 });?*/

        });

        

    } // function 
); // require
