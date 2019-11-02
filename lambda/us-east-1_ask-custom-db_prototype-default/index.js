const Alexa     = require('ask-sdk-core');
const Adapter   = require('ask-sdk-dynamodb-persistence-adapter');
const functions = require('./functions.js');
const apl 	= require('./apl.js');

const config          ={tableName:'db_prototype',createTable:true};
const DynamoDBAdapter = new Adapter.DynamoDbPersistenceAdapter(config);

const LaunchRequestHandler = {
  canHandle(handlerInput){
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  async handle(handlerInput){
    const persistentMemory  = await handlerInput.attributesManager.getPersistentAttributes(); //DBからデータの取得
    var   speechText        = "こんにちは"

    //初回かどうかの判定
    if(Object.keys(persistentMemory).length === 0){
      var newJSON = require('./newData.js').initialJSON;
      speechText  = "きょうからよろしくお願いします!"

      handlerInput.attributesManager.setPersistentAttributes(newJSON);
      await handlerInput.attributesManager.savePersistentAttributes();
      //display非対応
      if(Object.keys(handlerInput.requestEnvelope.context.System.device.supportedInterfaces).length == 0){
        return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(true)
        .getResponse();
      }else{
        var aplJSON = apl.createView(speechText);

        return handlerInput.responseBuilder
        .addDirective(aplJSON)
        .speak(speechText)
        .withShouldEndSession(true)
        .getResponse();
      }
    }

    var sessionMemory     = handlerInput.attributesManager.getSessionAttributes();
    sessionMemory.count     = 3 ;
    sessionMemory.intent    = 'AnythingIntent';

    sessionMemory = functions.searchQuestionElement(sessionMemory, persistentMemory);
    handlerInput.attributesManager.setSessionAttributes(sessionMemory);

    speechText = functions.getQuestion(persistentMemory, sessionMemory.genre, sessionMemory.item);

    console.log("from index.js : speechText = " + speechText);

    //display非対応
    if(Object.keys(handlerInput.requestEnvelope.context.System.device.supportedInterfaces).length == 0){
      return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
    }else{
      var aplJSON = apl.createView(speechText);

      return handlerInput.responseBuilder
      .addDirective(aplJSON)
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
    }
  }
};




const AnythingIntentHandler = {
  canHandle(handlerInput){
    const sessionMemory = handlerInput.attributesManager.getSessionAttributes();
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' && sessionMemory.intent === 'AnythingIntent';
  },
  async handle(handlerInput){
    var persistentMemory      = await handlerInput.attributesManager.getPersistentAttributes(); //DBからデータの取得
    var sessionMemory         = handlerInput.attributesManager.getSessionAttributes();

    var reply   = functions.getResponse(persistentMemory, handlerInput.requestEnvelope.request.intent.slots, sessionMemory);

    var newJSON    = functions.createNewDB(persistentMemory, sessionMemory, reply);
    handlerInput.attributesManager.setPersistentAttributes(newJSON);
    await handlerInput.attributesManager.savePersistentAttributes();


    var speechText_first = "";
    if(reply === 'なし'){
      speechText_first = "わかりました。";
    }else{
      speechText_first = reply + "ですね。";
    }

    //会話の継続を判定
    if(sessionMemory.count === 0){
      var speechText = speechText_first + "教えていただきありがとうございました。";
      handlerInput.attributesManager.setSessionAttributes(sessionMemory);
      //display非対応
      if(Object.keys(handlerInput.requestEnvelope.context.System.device.supportedInterfaces).length == 0){
        return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(true)
        .getResponse();
      }else{
        var aplJSON = apl.createView(speechText);

        return handlerInput.responseBuilder
        .addDirective(aplJSON)
        .speak(speechText)
        .withShouldEndSession(true)
        .getResponse();
      }
    }else{
      sessionMemory.count -= 1;
      sessionMemory.intent    = 'AnythingIntent';

      sessionMemory = functions.searchQuestionElement(sessionMemory, persistentMemory);
      handlerInput.attributesManager.setSessionAttributes(sessionMemory);

      var result      = speechText_first + "教えていただきありがとうございます。";
      var speechText  = result + functions.getQuestion(persistentMemory, sessionMemory.genre, sessionMemory.item);

      //display非対応
      if(Object.keys(handlerInput.requestEnvelope.context.System.device.supportedInterfaces).length == 0){
        return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
      }else{
        var aplJSON = apl.createView(speechText);

        return handlerInput.responseBuilder
        .addDirective(aplJSON)
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
      }
    }

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
