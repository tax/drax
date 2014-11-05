var WidgetStore = {
    _widgets : {},

    init: function(eventSource){
      var that = this;
      eventSource.onmessage = function(evt){
        var msg = JSON.parse(evt.data);
        
        // Send reload event to dashboard
        if(msg.event == 'dashboard' && msg.data.event == 'reload'){
          var dashboard = msg.data.id
          if(dashboard == '*' || window.location.pathname == '/'+dashboard){
            window.location.reload(true);  
          }
        }

        if(msg.event == 'widget'){
          var cb = that._widgets[msg.data.id];
          return cb(that.formatData(msg.data));
        }

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

var evtSrc = new WebSocket("ws://" + location.host + "/subscribe");
WidgetStore.init(evtSrc);


var StreamUpdateMixin = {

  _onChange: function(data) { 
    // If widget defines onChange method call that one
    if(this.hasOwnProperty('onChange')){
      this.onChange(data);   
    }
    else{
      this.setState(data);   
    }
  },

  componentDidMount: function() { 

    WidgetStore.addChangeListener(this.props.widgetid, this._onChange);
  }, 

  componentWillUnmount: function() { 
    WidgetStore.removeChangeListener(this.props.widgetid, this._onChange); 
  } 
};


var Widget = React.createClass({
    propTypes : {
      widgetid: React.PropTypes.string.isRequired,
      row : React.PropTypes.number.isRequired,
      col : React.PropTypes.number.isRequired,
      className: React.PropTypes.string,
      sizex : React.PropTypes.number,
      sizey : React.PropTypes.number,
    },

    getDefaultProps : function() {
      return {
        sizex : 1,
        sizey : 1,
        className: "widget-text"
      };
    },  

    render: function() {
      return (
        <li className="gs_w" data-row={this.props.row} data-col={this.props.col} data-sizex={this.props.sizex} data-sizey={this.props.sizey}>
          <div className={'widget ' + ' ' +  (this.props.className)+' ' +(this.props.widgetid)}>
            {this.props.children}
          </div>
        </li>
      );
    }    
  });


var Dashboard = React.createClass({
    propTypes : {
      widgetHeight : React.PropTypes.number,
      widgetWidth : React.PropTypes.number,
      margins : React.PropTypes.arrayOf(React.PropTypes.number),
    },

    getDefaultProps : function() {
      return {
        widgetHeight : 450,
        widgetWidth : 360,
        margins: [5,5] 
      };
    },  

    componentDidMount: function() {
      $(".gridster > ul").gridster({
        widget_margins: this.props.margins,
        widget_base_dimensions: [this.props.widgetWidth, this.props.widgetHeight]
      });
    },

    render: function() {
      return (
        <div className="gridster ready">
          <ul>
            {this.props.children}
          </ul>
        </div>
      );
    }
});
