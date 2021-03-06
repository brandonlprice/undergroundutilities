define(["dojo/on", "dojo/_base/declare", "dojo/dom-construct", "dijit/Dialog", "dojo/dom-style", "dijit/form/Button"],
function (on, declare, domConstruct, Dialog, domStyle, Button) {
return declare(null, {

        okMessage:'',
        cancelMessage:'',
        title:'',
        content:'',
        style:'',
        isDeclined: false,
		
		init: function () {
        },
        
        show: async function () {
            let ctx = this;
            let rtn = new Promise(function(resolve,reject){
                ctx.sp = new Dialog({
                    title: ctx.title,
                    content: ctx.content,
                    style: ctx.style
                });
    
                var okBtn = new Button({
                    label: ctx.okMessage,
                    onClick: function () {
                        ctx.sp.hide();
                        resolve(true);
                    }
                }).placeAt(ctx.sp.containerNode);
    
                if (!ctx.isDeclined){
                    var cancelBtn = new Button({
                        label: ctx.cancelMessage,
                        onClick: function () {
                            ctx.sp.hide();
                            resolve(false);
                        }
                    }).placeAt(ctx.sp.containerNode);
                }
                ctx.sp.show();
				domStyle.set(ctx.sp.closeButtonNode, { display: 'none' });
            });
            return rtn;
        }
     });
});

/*

			var AcceptButton = new Button({
			label: this.okButtonMessage,
			onClick: function () {
                    InstructionsPage.show();
                    DisclaimerPage.hide();
                    this.hideClosebutton = true;
                    domStyle.set(okButton, "width", "100px");
                }
            }).placeAt(DisclaimerPage.containerNode);

			var DeclineButton = new Button({
			label: this.cancelButtonMessage,
			onClick: function () {
                  window.location.replace('http://onramp'); 
                }
            }).placeAt(DisclaimerPage.containerNode);

			var ContinueButton = new Button({
			label: this.instructionsbuttontext,
			onClick: function () {
                  Instructions.hide(); 
                }
            }).placeAt(InstructionsPage.containerNode);



var splashPage1 = new Dialog({
                title: '<b>Disclaimer<b>',
                content: '<p>&nbsp;<p>I acknowledge that the information from these maps are not intended to replace any procedure, policy or law concerning subsurface utilities; for example, contacting DigAlert, or the individual utility providers directly.<p>&nbsp; <p>I acknowledge and understand that information from these maps are from second and third party sources such as utility providers or unconventional sources. This information is not maintained or controlled by Caltrans. <p>&nbsp;<p>I understand that mapping underground utilities is very difficult. Due to this fact, these maps may not be accurate. Caltrans disclaims all liability for the information provided.<p>&nbsp; <p><b><u><span style="color:red;">Accept if you agree to the terms above to acces the map:</span></u><b></p><p>&nbsp;',
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
            domStyle.set(splashPage1.closeButtonNode, { display: 'none' });
*/