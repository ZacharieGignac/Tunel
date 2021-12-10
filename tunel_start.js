////algorythm: SSE-UL.HASH-SHA1 SSE-DEV //13096001147179267


const tws = require('./tnlwebsocket');
const tcons = require('./tnlconsole');
const twidgets = require('./tnlwidgets');



function testRegister(args) {
    console.log(args);
    return 'Vous avez dit ' + args;
}

function getLampHours() {
    return Math.floor(Math.random() * 5000);
}



var modules = {}

modules.websocket = new tws.TunelWebsocket(8080, modules);
modules.console = new tcons.TunelConsole(modules);
modules.widgets = new twidgets.TunelWidgets(modules);



const toWebSocket = (e) => { modules.websocket.broadcastWidgetChangedInternal(e) };
var projpower = new twidgets.Toggle('projpower','off',toWebSocket);
var tvpower = new twidgets.Toggle('tvpower','on',toWebSocket);
var volume = new twidgets.Range('volume',80,0,100,toWebSocket);


modules.widgets.loadWidgets([projpower,tvpower,volume]);



//tnl.registerFunction('test', testRegister);
//tnl.registerFunction('getLampHours', getLampHours);

/*
tnl.callFunction('test', 'MOU!!!!!!!', (rtn) => {
    console.log('RETURN ' + rtn);
});
*/

