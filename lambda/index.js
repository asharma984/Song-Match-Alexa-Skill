// the database for song recommendation is stored in songmatch.json file.
const Alexa = require('ask-sdk-core');
const data = require('./songmatch.json');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to song match. I can help you understand which song by your favorite artist best matches your life.'+ 
        ' Please tell me the name of your favorite artist.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// Intent to handle the song recommendation. 
// This is invoked after the user has given all the required inputs.
const RecommendSongIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RecommendSongIntent';
    },
    handle(handlerInput) {
        const {requestEnvelope} = handlerInput;
        const {intent} = requestEnvelope.request;
        
        const artist=Alexa.getSlotValue(requestEnvelope,'artist').toLowerCase().replace(/\s+/g, '');
        const colour=Alexa.getSlotValue(requestEnvelope,'colour').toLowerCase().replace(/\s+/g, '');
        const flavour=Alexa.getSlotValue(requestEnvelope,'flavour').toLowerCase().replace(/\s+/g, '');
        const weather=Alexa.getSlotValue(requestEnvelope,'weather').toLowerCase().replace(/\s+/g, '');
        let recommendedSong=recommendSongHelper(artist,flavour,colour,weather);
        
        const speakOutput = `Based on your answers, your  Song Match is ${recommendedSong}. Would you like to get another Song Match with a different artist?`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

// This is a helper method for RecommendSongIntent.
// This map all the keys to a unique value from the database file
// i.e. songmatch.json and returns it.
const recommendSongHelper=(artist,flavour,colour,weather)=>{
     let key="";
     let recommendedSong="";
     const databaseResponse={};
      if (artist !== null && flavour !== null && colour !== null && weather !== null) {
         key = `${artist}-${colour}-${flavour}-${weather}`;
        const databaseResponse = data[key];
        recommendedSong = databaseResponse.song;
        }
        
    return recommendedSong;    
     
}

//This is used when user needs any kind of help.
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

// This is used for starting the song match again in the same session.
const YesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'YesIntent';
    },
    handle(handlerInput) {
   return YesIntentHelper(handlerInput);
   }
};

// a helper funtion for YesIntent which returns the required output.
const YesIntentHelper= (handlerInput)=>{
     return handlerInput.responseBuilder
    .addDelegateDirective({
        name: 'RecommendSongIntent',
        confirmationStatus: 'NONE',
        slots: {}
    }).speak('Okay. We will start again')
    .getResponse();
}

// This is used to close the current session.
const NoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'NoIntent';
    },
    handle(handlerInput) {
  const speakOutput = 'Thank you for using Song Match. For another great skill, check out Song Quiz!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
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
        RecommendSongIntentHandler,
        YesIntentHandler,
        NoIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
