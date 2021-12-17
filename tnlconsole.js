const source = 'tnlconsole';
const api = require('./api.js');

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
                                api.widgets.updateWidget({ id: split[2], value: split[3] });
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
                    case 'help':
                        console.log(`--- Widgets ---`);
                        console.log(`widget set <name> <value>          -Set widget value`);
                        console.log(`widget get <name/*>                -Get widget or all widgets`);
                        console.log(``);
                        console.log(`--- Clients ---`)
                        console.log(`client get *                       -Get all clients`);
                        console.log(``);
                }


            }
            catch (err) { console.log(`Command error: ${err}`); }

        });

    }
    init() {
        api.widgets.addWidgetUpdateListener((event) => {
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
