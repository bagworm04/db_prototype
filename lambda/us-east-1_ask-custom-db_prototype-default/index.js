// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');

const Adapter = require('ask-sdk-dynamodb-persistence-adapter');


const config = {tableName: 'db_prototype', // <= DynamoDBのテーブル名
createTable: true}; // <= テーブルを自動生成する場合true (ただし権限が必要)
const DynamoDBAdapter = new Adapter.DynamoDbPersistenceAdapter(config);


const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'データベーススキルです。こんにちは大竹さん。データベースで記録してといってください。';

    var aplDocument = require('./sampleFunction.js').doc;
    const data =
    {
        myData: {
            title: speechText
        }
    }

    return handlerInput.responseBuilder
    .addDirective({
          type : 'Alexa.Presentation.APL.RenderDocument',
          version: '1.0',
          document: aplDocument,
          datasources: data
      })
    .speak(speechText)
    //.reprompt(speechText)
    .getResponse();
  }
};
const FirstIntentHandler = {
  canHandle(handlerInput){
    console.log("FirstIntent");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return Alexa.getIntentName(handlerInput.requestEnvelope) === 'FirstIntent' && request.type === 'IntentRequest';
  },
  handle(handlerInput){
      //let value = handlerInput.requestEnvelope.request.intent.slots.item.value;

      //var func = require('./sampleFunction.js');
      var aplDocument = require('./sampleFunction.js').doc;
      
      //var num = func.randInt(3);
      var num = 3;

      if(num == 0){
      console.log("int:0");
      var speechText = '生まれは西暦何年ですか';

      const attributes = handlerInput.attributesManager.getSessionAttributes();
      attributes.state = 'BirthYearIntentHandler';
      handlerInput.attributesManager.setSessionAttributes(attributes);

    }else if(num == 1){
      console.log("int:1");
      var speechText = '生まれはどこですか';

      const attributes = handlerInput.attributesManager.getSessionAttributes();
      attributes.state = 'PlaceIntentHandler';
      handlerInput.attributesManager.setSessionAttributes(attributes);

    }else if(num == 2){
      console.log("int:2");

	var speechText = '兄弟はいますか';

	const attributes = handlerInput.attributesManager.getSessionAttributes();
	attributes.state = 'SibilingIntentHandler';
	handlerInput.attributesManager.setSessionAttributes(attributes);

    }else{
	console.log("int:3");

	var speechText = '好きな食べ物は何ですか';
	const attributes = handlerInput.attributesManager.getSessionAttributes();
	attributes.state = 'ResponseIntentHandler';
	handlerInput.attributesManager.setSessionAttributes(attributes);
    }

    const data =
    {
        myData: {
            title: speechText
        }
    }
    return handlerInput.responseBuilder
    .addDirective({
          type : 'Alexa.Presentation.APL.RenderDocument',
          version: '1.0',
          document: aplDocument,
          datasources: data
      })
    .speak(speechText)
    .reprompt(speechText)
    .getResponse();
  },
};


const ResponseIntentHandler = {
  canHandle(handlerInput){
    console.log("ResponseIntentHandler");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return attributes.state === 'ResponseIntentHandler' && request.type === 'IntentRequest';
  },

  handle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    let response = request.intent.slots.utterance.value;
    console.log(response);
      
    const speechText = response + 'ですか。教えていただきありがとうございます';

    var aplDocument = require('./sampleFunction.js').doc;
    const data =
    {
        myData: {
            title: speechText
        }
    }

    return handlerInput.responseBuilder
    .addDirective({
          type : 'Alexa.Presentation.APL.RenderDocument',
          version: '1.0',
          document: aplDocument,
          datasources: data
      })
    .speak(speechText)
    //.reprompt(speechText)
    .withShouldEndSession(true)
    .getResponse()
  },
};


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
    && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me! How can I help?';

    return handlerInput.responseBuilder
    .speak(speechText)
    .reprompt(speechText)
    .getResponse();
  }
};
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
    && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
    || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
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
    const speechText = `Sorry, I had trouble doing what you asked. Please try again.`;

    return handlerInput.responseBuilder
    .speak(speechText)
    .reprompt(speechText)
    .getResponse();
  }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
.addRequestHandlers(
    LaunchRequestHandler,
    FirstIntentHandler,
    ResponseIntentHandler,
    CancelAndStopIntentHandler,
    HelpIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
)

.withPersistenceAdapter(DynamoDBAdapter)
.addErrorHandlers(
  ErrorHandler,
)

.lambda();
