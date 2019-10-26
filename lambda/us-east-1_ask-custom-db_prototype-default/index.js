const Alexa     = require('ask-sdk-core');
const Adapter   = require('ask-sdk-dynamodb-persistence-adapter');
const functions = require('./launchProto_functions.js');
const apl 	= require('./launchProto_apl.js');
const basicResponse  = require('./launchProto_basicIntentResponse.js');

const config          ={tableName:'db_prototype',createTable:true};
const DynamoDBAdapter = new Adapter.DynamoDbPersistenceAdapter(config);

const LaunchRequestHandler = {
    canHandle(handlerInput){
	return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput){
	var speechText          = "こんにちは";
	
	const persistentMemory      = await handlerInput.attributesManager.getPersistentAttributes(); //DBからデータの取得
	console.log("from index.js : persistentMemory : " + persistentMemory);
	console.log("from index.js : persistentMemory_string : " + JSON.stringify(persistentMemory));
	console.log("from index.js : persistentMemory_length : " + persistentMemory.length);
	console.log("from index.js : persistentMemory_length : " + Object.keys(persistentMemory).length);
	

	if(Object.keys(persistentMemory).length === 0){
	    console.log("from index.js : persistentMemory === undefined ");
	    var newJSON    = require('./newData.js').initialJSON;
	    handlerInput.attributesManager.setPersistentAttributes(newJSON);
	    await handlerInput.attributesManager.savePersistentAttributes();
	    
	    return handlerInput.responseBuilder
	    //.addDirective(aplJSON)
		.speak(speechText)
	    //.reprompt(speechText)
		.withShouldEndSession(true)
	    	.getResponse();
	    
	}
	var emptyNum              = functions.hasEmptyContentInMyself(persistentMemory); //myself内で未回答の項目番号を取得。なければ-1
	const sessionMemory       = handlerInput.attributesManager.getSessionAttributes();
	var speechText_first    = "こんにちは。";
	
	if(emptyNum >= 0){
	    sessionMemory.intent  = functions.setIntent('AnythingIntent');
	    sessionMemory.genre   = functions.setGenre('myself');
	    sessionMemory.item    = emptyNum;
	    speechText            = speechText_first + functions.getQuestion(persistentMemory, sessionMemory.genre, emptyNum);
	}else{
	    sessionMemory.intent  = functions.setIntent('AnythingIntent');
	    sessionMemory.genre   = functions.setGenre(persistentMemory);
	    sessionMemory.item    = functions.getItemNum(persistentMemory, sessionMemory.genre);

	    var tmpResponse       = persistentMemory[sessionMemory.genre][sessionMemory.item]['response'];
	    if(tmpResponse.length != 0 && tmpResponse[tmpResponse.length -1]['reply'] !== 'なし' ){ //前回記録があるとき && "なし"じゃないとき
		speechText_first  = functions.getLastRecord(persistentMemory, sessionMemory); 
	    }
	    
	    speechText            =  speechText_first + functions.getQuestion(persistentMemory, sessionMemory.genre, sessionMemory.item);
	    console.log(speechText);
	}
	
	handlerInput.attributesManager.setSessionAttributes(sessionMemory);
	var aplJSON = apl.createView(speechText);
	
	//console.log(aplJSON);	
	console.log("from index.js : handlerInput : " + JSON.stringify(handlerInput));
	return handlerInput.responseBuilder
	//.addDirective(aplJSON)
	    .speak(speechText)
	    .reprompt(speechText)
	    .getResponse();
    }
};




const AnythingIntentHandler = {
    canHandle(handlerInput){
	const sessionMemory = handlerInput.attributesManager.getSessionAttributes();
	return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' && sessionMemory.intent === 'AnythingIntent';
    },
    async handle(handlerInput){
	console.log("anythingIntent");
	var persistentMemory      = await handlerInput.attributesManager.getPersistentAttributes(); //DBからデータの取得
	var sessionMemory         = handlerInput.attributesManager.getSessionAttributes();

	
	var reply   = functions.getResponse(persistentMemory, handlerInput.requestEnvelope.request.intent.slots, sessionMemory);

	var speechText_first = "";
	if(reply === 'なし'){
	    speechText_first = "わかりました。";
	}else{
	    speechText_first = reply + "ですね。";
	}
	
	var speechText = speechText_first + "教えていただきありがとうございます。";
	
	var newJSON    = functions.createNewDB(persistentMemory, sessionMemory, reply);
	handlerInput.attributesManager.setPersistentAttributes(newJSON);
	await handlerInput.attributesManager.savePersistentAttributes();
	
	
	var aplJSON = apl.createView(speechText);
	
	return handlerInput.responseBuilder
	    //.addDirective(aplJSON)
	    .speak(speechText)
	    //.reprompt(speechText)
	    .withShouldEndSession(true)
	    .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput){
	return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
	    && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
		|| Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput){
	const speechText = 'Goodbye!';
	return handlerInput.responseBuilder
	    .speak(speechText)
	    .getResponse();
    }
};


const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
	return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
	// Any cleanup logic goes here.
	return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
	return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
	const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
	const speechText = `You just triggered ${intentName}`;
	
	return handlerInput.responseBuilder
	    .speak(speechText)
	//.reprompt('add a reprompt if you want to keep the session open for the user to respond')
	    .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
	return true;
    },
    handle(handlerInput, error) {
	console.log(`~~~~ Error handled: ${error.stack}`);
	const speechText = "Sorry, I had trouble doing what you asked. Please try again.";
	
	return handlerInput.responseBuilder
	    .speak(speechText)
	    .reprompt(speechText)
	    .getResponse();
    }
};


exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
	LaunchRequestHandler,
	//	BasicIntentHandler,
	AnythingIntentHandler,
	CancelAndStopIntentHandler,
	SessionEndedRequestHandler,
	IntentReflectorHandler,
    )
    .withPersistenceAdapter(DynamoDBAdapter)
    .addErrorHandlers(
	ErrorHandler,
    )
    .lambda();
/*
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
*/
