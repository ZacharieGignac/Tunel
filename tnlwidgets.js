
class TunelWidgets {
    constructor() {
        this.widgetsList = [];
        this._widgetUpdateListeners = [];
    }
    loadWidgets(widgets) {
        widgets.forEach(w => {
            this.widgetsList.push(w);
            w.onChange(change => {
                this._widgetUpdateListeners.forEach(listener => {
                    listener({id:change.id, value:change.value});
                });
            });
        });
    }
    updateWidget(widget) {
        this.widgetsList.forEach(w => {
            if (w.id == widget.id) {
                w.value = widget.value;
                /* PAS SUR !??????
                this._widgetUpdateListeners.forEach(listener => {
                    listener({updateSource:widget.updateSource, id:w.id, value:w._value});
                });
                */
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
    addWidgetUpdateListener(listener) {
        this._widgetUpdateListeners.push(listener);
    }
    get(id) {
        for (var i = 0; i < this.widgetsList.length; i++) {
            if (this.widgetsList[i].id == id) {
                return this.widgetsList[i];
            }
        }
    }
    set(id, value) {
        console.log(`Setting ${id} to ${value}`);
        for (var i = 0; i < this.widgetsList.length; i++) {
            if (this.widgetsList[i].id == id) {
                this.widgetsList[i].value = value;
            }
        }
    }
    getWidgetClass(type) {
        switch(type) {
            case 'value':
                return Value;
                break;
            case 'toggle':
                return Toggle;
                break;
            case 'range':
                return Range;
                break;
        }
    }
}

class Widget {
    constructor() {
        this._onChangeListeners = [];
    }
    onChange(listener) {
        this._onChangeListeners.push(listener);
    }
    _valueChanged(widget) {
        this._onChangeListeners.forEach(listener => {
            listener({id:widget.id, value:widget._value});
        });
        
    }
}

class Toggle extends Widget { //TODO TRUE FALSE UNIQUEMENT
    constructor(id,defaultvalue) {
        super();
        this.id = id;
        this.value = defaultvalue;
    }
    toggle () {
        this.value = !this.value;
    }
    set value(v) {
        if (v == 'on') { v = true }
        else if (v == 'off') { v = false }
        if (v == 'true') { v = true }
        if (v == 'false') { v = false }
        else if (v == true || v == false) { }
        else {
            v = false;
        }
        this._value = v;
        super._valueChanged(this);
    }
    get value() {
        return this._value;
    }
    toObject() {
        return ({ id:this.id, value:this._value });
    }
}

class Range extends Widget {
    constructor(id, defaultvalue, min, max) {
        super();
        this.id = id;
        this.value = defaultvalue;
        this._min = min;
        this._max = max;
    }
    set value(v) {
        if (v > this._max) v = this._max;
        if (v < this._min) v = this._min;
        this._value = v;
        super._valueChanged(this);
    }
    get value() {
        return this._value;
    }
    toObject() {
        return ({ id:this.id, value:this._value, min:this._min, max:this._max });
    }
}

class Value extends Widget {
    constructor(id, defaultvalue) {
        super();
        this.id = id;
        this.value = defaultvalue;
    }
    set value(v) {
        this._value = v;
        super._valueChanged(this);
    }
    get value() {
        return this._value;
    }
    toObject() {
        return ({id:this.id, value:this._value}); 
    }  
}

function test(){
    console.log('test');
}

module.exports.TunelWidgets = TunelWidgets;
module.exports.Toggle = Toggle;
module.exports.Range = Range;
module.exports.Value = Value;
module.exports.test = test;
