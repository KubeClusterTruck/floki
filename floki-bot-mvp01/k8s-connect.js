var builder = require('botbuilder');

module.exports = [
    // Destination
    function (session) {
        session.send('Floki wants to board your K8S Container Ship!');
        builder.Prompts.text(session, 'Please enter the Name of your Ship so you easily refer to it');
    },
    function (session, results, next) {
        session.dialogData.k8sShip = results.response;
        session.send('Connecting to K8S Ship %s', results.response);
        next();
    },

    // Enpoint URL
    function (session) {
        builder.Prompts.text(session, 'What is your K8S API Endpoint URL?');
    },
    function (session, results, next) {
        session.dialogData.k8sURL = results.response;
        next();
    },

    // Security Token
    function (session) {
        builder.Prompts.text(session, 'What is a valid Security Token Floki can use?');
    },
    function (session, results, next) {
        session.dialogData.k8sToken = results.response;
        next();
    },

    // Validate K8S Connection...
    function (session) {
        var k8sShip = session.dialogData.k8sShip;
        var k8sURL = session.dialogData.k8sURL;
        var k8sToken = session.dialogData.k8sToken;

        session.send(
            'Ok. Floki is boarding K8S Ship %s at %s using Security Token %s...',
            k8sShip,
            k8sURL,
            k8sToken);

        // Async K8S API Call to test connection
        //K8SConnect
        //    .searchHotels(destination, checkIn, checkOut)
        //    .then(function (hotels) {
                // Results
        //        session.send('I found in total %d hotels for your dates:', hotels.length);

        //        var message = new builder.Message()
        //            .attachmentLayout(builder.AttachmentLayout.carousel)
        //            .attachments(hotels.map(hotelAsAttachment));

        //        session.send(message);

                // End
        //        session.endDialog();
        //    });
    }
];

// Helpers
function hotelAsAttachment(hotel) {
    return new builder.HeroCard()
        .title(hotel.name)
        .subtitle('%d stars. %d reviews. From $%d per night.', hotel.rating, hotel.numberOfReviews, hotel.priceStarting)
        .images([new builder.CardImage().url(hotel.image)])
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value('https://www.bing.com/search?q=hotels+in+' + encodeURIComponent(hotel.location))
        ]);
}

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};