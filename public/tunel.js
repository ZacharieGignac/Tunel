const config = {
    tunelVersion: '1.0', //Must connect to a server with same major version, exemple: 1.0, 1.3, 1.8 
    auth: {
        id: 'SSE-DEV',  //ID of client
        token: '4ed4282fe2eb1da63c26d28dba5986c8980559d0' //sha1 encoded with secret
    },
    server: {
        address: '192.168.86.108',
        port: '8080',
        reloadPageOnSocketError: true
    },

}


tunelConnectionStatus = { status: 'disconnected', reason: 'not started' };


console.log('wsconnect.js loaded');

var pingTimeout;
var _widgets = [];
var onWidgetChangeListeners = [];
var onConnectionStatusChangedListeners = [];
var onEventListeners = [];
var functionCalls = [];
var tunelInitCompleted = ()=>{};

var tunelSocket = new WebSocket(`ws://${config.server.address}:${config.server.port}`);

function makeid(length=50) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

const $tunelWidgets = function (id) {
    return {
        setValue: (value) => {
            sendWidgetValue(id, value);
        },
        getValue: () => {
            for (var i = 0; i < _widgets.length; i++) {
                if (_widgets[i].id == id) {
                    return _widgets[i].value;
                }
            }
            return undefined;
        },     
        addTwoWayBinding: (elementId, elementProperty, elementEvent) => {
            var el = document.getElementById(elementId);
            $tunelWidgets(id).onChange(widget => {
                el[elementProperty] = widget.value;
            });
            el.addEventListener(elementEvent, () => {
                $tunelWidgets(elementId).setValue(el[elementProperty]);
            });
        },
        addInputBinding: (elementId, elementProperty) => {
            var el = document.getElementById(elementId);
            $tunelWidgets(id).onChange(widget => {
                el[elementProperty] = widget.value;
            });
        },
        addOutputBinding: (elementId, elementProperty, elementEvent) => {
            var el = document.getElementById(elementId);
            el.addEventListener(elementEvent, () => {
                $tunelWidgets(id).setValue(el[elementProperty]);
            });
        },
        onChange: func => {
            return _addOnWidgetChangeListener(id, func);
        }
    }
}

const _addOnWidgetChangeListener = function (id, callback) {
    console.log(`Adding listener for widget "${id}"`);
    onWidgetChangeListeners.push({ id: id, callback: callback });
}

const $tunelConnection = {
    onStatusChanged: function (callback) {
        _addOnConnectionStatusChanged(callback);
    }
}
const _addOnConnectionStatusChanged = function (callback) {

    onConnectionStatusChangedListeners.push(callback);
}

function notifyConnectionStatusChanged() {
    onConnectionStatusChangedListeners.forEach(listener => {
        listener(tunelConnectionStatus);

    });
}

const $tunelFunction = function (func) {
    return {
        call:(args, returnPath) => { 
            if (returnPath != undefined) {
                var f = {
                    type:'functioncallwrtn',
                    id:makeid(),
                    functionName:func,
                    functionArgs:args,
                    returnPath:returnPath
                };
                functionCalls.push(f);
                tunelSocket.send(JSON.stringify(f));
            }
            else {
                tunelSocket.send(JSON.stringify({
                    type:'functioncall',
                    functionName:func,
                    functionArgs:args,
                }));
            }
            
        }
    }
}
const $tunelEvents = function (eventName) {
    return {
        on:callback => {
            onEventListeners.push({ name:eventName, cb:callback });
        }
    }
}


function heartbeat(ws) {
    clearTimeout(pingTimeout);

    pingTimeout = setTimeout(() => {
        ws.close();
        tunelConnectionStatus = { status: 'disconnected', reason: 'ping timeout' };
        notifyConnectionStatusChanged();
        console.log(`Server is dead!`);
        if (config.server.reloadPageOnSocketError)
            location.reload();
    }, 5000 + 1000);
}
function sendInit(ws) {
    const initMessage = {
        type: 'init'
    }
    ws.send(JSON.stringify(initMessage));
}

tunelSocket.onerror = (event) => {
    tunelConnectionStatus = { status: 'disconnected', reason: 'Socket error' };
    notifyConnectionStatusChanged();
    if (config.server.reloadPageOnSocketError)
        location.reload();
}

