var builder = require('botbuilder');
var k8sClient = require('node-kubernetes-client');
const util = require('util');

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
        builder.Prompts.text(session, 'What is your K8S HostName?');
    },
    function (session, results, next) {
        session.dialogData.k8sHost = results.response; 
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
        var k8sHost = session.dialogData.k8sHost;
        var k8sToken = session.dialogData.k8sToken;

        session.send(
            'Ok. Floki is boarding K8S Ship %s at %s using Security Token %s...',
            k8sShip,
            k8sHost,
            k8sToken);

        //AK8S API Call to test connection
        var k8sclient = new k8sClient({
            host:  k8sHost,
            protocol: 'https',
            version: 'v1',
            token: k8sToken
        });

        k8sclient.nodes.get(function (err, nodes) {
            if (nodes === undefined) {
                console.log(util.inspect(err.stack, {showHidden: false, depth: null}));
                session.send(
                    'Oops, there was an error getting Floki on K8S Ship %s!',
                    k8sShip);
            }
            else {
                session.send(
                    'Good news, Floki has successfully boarded K8S Ship %s!',
                    k8sShip);
            }
        });
    }
];