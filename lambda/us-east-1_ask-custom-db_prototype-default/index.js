const Alexa          = require('ask-sdk-core');
const Adapter        = require('ask-sdk-dynamodb-persistence-adapter');
const functions      = require('./functions.js');
const apl 	         = require('./apl.js');
const middleResponse = require('./middleResponse.js').middleResponseJSON;
const getAPIResponse = require('./getAPIResponse.js');

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
      speechText  = '今日からよろしくお願いします!';

      handlerInput.attributesManager.setPersistentAttributes(newJSON);
      await handlerInput.attributesManager.savePersistentAttributes();
      //display非対応
      if(Object.keys(handlerInput.requestEnvelope.context.System.device.supportedInterfaces).length == 0 || Object.keys(handlerInput.requestEnvelope.context.System.device.supportedInterfaces).toString() === "Geolocation" ){
        return handlerInput.responseBuilder.speak(speechText).withShouldEndSession(true).getResponse();
      }else{
        var aplJSON = apl.createView(speechText);

        return handlerInput.responseBuilder.addDirective(aplJSON).speak(speechText).withShouldEndSession(true).getResponse();
      }
    }

    var sessionMemory     = handlerInput.attributesManager.getSessionAttributes();
    sessionMemory.count     = functions.getRandomInt(6) +1 ;
    console.log("from index.js : LaunchIntent : sessionMemory.count : " + sessionMemory.count);
    sessionMemory.intent    = 'AnythingIntent';

    sessionMemory = functions.searchQuestionElement(sessionMemory, persistentMemory);
    handlerInput.attributesManager.setSessionAttributes(sessionMemory);

    var name        = functions.getUserName(persistentMemory);
    var firstPhrase = name + '<break time="0.5s"/>' + functions.getGreeting(middleResponse) + '<break time="0.5s"/>' + functions.getCount(middleResponse, persistentMemory) + '<break time="0.5s"/>';
    speechText = firstPhrase + functions.getLastResponse(persistentMemory, sessionMemory, middleResponse)  + functions.getQuestion(persistentMemory, sessionMemory.genre, sessionMemory.item);

    console.log("from index.js : launchIntent :  speechText :" + speechText + "   , sessionMemory.count :" + sessionMemory.count );

    //display非対応
    if(Object.keys(handlerInput.requestEnvelope.context.System.device.supportedInterfaces).length == 0 || Object.keys(handlerInput.requestEnvelope.context.System.device.supportedInterfaces).toString() === "Geolocation" ){
      return handlerInput.responseBuilder.speak(speechText).reprompt(speechText).getResponse();
    }else{
      var aplJSON = apl.createView(speechText);

      return handlerInput.responseBuilder.addDirective(aplJSON).speak(speechText).reprompt(speechText).getResponse();
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

    console.log("from index.js : AnythingIntent : getPersistentAttributes");

    //ユーザからの返答
    var speechText_first = "初期値です";
    if(reply === 'なし'){
      speechText_first = "わかりました。";
    }else{
      //speechText_first = reply + "ですね。";
      var speechText_first = reply + "ですか。" + getAPIResponse.getAPIResponse(reply) + '<break time = "0.5s"/>';
    }

    if(sessionMemory.count === 0){    //会話の継続を判定
      var speechText = speechText_first + functions.getLastDialogue(middleResponse) + '<break time = "0.5s"/>';
      handlerInput.attributesManager.setSessionAttributes(sessionMemory);

      console.log("from index.js : AnythingIntent :  speechText : lastSession : " + speechText);
      //display非対応
      if(Object.keys(handlerInput.requestEnvelope.context.System.device.supportedInterfaces).length == 0 || Object.keys(handlerInput.requestEnvelope.context.System.device.supportedInterfaces).toString() === "Geolocation" ){
        return handlerInput.responseBuilder.speak(speechText).withShouldEndSession(true).getResponse();
      }else{
        var aplJSON = apl.createView(speechText);

        return handlerInput.responseBuilder.addDirective(aplJSON).speak(speechText).withShouldEndSession(true).getResponse();
      }
    }else{
      sessionMemory.count -= 1;
      sessionMemory.intent    = 'AnythingIntent';

      sessionMemory = functions.searchQuestionElement(sessionMemory, persistentMemory);
      handlerInput.attributesManager.setSessionAttributes(sessionMemory);

      var result      = speechText_first + functions.getMiddleDialogue(middleResponse) + '<break time = "0.5s"/>';
      var speechText  = result + functions.getLastResponse(persistentMemory, sessionMemory, middleResponse) + functions.getQuestion(persistentMemory, sessionMemory.genre, sessionMemory.item);

      console.log("from index.js : AnythingIntent :  speechText :" + speechText);
      //display非対応
      if(Object.keys(handlerInput.requestEnvelope.context.System.device.supportedInterfaces).length == 0  || Object.keys(handlerInput.requestEnvelope.context.System.device.supportedInterfaces).toString() === "Geolocation" ){
        return handlerInput.responseBuilder.speak(speechText).reprompt(speechText).getResponse();
      }else{
        var aplJSON = apl.createView(speechText);

        return handlerInput.responseBuilder.addDirective(aplJSON).speak(speechText).reprompt(speechText).getResponse();
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
