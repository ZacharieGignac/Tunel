class TunelConsole {
    constructor(mods) {
        this.mods = mods;
        this.stdin = process.openStdin();
        this.stdin.addListener("data", function (d) {
            try {
                var split = d.toString().trim().split(' ');
                switch (split[0]) {
                    case 'setwidget':
                        mods.websocket.broadcastWidgetChangedInternal({ id: split[1], value: split[2] });
                        mods.widgets.updateWidget({id: split[1], value: split[2]});
                        break;
                    case 'getwidget':
                        
                        break;
                    case 'test':
                        mods.websocket.test();
                }
        
        
            }
            catch (err) { console.log(`Command error: ${err}`); }
        
        });
    }
}

module.exports.TunelConsole = TunelConsole;
