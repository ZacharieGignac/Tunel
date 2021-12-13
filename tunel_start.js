////algorythm: SSE-UL.HASH-SHA1 SSE-DEV //13096001147179267

const api = require('./api');
const twidgets = require('./tnlwidgets');
const tws = require('./tnlwebsocket');
const tcons = require('./tnlconsole');
const sharedfuncs = require('./sharedfunctions');






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
var projpower = new twidgets.Toggle('projpower',false,toWebSocket);
var tvpower = new twidgets.Toggle('tvpower',false,toWebSocket);
var volume = new twidgets.Range('volume',80,0,100,toWebSocket);

var systemname = new twidgets.Value('systemname','PVE-DEV');

/*
volume.onChange((value) => {
    
});
*/

mods.widgets.loadWidgets([projpower,tvpower,volume,systemname]);





//tnl.registerFunction('test', testRegister);
//tnl.registerFunction('getLampHours', getLampHours);

/*
tnl.callFunction('test', 'MOU!!!!!!!', (rtn) => {
    console.log('RETURN ' + rtn);
});
*/


/* populate API */
api.main = this;
api.websocket = mods.websocket;
api.console = mods.console;
api.widgets = mods.widgets;
api.sharedfunctions = sharedfuncs;

function ppo() {
    projpower.value = 'on';
}
sharedfuncs.addSharedFunction('projPowerOn',ppo);

//console.log(sharedfuncs.callFunction('logtest','mon texte ici'));

api.console.init();
api.websocket.init();

/* load room script */
const room = require('./room.js');
mods.room = new room.Room();
api.room = room.room;