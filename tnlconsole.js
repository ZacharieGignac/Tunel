const source = 'tnlconsole';
const api = require('./api.js');
const security = require('./security');


Array.prototype.myJoin = function(seperator,start,end){
    if(!start) start = 0;
    if(!end) end = this.length - 1;
    end++;
    return this.slice(start,end).join(seperator);
};

class TunelConsole {
    constructor(mods) {
        this.mods = mods;
        this._updateServerWidgetListeners = [];
        this.stdin = process.openStdin();
        this.stdin.addListener("data", function (d) {
            try {
                var split = d.toString().trim().split(' ');
                switch (split[0]) {
                    case 'widget':
                        switch (split[1]) {
                            case 'set':
                                if (split[3] == 'true') split[3] = true;
                                if (split[3] == 'false') split[3] = false;
                                console.log(`--> Widget SET id:${split[2]} value:${split[3]} `);
                                api.widgetsManager.updateWidget({ id: split[2], value: split[3] });
                                break;
                            case 'get':
                                if (split[2] == '*') {
                                        mods.widgets.widgetsList.forEach(w => {
                                            console.log(w.toObject());
                                        });
                                }
                                else {
                                    mods.widgets.widgetsList.forEach(w => {
                                        if (w.id == split[2]) {
                                            console.log(w);
                                        }
                                    });
                                }
                                break;

                        }
                        break;
                    case 'client':
                    case 'get':
                        if (split[2] == '*') {
                            api.websocket.wss.clients.forEach(client => {
                                console.log({ clientId: client.clientId, remoteAddress: client._socket.remoteAddress, isAlive: client.isAlive, auth: client.auth, token: client.token });
                            });
                        }
                        break;

                        break;
                    case 'access':
                        if (split[1] == 'list') {
                            console.log(security.getAccessList());
                        }
                        else if (split[1] == 'adduser') {
                            var user = split[2];
                            console.log(`User ${user} added. Below is the access token. COPY IT NOW. IT CANNOT BE RETRIEVED LATER.`);
                            console.log(security.createAccess(user,"user"));
                            console.log('');

                        }
                        break;
                    case 'event':
                        if (split[1] == 'broadcast') {
                            api.events.event(split[2]).broadcast(split.myJoin(' ',3));
                        }

                        break;
                    case 'help':
                        console.log(`--- Widgets ---`);
                        console.log(`widget set <name> <value>          -Set widget value`);
                        console.log(`widget get <name/*>                -Get widget or all widgets`);
                        console.log(``);
                        console.log(`--- Events ---`)
                        console.log(`event broadcast <name> <value>`)
                        console.log(``);
                        console.log(`--- Clients ---`)
                        console.log(`client get *                       -Get all clients`);
                        console.log(``);
                        console.log(`--- access ---`);
                        console.log(`access list                        -List all access`)
                        console.log(`access adduser <name>              -Create user and outputs login token`);
                        console.log('');
                }


            }
            catch (err) { console.log(`Command error: ${err}`); }

        });

    }
    init() {
        api.widgetsManager.addWidgetUpdateListener((event) => {
            console.log(`<-- Widget SET id:${event.id} value:${event.value}`);
        });
    }
    addUpdateServerWidgetListener(listener) {
        this._updateServerWidgetListeners.push(listener);
    }
    log() {
        console.log('Log from console');
    }
}

module.exports.TunelConsole = TunelConsole;
