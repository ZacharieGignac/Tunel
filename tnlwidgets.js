
class TunelWidgets {
    constructor(mods) {
        this.mods = mods;
        this.widgetsList = [];
    }
    loadWidgets(widgets) {
        widgets.forEach(w => {
            this.widgetsList.push(w);
        });
    }
    updateWidget(widget) {
        console.log(`Looking for ${widget.id}`);
        this.widgetsList.forEach(w => {
            if (w.id == widget.id) {
                w._value = widget.value;
            }
        });
    }
    getWidgetsForWeb() {
        var widlist = [];
        for (var i = 0; i < this.widgetsList.length; i++) {
            widlist.push({id:this.widgetsList[i].id, value:this.widgetsList[i].value });
        };
        return widlist;
    }
}

class Toggle {
    constructor(id,defaultvalue,onchange) {
        this.id = id;
        this.value = defaultvalue;
        this.onchange = onchange;
    }
    toggle () {
        this.value = !this.value;
    }
    set value(v) {
        this._value = v;
        if (this.onchange) this.onchange({id:this.id, value:this._value});
    }
    get value() {
        return this._value;
    }
}

class Range {
    constructor(id, defaultvalue, min, max, onchange) {
        this.id = id;
        this.value = defaultvalue;
        this._min = min;
        this._max = max;
        this.onchange = onchange;
    }
    set value(v) {
        if (v > this._max) v = this._max;
        if (v < this._min) v = this._min;
        this._value = v;
        if (this.onchange) this.onchange({id:this.id, value:this._value});
    }
    get value() {
        return this._value;
    }
}


module.exports.TunelWidgets = TunelWidgets;
module.exports.Toggle = Toggle;
module.exports.Range = Range;



