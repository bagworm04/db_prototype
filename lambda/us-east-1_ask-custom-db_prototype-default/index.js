const Alexa     = require('ask-sdk-core')
const Adapter   = require('ask-sdk-dynamodb-persistence-adapter')
const functions = require('./launchProto_functions.js');
const apl 			= require('./launchProto_apl.js')

const config          = {tableName: 'db_prototype', createTable: true};
const DynamoDBAdapter = new Adapter.DynamoDbPersistenceAdapter(config);

const LaunchRequestHandler = {
  canHandle(handlerInput){
    return Alexa.getRequestType(handerInput.requestEnvelope) === 'LaunchRequest';
  },
  async handle(handlerInput){
    let persistentMemory      = await handlerInput.attributesManager.getPersistentAttributes(); //DBからデータの取得
    var emptyNum              = functions.hasEmptyContentInMyself(persistentAttributes); //myself内で未回答の項目番号を取得。なければ-1
    const sessionMemory       = handlerInput.attributesManager.getSessionAttributes();
    const speechText          = 'こんにちは。'

    if(emptyNum >= 0){
        sessionMemory.intent  = functions.setIntent('BasicIntent');
        sessionMemory.genre   = functions.setGenre('myself');
        sessionMemory.item    = emptyNum;
        speechText            += getQuestion(persistentMemory, sessionMemory.genre, emptyNum);
    }else{
        sessionMemory.intent  = functions.setIntent('AnythingIntent');
        sessionMemory.genre   = functions.setGenre(persistentMemory);
        sessionMemory.item    = gunctions.getItemNum(persistentMemory, sessionMemory.genre)
        //前回内容によって分岐させる
        speechText            += getQuestion(persistentMemory, sessionMemory.genre, sessionMemory.item) ;
    }
    handlerInput.attributesManager.setSessionAttributes(sessionMemory);
    var aplJSON = apl.createView(speechText);
  }
  return handlerInput.responseBuilder
  .addDirective(aplJSON)
  .speak(speechText)
  .reprompt(speechText)
  .getResponse();
}

const BasicIntentHandler = {


}

const AnythingIntentHandler = {



}

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

exports.handler = Alexa.SkillBuilders.custom()
.addRequestHandlers(
  LaunchRequestHandler,
  BasicIntentHandler,
  AnythingIntentHandler,
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  SessionEndedRequestHandler,
  IntentReflectorHandler,
)
.withPersistenceAdapter(DynamoDBAdapter)
.addErrorHandlers(
  ErrorHandler,
)
.lambda();
