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
	var attributes_json = persistentAttributes;

	
	const attributes = handlerInput.attributesManager.getSessionAttributes();
	

	
	const func = require('./sampleFunction.js');


	//1はlifestyle
	//2はfamily
	//3はassets
	
	var rand_family_life_assets_select = func.randInt(4);
	
	var item = func.hasNullInMyself(persistentAttributes);
	
	console.log("from index_js rand_family_life_assets_select : "+ rand_family_life_assets_select);


	
	if(item >=0 ){
	    attributes_json = persistentAttributes['myself'];

	    var selected_num = item;
	    
	}else if(rand_family_life_assets_select == 0){
	    
	    attributes_json = persistentAttributes['family'];
	    
	    var selected_num = require('./sampleFunction.js').randInt(attributes_json.length-1);
	    console.log("from index_js selected_num:" + selected_num);
	    
	}else{

	    attributes_json = persistentAttributes['lifestyle'];
   
	    var selected_num = require('./sampleFunction.js').randInt(attributes_json.length-1);
	    console.log("from index_js selected_num:" + selected_num);

	}
	    	

	let count = (persistentAttributes.count | 0);
			
	
	console.log("from index_js : " + attributes_json[selected_num]['firstPhrase'] + ' は '+ attributes_json[selected_num]['secondPhrase'] + "  ですか");
	
	
	var state_num = attributes_json[selected_num]['state'];
	
	const speechText = 'データベーススキルです。こんにちは大竹さん。'+ attributes_json[selected_num]['firstPhrase'] +'は' + attributes_json[selected_num]['secondPhrase'] +'ですか';
	
	count += 1;

	attributes.selected_num = selected_num;

	attributes.count = count;
	
	
	if(state_num == 0){
	    console.log("int:0");
	    
	    attributes.state = 'BirthYearIntentHandler';
	    handlerInput.attributesManager.setSessionAttributes(attributes);
	    
	}else if(state_num == 1){
	    console.log("int:1");

	    attributes.state = 'PlaceIntentHandler';
	    handlerInput.attributesManager.setSessionAttributes(attributes);
	    
	}else if(state_num == 2){
	    console.log("int:2");

	    attributes.state = 'SibilingIntentHandler';
	    handlerInput.attributesManager.setSessionAttributes(attributes);

	}else{

	    attributes.state = 'AnythingIntentHandler';
	    handlerInput.attributesManager.setSessionAttributes(attributes);
	}
      	

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
    }
};


const AnythingIntentHandler = {
    canHandle(handlerInput){
	console.log("from index :  AnythingIntent");
	const attributes = handlerInput.attributesManager.getSessionAttributes();
	const request = handlerInput.requestEnvelope.request;
	
	return attributes.state === 'AnythingIntentHandler' && request.type === 'IntentRequest';
    },
    async  handle(handlerInput){
	//let value = handlerInput.requestEnvelope.request.intent.slots.item.value;
	
	var func = require('./sampleFunction.js');
	var aplDocument = require('./sampleFunction.js').doc;
	
        
	const request = handlerInput.requestEnvelope.request;
	let reply = request.intent.slots.utterance.value;
	console.log("from index : " + reply);
	
	const speechText = reply + 'ですか。教えていただきありがとうございます。';
	
	
	let persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
			
	let attributes = handlerInput.attributesManager.getSessionAttributes();

	var dateTime = new Date()
	
	let reply_json = {
	    "reply":reply,
	    "time": JSON.stringify(dateTime)
	}

	console.log(reply_json);
	console.log(JSON.stringify(reply_json));
	
	//handlerInput.attributesManager.setPersistenAttributes({lifestyle[attributes.rand_num]['response'][0]:reply_json});

	
	persistentAttributes['lifestyle'][attributes.selected_num]['response'].push(reply_json);

	const new_json = persistentAttributes;

	console.log("from index_js attribute.count : "+ attributes.count);
	persistentAttributes['count'] = attributes.count;
	
	console.log("from index_json : " + new_json);
	handlerInput.attributesManager.setPersistentAttributes(new_json);
	
	await handlerInput.attributesManager.savePersistentAttributes();
	
	
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

const BirthYearIntentHandler = {
    canHandle(handlerInput){
	console.log("BirthYearIntentHandler");
	const attributes = handlerInput.attributesManager.getSessionAttributes();
	const request = handlerInput.requestEnvelope.request;
	
	return attributes.state === 'BirthYearIntentHandler' && request.type === 'IntentRequest';
    },
    
    async handle(handlerInput){
	const request = handlerInput.requestEnvelope.request;
	let birth_year = request.intent.slots.year.value;
	console.log(birth_year);
	
	let persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
	const attributes = handlerInput.attributesManager.getSessionAttributes();

	
	var dateTime = new Date()
	
	let reply_json = {
	    "reply":birth_year,
	    "time": JSON.stringify(dateTime)
	}
	
      	console.log(reply_json);
	console.log(JSON.stringify(reply_json));

	
	persistentAttributes['myself'][attributes.selected_num]['response'].push(reply_json);

	persistentAttributes['count'] = attributes.count;
	
	console.log("from index_json : " + persistentAttributes);
	handlerInput.attributesManager.setPersistentAttributes(persistentAttributes);
	
	await handlerInput.attributesManager.savePersistentAttributes();
	
	const speechText = birth_year + '年ですね。何月何日ですか';
	
	
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
    
    async handle(handlerInput){
	const request = handlerInput.requestEnvelope.request;
	let place = request.intent.slots.place.value;
	
	let persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
	
	
	var dateTime = new Date()
	
	let reply_json = {
	    "reply":place,
	    "time": JSON.stringify(dateTime)
	}
	
	console.log(reply_json);
	console.log(JSON.stringify(reply_json));
	
	const attributes = handlerInput.attributesManager.getSessionAttributes();
	
	persistentAttributes['myself'][attributes.selected_num]['response'].push(reply_json);

	persistentAttributes['count'] = attributes.count;

	
	console.log("from index_json : " + persistentAttributes);
	handlerInput.attributesManager.setPersistentAttributes(persistentAttributes);
	
	await handlerInput.attributesManager.savePersistentAttributes();
	
	
	
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
    canHandle(handlerInput) {
	const attributes = handlerInput.attributesManager.getSessionAttributes();
	
	return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
	    && attributes.state === 'SibilingIntentHandler';
    },
    async handle(handlerInput){
	const request = handlerInput.requestEnvelope.request;
	let sibiling = request.intent.slots.sibiling.value;
	
	let persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
	
	
	var dateTime = new Date()
	
	let reply_json = {
	    "reply":sibiling,
	    "time": JSON.stringify(dateTime)
	}
	
	console.log(reply_json);
	console.log(JSON.stringify(reply_json));
	
	const attributes = handlerInput.attributesManager.getSessionAttributes();
	
	persistentAttributes['family'][attributes.selected_num]['response'].push(reply_json);

	persistentAttributes['count'] = attributes.count;

	
	console.log("from index_json : " + persistentAttributes);
	handlerInput.attributesManager.setPersistentAttributes(persistentAttributes);
	
	await handlerInput.attributesManager.savePersistentAttributes();
	
	
	
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
    AnythingIntentHandler,
    
    
    DateIntentHandler,
    BirthYearIntentHandler,
    PlaceIntentHandler,
    SibilingIntentHandler,

    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
)

.withPersistenceAdapter(DynamoDBAdapter)
.addErrorHandlers(
  ErrorHandler,
)

.lambda();
