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
                                console.log(`--> Widget SET id:${split[2]} value:${split[3]} `);
                                api.widgets.updateWidget({ id: split[2], value: split[3] });
                                break;
                            case 'get':
                                if (split[2] == '*') {
                                    console.log(api.widgets.widgetsList);
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
                    case 'help':
                        console.log(`--- Widgets ---`);
                        console.log(`widget set <name> <value>`);
                        console.log(`widget get <name/*>`);
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
