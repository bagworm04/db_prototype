module.exports.createView = function(text){
    var aplJSON = {
	type : 'Alexa.Presentation.APL.RenderDocument',
	version: '1.0',
	document: {
	    "type": "APL",
	    "version": "1.0",
	    "mainTemplate": {
		"parameters": [
		    "payload"
		],
		"item": {
		    "type": "Text",
		    "text": "${payload.myData.title}",
		    "width": "100vw",
		    "height": "100vh",
		    "textAlign": "center",
		    "textAlignVertical": "center"
		}
	    }
	},
	datasources:{
	    "myData": {
		"title": text
	    }
	}
    };
    return aplJSON;
};
