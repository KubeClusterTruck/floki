/*-----------------------------------------------------------------------------
A simple Language Understanding (LUIS) bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var cog = require('botbuilder-cognitiveservices');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// ** Original *** Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
// This default message handler is invoked if the user's utterance doesn't
// match any intents handled by other dialogs.
var bot = new builder.UniversalBot(connector, function (session, args) {
    session.send('You reached the default message handler. You said \'%s\'.', session.message.text);
});

bot.set('storage', tableStorage);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

// Create a recognizer that gets intents from LUIS, and add it to the bot
var recognizer = new builder.LuisRecognizer(LuisModelUrl);

// QnA Maker Integration fields
var qnaAppId = process.env.QnaAppId;
var qnaAPIKey = process.env.QnaAPIKey;
var qnaAPIEndpoint = process.env.QnaAPIEndpoint;

const QnaKnbUrl = qnaAPIEndpoint + '/knowledgebases/' + qnaAppId + '/generateAnswer';

// Create QnA Recognizer for use with Luis
//var qnaRecognizer = new cog.QnAMakerRecognizer({
//    knowledgeBaseId: qnaAppId,
//    authKey: qnaAPIKey,
//    endpointHostName: qnaAPIEndpoint
//});  

// Add Luis Recognizer
bot.recognizer(recognizer);

// Add a dialog for each intent that the LUIS app recognizes.
// See https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-recognize-intent-luis 
bot.dialog('GreetingDialog',
    (session) => {
        session.send('You reached the Greeting intent. You said \'%s\'.', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Greeting'
})

bot.dialog('HelpDialog',
    (session) => {
        session.send('You reached the Help intent. You said \'%s\'.', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Help'
})

bot.dialog('CancelDialog',
    (session) => {
        session.send('You reached the Cancel intent. You said \'%s\'.', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Cancel'
})

bot.dialog('K8sHelpDialog',
    (session) => {
        session.send('You reached the K8S Help intent. You said \'%s\'.', session.message.text);
        var query = session.message.text;       
        cog.QnAMakerRecognizer.recognize(query, QnaKnbUrl, 'EndpointKey ' + qnaAPIKey, 'Authorization', 1, 'OnDevice.Help', (error, results) => {
            if (results === undefined) {
                console.log(util.inspect(error.stack, {showHidden: false, depth: null}));
             }
            else {
            session.send(results.answers[0].answer);
            }    
        });   
        session.endDialog();
    }
).triggerAction({
    matches: 'OnDevice.Help'
})

bot.dialog('k8s-connect', require('./k8s-connect.js'))
    .triggerAction({
        matches: [/connect/i, /k8s cluster/i, /reset connection/i]
});