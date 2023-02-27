////algorythm: SSE-UL.HASH-SHA1 SSE-DEV //13096001147179267

const api = require('./api');
const twidgets = require('./tnlwidgets');
const tws = require('./tnlwebsocket');
const tcons = require('./tnlconsole');
const sharedfuncs = require('./sharedfunctions');
const express = require('express');
const security = require('./security');
const events = require('./events');



/*
console.log(security.validateUserToken('testuser','ad71b5487a70152a146dfeffd3b9f9881473955f'));
*/
console.log(security.validateToken('6be1f61e3ae8f289f03a006c98dc87b32edae740'));









console.log('Starting HTTP server...');
var httpserver = express();
httpserver.use('/public', express.static(__dirname + '/public'));
httpserver.get('/web', function (req, res) {
    res.sendFile('index.html', { root: __dirname + "/public" });
});
httpserver.listen(8088);
console.log('Done.');




httpserver.get('/api/v1/:token/widgets/:widgetId/get', function (req, res) {
    if (security.validateToken(req.params.token)) {
        let wdg = mods.widgets.get(req.params.widgetId);
        if (wdg && req.params.widgetId) {
            res.send({ id: wdg.id, value: wdg.value });
        }
        else {
            res.send({ error: `unknown widgetid '${req.params.widgetId}'` });
        }
    }
    else {
        res.send({ error: 'invalid token' });
    }
});
httpserver.get('/api/v1/:token/widgets/:widgetId/set/:value', function (req, res) {
    if (security.validateToken(req.params.token)) {
        let wdg = mods.widgets.get(req.params.widgetId);
        if (wdg && req.params.widgetId && req.params.value) {
            mods.widgets.set(req.params.widgetId, req.params.value);
            let wdg = mods.widgets.get(req.params.widgetId);
            res.send({ id: wdg.id, value: wdg.value });
        }
        else {
            res.send({ error: `Unknown widgetId '${req.params.widgetId}' or wrong value '${req.params.value}'` });
        }
    }
    else {
        res.send({ error: 'invalid token' });
    }
});


httpserver.get('/api/v1/widgets', function (req, res) {
    console.log('The other one');
});


function testRegister(args) {
    console.log(args);
    return 'Vous avez dit ' + args;
}

function getLampHours() {
    return Math.floor(Math.random() * 5000);
}

var _widgetUpdateListeners = [];
var _serverUpdateServerWidgetListeners = []


var mods = {}

mods.widgets = new twidgets.TunelWidgets();
mods.websocket = new tws.TunelWebsocket(8080, mods);
mods.console = new tcons.TunelConsole(mods);






/*
mods.widgets.addWidgetUpdateListener(w => { mods.websocket.notifyWidgetChanged(w) });

mods.websocket.addUpdateServerWidgetListener((widget) => { 
    mods.widgets.updateWidget(widget);
} );
*/





const toWebSocket = (e) => { mods.websocket.broadcastWidgetChangedInternal(e) };
var projpower = new twidgets.Toggle('projpower', false);
var tvpower = new twidgets.Toggle('tvpower', false);
var volume = new twidgets.Range('volume', 80, 0, 100);

var mouseX = new twidgets.Value('mousex', 0);
var mouseY = new twidgets.Value('mousey', 0);

var systemname = new twidgets.Value('systemname', 'PVE-DEV');



/*
volume.onChange((value) => {
    
});
*/

mods.widgets.loadWidgets([projpower, tvpower, volume, systemname, mouseX, mouseY]);





//tnl.registerFunction('test', testRegister);
//tnl.registerFunction('getLampHours', getLampHours);

/*
tnl.callFunction('test', 'MOU!!!!!!!', (rtn) => {
    console.log('RETURN ' + rtn);
});
*/


/* populate API */
api.main = this;
api.events = events;
api.websocket = mods.websocket;
api.console = mods.console;
api.widgetsManager = mods.widgets;
api.sharedfunctions = sharedfuncs;


function ppo(val) {
    if (val == 'toggle') {
        projpower.toggle();
    }
    else {
        projpower.value = val;
    }
}
sharedfuncs.addSharedFunction('projpower', ppo);

//console.log(sharedfuncs.callFunction('logtest','mon texte ici'));

api.console.init();
api.websocket.init();

/*
events.event().on(value => {

    console.log(value);
});
*/

/* Load other modules */
const weather = require('./weather');



/* load room script */
const room = require('./room.js');
const { Server } = require('ws');
const { raw } = require('express');
mods.room = new room.Room();
api.room = room.room;



//events.event('test').broadcast('moo');


auth = {
    username: 'USERNAME',
    password: 'PASSWORD'
}





const jsxapi = require('jsxapi');
jsxapi.connect(`ssh://192.168.86.72`, auth)
    .on('error', console.error)
    .on('ready', async (xapi) => {
        console.log('Codec connecté!');
        bindWidgetMute(xapi);
        autoMapWidget(xapi);
    });


function bindWidgetMute(xapi) {
    var codecmute = new twidgets.Toggle('codecmute'); //Création d'un widget serveur
    mods.widgets.loadWidgets([codecmute]);  //Load le widget
    //Inscription au changement d'état du widget
    codecmute.onChange(widget => {
        if (widget.value) {
            xapi.Command.Audio.Microphones.Mute();
        }
        else {
            xapi.Command.Audio.Microphones.Unmute();
        }
    });

    //Ramasse la valeur du mute actuel et l'assigne au widget
    xapi.Status.Audio.Microphones.Mute.get().then(value => {
        codecmute.value = value;
    });

    //Inscription au changement de valeur du mute sur le codec
    xapi.Status.Audio.Microphones.Mute.on(value => {
        codecmute.value = value;
    });       
}

async function autoMapWidget(xapi) {
    var widgetList = await xapi.Status.UserInterface.Extensions.Widget.get();
    widgetList.forEach(widget => {
        let tempWidget = new twidgets.Value(widget.WidgetId,widget.Value);
        mods.widgets.loadWidgets([tempWidget]);
    });
    
    xapi.Event.UserInterface.Extensions.Widget.Action.on(action => {
        mods.widgets.set(action.WidgetId,action.Value);
    });
}