tunelSocket.onopen = function (event) {
    tunelConnectionStatus = { status: 'connected', reason: 'just opened' };
    notifyConnectionStatusChanged();
    console.log('Websocket is now open.');
    var init = {
        type: 'auth',
        id: config.auth.id,
        token: config.auth.token
    };
    tunelSocket.send(JSON.stringify(init));
    heartbeat(tunelSocket);
}

tunelSocket.onmessage = function (message) {
    var messageObject = JSON.parse(message.data);
    if (messageObject.type != 'ping')
    {
        console.log(messageObject);
    }

    switch (messageObject.type) {
        case 'ping':
            heartbeat(tunelSocket);
            let pong = {
                type: 'pong',
                ticks: messageObject.ticks
            }
            tunelSocket.send(JSON.stringify(pong));
            break;

        case 'message':
            var txtarea = document.getElementById('rcv');
            txtarea.value += messageObject.message + '\n';
            break;

        case 'authstatus':
            if (messageObject.status == true) {
                sendInit(tunelSocket);
            }
            break;

        case 'widgetchanged':
            widgetChanged({ id: messageObject.id, value: messageObject.value });
            break;
        
        case 'functionrtnval':
            processFunctionReturn(messageObject.id, messageObject.returnvalue);
            break;

        case 'init':
            if (messageObject.version.substring(0, messageObject.version.indexOf('.')) == config.tunelVersion.substring(0, config.tunelVersion.indexOf('.'))) {
                console.log('Version match');
                processInit(messageObject.widgets);
                tunelInitCompleted();
            }
            else {
                tunelSocket.close();
                throw new Error(`CRITICAL: VERSION MISMATCH - CLIENT:${config.tunelVersion} SERVER:${messageObject.version}`);
            }
            break;

        case 'event':
            processEvent(messageObject);
            break;

    }

}

function processEvent(event) {
    onEventListeners.forEach(el => {
        if (el.name == event.name) {
            el.cb(event.value);
        }
    });
}

function processInit(initWidgets) {
    initWidgets.forEach(w => {
        _widgets.push(w);
        widgetChanged({ id: w.id, value: w.value });
    });

}

function processFunctionReturn(id, value) {
    for (var i = 0; i < functionCalls.length; i++)
    {
        if (functionCalls[i].id == id) {
            functionCalls[i].returnPath(value);
            functionCalls.splice(i);
        }
    };
}

function sendBroadcastMessage(textbox) {
    var msgbox = document.getElementById(textbox);
    var name = document.getElementById('name');

    console.log('sending broadcastMessage');
    var message = {
        type: 'broadcastmessage',
        message: `<${name.value}> ${msgbox.value}`
    }
    tunelSocket.send(JSON.stringify(message));
    msgbox.value = '';
}

function sendWidgetValue(id, value) {
    var message = JSON.stringify({
        type: 'setwidgetvalue',
        id: id,
        value: value
    });
    tunelSocket.send(message);
}

/* test slider de volume */

document.addEventListener('DOMContentLoaded', (event) => {
   /* var volumebar = document.getElementById('volume');

    volumebar.onmouseup = () => {
        sendWidgetValue('volume', volumebar.value);
    }
    */
    var all = document.getElementsByTagName("*");

    for (var i=0, max=all.length; i < max; i++) {
        var el = all[i];
        var bindwidget = el.getAttribute('bind-widget');
        var elid = el.id;
        var bindevent = el.getAttribute('bind-event');
        var bindproperty = el.getAttribute('bind-property');

        if (bindwidget) {
            if (bindproperty) {
                $tunelWidgets(bindwidget).addInputBinding(elid, bindproperty);
            }
        }
        if (bindevent) {
            $tunelWidgets(bindwidget).addOutputBinding(elid,bindproperty,bindevent);
        }
    }
    
});
/*
$tunelConnection.onStatusChanged(status => {
    console.log('status changed!!');
    console.log(status);
});
$tunelConnection.onStatusChanged(status => {
    console.log('status changed again!');
    console.log(status);
});
*/




function widgetChanged(widget) {
    _widgets.forEach(w => {
        if (w.id == widget.id) {
            w.value = widget.value;
        }
    });
    
    onWidgetChangeListeners.forEach(w => {
        if (w.id == widget.id) {
            w.callback(widget);
        }
    });
    
}


/*
$tunelWidgets('volume').onChange(widget => {
    console.log('VALEUR CHANGÉE POUR ' + widget.value);

});
*/



