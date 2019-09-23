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
    const speakOutput = 'データベーススキルです。データベースで記録してといってください。';
    return handlerInput.responseBuilder
    .speak(speakOutput)
    //.reprompt(speakOutput)
    .getResponse();
  }
};
const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'Hello World!';
    return handlerInput.responseBuilder
    .speak(speakOutput)
    //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
    .getResponse();
  }
};

const RecordIntentHandler = {
  canHandle(handlerInput) {
    console.log('レコードインテントです');
    return Alexa.getIntentName(handlerInput.requestEnvelope) === 'RecordIntent';
  },
  async handle(handlerInput) {
    console.log('RecordIntent.handler 入りました');

    //DynamoDBから取得
    let persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
    let cnt = (persistentAttributes.cnt | 0) + 1;


    var obj = {
      Day: "Monday",
      Items:[
        "Coffee",
        "Orange",
        "Milk"
      ]
    }
    //DynamoDBへ保存
    //handlerInput.attributesManager.setPersistentAttributes(obj);
    handlerInput.attributesManager.setPersistentAttributes({obj,cnt:cnt});
    await handlerInput.attributesManager.savePersistentAttributes();

    return handlerInput.responseBuilder
    .speak(`記録しました。このスキルは${cnt}回起動しました`)
    //.reprompt('こんにちは、と言ってください')
    .getResponse();
  }
};


//会話内容をいったん聞くテスト
const AnyIntent = {
  canHandle(handlerInput){
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
    && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnyIntent';
  },
  handle(handlerInput){
    const speakText = handlerInput.requestEnvelope.request.intent.slots.utterance.value;
    const speakOutput = 'って聞こえたよ';
    return handlerInput.responseBuilder
    .speak(speakText+speakOutput)
    //.reprompt(speakText+speakOutput)
    .getResponse();
  }
};

const ResponseIntentHandler = {
  canHandle(handlerInput){
    console.log("ResponseIntent");

    return Alexa.getIntentName(handlerInput.requestEnvelope) === 'ResponseIntent';
  },
  handle(handlerInput){
    //let value = handlerInput.requestEnvelope.request.intent.slots.item.value;
    let value = "本";
    const speechText = value + 'を何冊買いますか';

    console.log("ok1");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    console.log("ok2");

    attributes.state = 'InputIntentHandler';
    console.log("ok3");

    handlerInput.attributesManager.setSessionAttributes(attributes);
    console.log("ok4");

    return handlerInput.responseBuilder
    .speak(speechText)
    .reprompt(speechText)
    .getResponse();
  },
};




const InputIntentHandler = {
  canHandle(handlerInput){
    console.log("InputIntentHandler");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return attributes.state === 'InputIntentHandler' && request.type === 'IntentRequest';
  },

  handle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    let value = request.intent.slots.number.value;
    const speechText = value+'冊ですね。注文しました。ところで、生まれは西暦何年ですか';

    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.state = 'BirthYearIntentHandler';
    handlerInput.attributesManager.setSessionAttributes(attributes);

    return handlerInput.responseBuilder
    .speak(speechText)
    .reprompt(speechText)
    .getResponse();
  },
};

const BirthYearIntentHandler = {
  canHandle(handlerInput){
    console.log("BirthYearIntentHandler");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return attributes.state === 'BirthYearIntentHandler' && request.type === 'IntentRequest';
  },

  handle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    let value = request.intent.slots.year.value;
    const speechText = value+'年ですね。何月何日ですか';

    return handlerInput.responseBuilder
    .speak(speechText)
    .reprompt(speechText)
    .getResponse();
  },
};



const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
    && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'You can say hello to me! How can I help?';

    return handlerInput.responseBuilder
    .speak(speakOutput)
    .reprompt(speakOutput)
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
    const speakOutput = 'Goodbye!';
    return handlerInput.responseBuilder
    .speak(speakOutput)
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
    const speakOutput = `You just triggered ${intentName}`;

    return handlerInput.responseBuilder
    .speak(speakOutput)
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
    const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

    return handlerInput.responseBuilder
    .speak(speakOutput)
    .reprompt(speakOutput)
    .getResponse();
  }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
.addRequestHandlers(
  LaunchRequestHandler,
  //RecordIntentHandler,
  //AnyIntent,
  //HelloWorldIntentHandler,
  InputIntentHandler,
  ResponseIntentHandler,
  HelpIntentHandler,
  BirthYearIntentHandler,
  CancelAndStopIntentHandler,
  SessionEndedRequestHandler,
  IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
)

.withPersistenceAdapter(DynamoDBAdapter)
.addErrorHandlers(
  ErrorHandler,
)

.lambda();
