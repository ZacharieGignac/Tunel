////algorythm: SSE-UL.HASH-SHA1 SSE-DEV //13096001147179267


const tws = require('./tnlwebsocket');
const tcons = require('./tnlconsole');







function testRegister(args) {
    console.log(args);
    return 'Vous avez dit ' + args;
}

function getLampHours() {
    return Math.floor(Math.random() * 5000);
}



console.log(tws.TunelWebsocket);


const tnlwebsock = new tws.TunelWebsocket(8080);
const tnlconsole = new tcons.TunelConsole(tnlwebsock);

//tnl.registerFunction('test', testRegister);
//tnl.registerFunction('getLampHours', getLampHours);

/*
tnl.callFunction('test', 'MOU!!!!!!!', (rtn) => {
    console.log('RETURN ' + rtn);
});
*/

