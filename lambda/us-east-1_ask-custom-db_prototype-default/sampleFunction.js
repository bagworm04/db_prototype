module.exports.convDate = function(date, format){
  format = format.replace(/YYYY/, date.getFullYear());
  format = format.replace(/MM/, date.getMonth() + 1);
  format = format.replace(/DD/, date.getDate());

  return format;
}

module.exports.randInt = function(max){
  return Math.floor(Math.random() * (max + 1));
}

module.exports.doc = {
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
}

module.exports.ResponseIntentHandler = {
    canHandle(handlerInput){
	console.log("ResponseIntent");
	const attributes = handlerInput.attributesManager.getSessionAttributes();
	const request = handlerInput.requestEnvelope.request;

	return Alexa.getIntentName(handlerInput.requestEnvelope) === 'ResponseIntent' && request.type === 'IntentRequest';
    },
    handle(handlerInput){

	var speechText = "こんにちは。テストは成功です";
	
	return handlerInput.responseBuilder
	    .speak(speechText)
	    .getResponse();
    },
}
