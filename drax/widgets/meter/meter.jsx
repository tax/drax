var Meter = React.createClass({
  mixins: [StreamUpdateMixin],

  propTypes : {
    icon : React.PropTypes.string,
    initialTitle : React.PropTypes.string,
    initialInfo : React.PropTypes.string,
    initialText : React.PropTypes.string,
    initialValue : React.PropTypes.number,
    style : React.PropTypes.string,
  },

  getDefaultProps : function() {
    return {
      min: 0,
      max: 100,
      initialValue: 0,
    };
  },   

  getInitialState: function() {
    return {
      title: this.props.initialTitle,
      text: this.props.initialText,
      info: this.props.initialInfo,
      value: this.props.initialValue,
      updatedAt: ""
    };
  },  

  onChange: function(data) { 
    var from = this.state.value;
    var to = data.value;
    var that = this;

    $({ n: from }).animate({ n: to}, {
        duration: 1000,
        step: function(now, fx) {
          data.value = Math.ceil(now);
          that.setState(data);
          $(".meter").trigger('change');
        }
    });      
  },

  componentDidMount: function() { 
    var meter = $(".meter");
    meter.attr("data-bgcolor", meter.css("background-color"));
    meter.attr("data-fgcolor", meter.css("color"));
    meter.knob();
  }, 

  render: function() {
    return (
      <Widget className="widget-meter" widgetid={this.props.widgetid} row={this.props.row} col={this.props.col} sizex={this.props.sizex} sizey={this.props.sizey}>
        <h1 className="title">{this.state.title}</h1>
        <input className="meter" value={this.state.value} data-min={this.props.min} data-max={this.props.max} data-angleoffset="-125" data-anglearc="250" data-width="200" data-readonly="true" readOnly/>
        <p className="more-info">{this.state.info}</p>
        <p className="updated-at">{this.state.updatedAt}</p>
        <i className={'icon-background ' + (this.props.icon)}></i>
      </Widget>        
    );
  }    
});
