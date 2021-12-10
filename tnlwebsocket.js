const webss = require('ws');
const crypto = require('crypto');

const ERROR_AUTH_INVALIDTOKEN = JSON.stringify({
    type: 'auth.error.invalidtoken',
    message: 'Authentication error: invalid token'
});
const ERROR_AUTH_NEEDAUTH = JSON.stringify({
    type: 'auth.error.needauth',
    message: 'Authentication needed'
});
const AUTH_TRUE = JSON.stringify({
    type: 'authstatus',
    status: true
});
const AUTH_FALSE = JSON.stringify({
    type: 'authstatus',
    status: false
});

class TunelWebsocket {
    constructor(port,mods) {
        this.mods = mods;
        console.log('Websocket Starting...');
        this.wss = new webss.WebSocketServer({ port: port });
        console.log(`Websocket listening on port ${port}`);
        this.startIntervalCheck(this);
        this.funcs = [];
        this.wss.on('close', this.onClose);
        this.wss.on('connection', (ws) => { this.onConnection(this, this.wss, ws) });

    }
    test() {
        console.log('TEST!');
    }
    registerFunction(functionName, func) {
        this.funcs.push({ functionName: functionName, func: func });
    }
    callFunction(ws, functionName, functionArgs, returnPath) {
        if (ws.auth) {
            this.funcs.forEach(f => {
                if (f.functionName == functionName) {
                    const rtn = f.func(functionArgs);
                    if (returnPath != undefined) {
                        returnPath(rtn);
                    }
                }
            });
        }
        else {
            const authError = {
                type: 'auth.error.needauth',
                message: 'Authentication needed'
            }
            ws.send(JSON.stringify(authError));
        }
    }
    heartbeat(ws) {
        ws.isAlive = true;
    }
    onClose() {
        clearInterval(interval);
    }
    startIntervalCheck(tnl) {
        setInterval(function ping() {
            tnl.wss.clients.forEach(function each(ws) {
                if (ws.isAlive === false) {
                    console.log(`[QUIT] Client ${ws.clientId} (${ws._socket.remoteAddress}) (PING_TIMEOUT)`);
                    return ws.terminate();
                }

                ws.isAlive = false;
                let ticks = new Date().getTime();
                let ping = {
                    type: 'ping',
                    ticks: ticks
                }
                //console.log(`---> Ping ${ws._socket.remoteAddress}`);
                ws.send(JSON.stringify(ping));

            });
        }, 5000);
    }

    auth(ws, dataObject) {
        var hash = crypto.createHash('sha1');
        const data = hash.update(`SSE-UL.HASH-SHA1 ${dataObject.id} 13096001147179267`, 'utf-8');
        const trueHash = data.digest('hex');
        console.log(`Auth request from ${dataObject.id} with token ${dataObject.token}`);
        if (dataObject.token == trueHash) {
            console.log(dataObject.id + ' authentication success!')
            ws.clientId = dataObject.id;
            ws.auth = true;
            ws.send(AUTH_TRUE);
            console.log(ws.clientId + ' is now connected!');
        }
        else {
            console.log(dataObject.id + ' authentication FAILED. Wrong token!');
            ws.send(authError);
            ws.send(AUTH_FALSE);
        }
    }
    pong(ws, dataObject) {
        let d = new Date().getTime();
        //console.log(`<--- Pong ${ws._socket.remoteAddress} : Roundtrip ${(d - dataObject.ticks)}ms`);
        this.heartbeat(ws);
    }

    initClient(ws, dataObject) {
        console.log('<--- Init Request');
        if (ws.auth) {
            var initData = {
                type: 'init',
                systemName: 'SSE-DEV',
                version: '1.0',
                widgets: this.mods.widgets.getWidgetsForWeb()
            }
            console.log('---> Init reply');
            var initDataString = JSON.stringify(initData);
            ws.send(initDataString);
        }
        else {
            ws.send(ERROR_AUTH_NEEDAUTH);
        }
    }

    broadcastMessage(ws, dataObject) {
        if (ws.auth) {
            console.log('broadcastmessage request');
            var message = {
                type: 'message',
                message: dataObject.message
            }

            wss.clients.forEach(client => {
                client.send(JSON.stringify(message));
            });
        }
        else {
            const authError = {
                type: 'auth.error.needauth',
                message: 'Authentication needed'
            }
            ws.send(JSON.stringify(authError));
        }
    }

    broadcastWidgetChanged(ws, widgetstatus) {
        if (ws.auth) {
            console.log(`---> Widget Changed id:${widgetstatus.id} value:${widgetstatus.value}`);
            var message = {
                type: 'widgetchanged',
                id: widgetstatus.id,
                value: widgetstatus.value
            }

            this.wss.clients.forEach(client => {
                client.send(JSON.stringify(message));
            });
        }
        else {
            const authError = {
                type: 'auth.error.needauth',
                message: 'Authentication needed'
            }
            ws.send(JSON.stringify(authError));
        }
    }
    broadcastWidgetChangedInternal(widgetstatus,context) {
        console.log(`---> Widget Changed id:${widgetstatus.id} value:${widgetstatus.value}`);
        var message = {
            type: 'widgetchanged',
            id: widgetstatus.id,
            value: widgetstatus.value
        }
        this.wss.clients.forEach(client => {
            client.send(JSON.stringify(message));
        });
    }
    sendFunctionCallReturnValue(ws, id, value) {
        ws.send(JSON.stringify({
            type: 'functionrtnval',
            id: id,
            returnvalue: value
        }));
    }
    updateServerWidget(widget) {
        this.mods.widgets.updateWidget(widget);
    }
    onConnection(tnl, wss, ws) {
        ws.isAlive = true;
        ws.auth = false;

        console.log(`Client connected. Count: ${wss.clients.size}`);

        ws.on('close', (data) => {
            console.log(`[QUIT] ${ws.clientId} disconnected gracefully`);
        });

        ws.on('message', function message(data) {

            //console.log('received: %s', data);
            try {
                var dataObject = JSON.parse(data);

                switch (dataObject.type) {
                    case 'pong':
                        tnl.pong(ws, dataObject);
                        break;

                    case 'auth':
                        tnl.auth(ws, dataObject);
                        break;

                    case 'init':
                        tnl.initClient(ws, dataObject);
                        break;

                    case 'setwidgetvalue':
                        console.log(`<--- Set Widget Value id:${dataObject.id} value:${dataObject.value}`);
                        tnl.broadcastWidgetChanged(ws, dataObject);
                        tnl.updateServerWidget(dataObject);
                        break;

                    case 'broadcastmessage':
                        tnl.broadcastMessage(ws, dataObject);
                        break;

                    case 'functioncallwrtn':
                        tnl.callFunction(ws, dataObject.functionName, dataObject.functionArgs, rtn => {
                            tnl.sendFunctionCallReturnValue(ws, dataObject.id, rtn);
                        });
                        break;
                    case 'functioncall':
                        tnl.callFunction(ws, dataObject.functionName, dataObject.functionArgs);
                }
            }
            catch (receiveerror) {
                console.log(`[ERROR] (ws.on 'message') CLIENT:${ws.clientId} E:${receiveerror}`);
            }

        });
    }

}

module.exports.TunelWebsocket = TunelWebsocket;
