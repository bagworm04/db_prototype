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
  async handle(handlerInput) {


      let persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
      let cnt = persistentAttributes.cnt;
      
      var obj = {
	  Day: "Monday",
	  Items:[
              "Coffee",
              "Orange",
              "Milk"
	  ]
      }
      var shuffle_module =require('./make_json.js').shuffle_photos(cnt);
      cnt += 1;

      handlerInput.attributesManager.setPersistentAttributes({obj,cnt:cnt});
      await handlerInput.attributesManager.savePersistentAttributes();
      
      
      var data = require('./make_json.js').get_json();
      console.log(data);
      
      const speechText = 'データベーススキルです。こんにちは大竹さん。データベースで記録してといってください。';


      

      
      /*  
	  var aplDocument = require('./sampleFunction.js').doc;
	  const data =
	  {
          myData: {
          title: speechText
          }
	  }
	  
      */
      return handlerInput.responseBuilder
	  .addDirective({
	      type : 'Alexa.Presentation.APL.RenderDocument',
	      version: '1.0',
	      document: require('./document/apl_doc_top.json'),
	      datasources: data 
	  })
	  .speak(speechText)
      //.reprompt(speechText)
	  .getResponse();
  }
};

const TouchEventHandler = {
    canHandle(handlerInput){
	return ((handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent' && (handlerInput.requestEnvelope.request.source.handler === 'Press' || handlerInput.requestEnvelope.request.source.handler === 'onPress')));
    },
    handle(handlerInput){
	console.log('touchevent')
	const choice = handlerInput.requestEnvelope.request.arguments[0];
	console.log(choice);
	const speechText = choice + 'をタップしました'
	/*
	var aplDocument = require('./sampleFunction.js').doc;
	const data =
	      {
		  myData: {
		      title: speechText
		  }
	      }
	*/
	
	return handlerInput.responseBuilder
	  /*  .addDirective({
		type : 'Alexa.Presentation.APL.RenderDocument',
		version: '1.0',
		document: aplDocument,
		datasources: data
	    })*/
	    .speak(speechText)
	    .getResponse();
    }
};


const ResponseIntentHandler = {
  canHandle(handlerInput){
    console.log("ResponseIntent");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return Alexa.getIntentName(handlerInput.requestEnvelope) === 'ResponseIntent' && request.type === 'IntentRequest';
  },
  handle(handlerInput){
    //let value = handlerInput.requestEnvelope.request.intent.slots.item.value;

    var func = require('./sampleFunction.js');
    var aplDocument = require('./sampleFunction.js').doc;

    var num = func.randInt(2);
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

    }else{
      console.log("int:else");

      var speechText = '兄弟はいますか'

      const attributes = handlerInput.attributesManager.getSessionAttributes();
      attributes.state = 'SibilingIntentHandler';
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


const BirthYearIntentHandler = {
  canHandle(handlerInput){
    console.log("BirthYearIntentHandler");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return attributes.state === 'BirthYearIntentHandler' && request.type === 'IntentRequest';
  },

  handle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    let birth_year = request.intent.slots.year.value;
    console.log(birth_year);
    const speechText = birth_year + '年ですね。何月何日ですか';


    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.year = birth_year;
    attributes.state = 'DateIntentHandler';
    handlerInput.attributesManager.setSessionAttributes(attributes);

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
    .reprompt(speechText)
    .getResponse();
  },
};


const DateIntentHandler = {
  canHandle(handlerInput){
    console.log("DateIntentHandler");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return attributes.state === 'DateIntentHandler' && request.type === 'IntentRequest';
  },

  handle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    let value = request.intent.slots.date.value;
    console.log(value);

    const attributes = handlerInput.attributesManager.getSessionAttributes();

    var func = require('./sampleFunction.js');
    console.log(func);

    let month_day = func.convDate(new Date(value),'MM月DD日')

    const speechText = attributes.year +'年' +  month_day + 'ですか。教えていただきありがとうございます';

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

const PlaceIntentHandler = {
  canHandle(handlerInput){
    console.log("PlaceIntentHandler");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return attributes.state === 'PlaceIntentHandler' && request.type === 'IntentRequest';
  },

  handle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    let place = request.intent.slots.place.value;

    const speechText = place + 'ですか。教えていただきありがとうございます。';

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
    .getResponse();
  },
};

const SibilingIntentHandler = {
  canHandle(handlerInput){
    console.log("SibilingIntentHandler");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return attributes.state === 'SibilingIntentHandler' && request.type === 'IntentRequest';
  },
  handle(handlerInput){
    const request = handlerInput.requestEnvelope.request;
    let sibiling = request.intent.slots.sibiling.value;

    const speechText = sibiling + 'ですか。教えていただきありがとうございます。';

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
    .getResponse();
  },


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
    const speechText = 'Sorry, I had trouble doing what you asked. Please try again.'

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
    TouchEventHandler,
    DateIntentHandler,
    ResponseIntentHandler,
    BirthYearIntentHandler,
    PlaceIntentHandler,
    SibilingIntentHandler,
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
