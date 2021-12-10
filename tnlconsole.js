class TunelConsole {
    constructor(tws) {
        var that = this;
        this.tws = tws;
        this.stdin = process.openStdin();
        this.stdin.addListener("data", function (d) {
            try {
                var split = d.toString().trim().split(' ');
                switch (split[0]) {
                    case 'setwidget':
                        tws.broadcastWidgetChangedInternal({ id: split[1], value: split[2] });
                        break;
                    case 'getwidget':
                        
                        break;
                    case 'test':
                        tws.test();
                }
        
        
            }
            catch (err) { console.log(`Command error: ${err}`); }
        
        });
    }
}

module.exports.TunelConsole = TunelConsole;
