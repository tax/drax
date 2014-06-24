var WidgetStore = {
    _widgets : {},

    init: function(eventSource){
      var that = this;
      eventSource.onmessage = function(msg){
        console.log(msg);
        var data = JSON.parse(msg.data); 
        var cb = that._widgets[data.id];
        return cb(that.formatData(data));        
      }
    },

    formatData: function(data){
      var timestamp = new Date();
      if('updatedAt' in data){
        timestamp = new Date(data.updatedAt * 1000);
      }
      var hours = timestamp.getHours();
      var minutes = ("0" + timestamp.getMinutes()).slice(-2);
      data.updatedAt = "Last updated at "+ hours +":" + minutes;
      return data;
    },

    messageHandler: function(msg){
      console.log(this._widgets);
      var data = JSON.parse(msg.data);
      var cb = this._widgets[data.id];
      return cb(data);
    },
    
    addChangeListener: function(widgetId, callback){
        this._widgets[widgetId] = callback;
    }, 

    removeChangeListener: function(widgetId, callback){
        delete this._widgets[widgetId];
    }
    
};

var evtSrc = new EventSource("/subscribe");
WidgetStore.init(evtSrc);