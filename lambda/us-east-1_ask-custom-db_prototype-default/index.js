

const Alexa = require('ask-sdk-core');

const Adapter = require('ask-sdk-dynamodb-persistence-adapter');

const functions = require('./functions.js');



const config = {tableName: 'db_prototype',
		createTable:true};
const DynamoDBAdapter = new Adapter.DynamoDbPersistenceAdapter(config);




const LaunchRequestHandler = {
    canHandle(handlerInput){
	return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput){
	var persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
	
	


	
    }
};



const AnythingIntentHandler = {






};

const HelpIntentHandler = {
    canHandle(handlerInput){
	return Alexa.getRequestType(handlerInput.requestEnvelople) === 'IntentRequest'
	    && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput){
	const speechText = 'Helpインテントです';

	return handlerInput.responseBuilder
	    .speak(speechText)
	    .reprompt(speechText)
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
	const speechText = 'Goodbye';
	return handlerInput.responseBuilder
	    .speak(speechText)
	    .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput){
	return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput){
	return handlerInput.responseBuilder.getResponse();
    }
};    


const ErrorHandler = {
    canHandle(){
	return true;
    }
    handle(handlerInput, error){
	console.log('--Error : ${error.stack}');
	const speechText = 'Sorry, I had trouble doing what you asked. Please try again.';

	return handlerInput.responseBuilder
	    .speak(speechText)
	    .reprompt(speechText)
	    .getResponse();
    }
};



exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
	LaunchRequestHandler,
	AnythingIntentHandler,
	HelpIntentHandler,
	CancelAndStopIntentHandler,
	SessionEndedRequestHandler,
    )

    .withPersistenceAdapter(DynamoDBAdapter)
    .addErrorHandlers(
	ErrorHandler,
    )

    .lambda();



