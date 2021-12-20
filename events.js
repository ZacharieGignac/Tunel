var _eventListeners = [];

module.exports.event = function (eventName) {
    return {
        on: (func) => {
            var listenAll = false;

            if (eventName == undefined)
                listenAll = true
            _eventListeners.push({ listenAll: listenAll, eventName: eventName, eventFunc: func });
        },
        broadcast: (value) => {
            _eventListeners.forEach(el => {
                
                if (el.eventName == eventName || el.listenAll) {
                    el.eventFunc({name:eventName, value:value});
                }
            });
        }
    }
}