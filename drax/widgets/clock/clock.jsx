var Clock = React.createClass({
  propTypes : {
    icon : React.PropTypes.string,
  },

  getDefaultProps : function() {
    return {
      icon : "icon-time"
    };
  },

  getInitialState: function() {
    return {
      clock: this.getTime(),
      date: this.getDate()
    };
  },

  tick: function() {
    this.setState({
      clock: this.getTime(),
      date: this.getDate()
    });
  },

  getTime: function(){
    var date = new Date();
    var h = date.getHours() > 9 ? date.getHours() : '0' +date.getHours();
    var m = date.getMinutes() > 9 ? date.getMinutes() : '0' +date.getMinutes();
    var s = date.getSeconds() > 9 ? date.getSeconds() : '0' +date.getSeconds();
    return h + ":" + m + ":" +s;
  },

  getDate: function(){
    var date = new Date();
    return date.toDateString(); 
  },            

  componentDidMount: function() {
    this.interval = setInterval(this.tick, 1000);
  },

  componentWillUnmount: function() {
    clearInterval(this.interval);
  },
  
  render: function() {
    return (
      <Widget className="widget-text" widgetid={this.props.widgetid} row={this.props.row} col={this.props.col} sizex={this.props.sizex} sizey={this.props.sizey}>
        <h1>{this.state.date}</h1>
        <h2>{this.state.clock}</h2>
        <i className={'icon-background ' + (this.props.icon)}></i>
      </Widget>
    );
  }
});
