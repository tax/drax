var Clock = React.createClass({
  propTypes : {
    row : React.PropTypes.number.isRequired,
    col : React.PropTypes.number.isRequired,
    sizex : React.PropTypes.number,
    sizey : React.PropTypes.number,
    icon : React.PropTypes.string,
  },
  getDefaultProps : function() {
    return {
      sizex : 1,
      sizey : 1,
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
      <li className="gs_w" data-row={this.props.row} data-col={this.props.col} data-sizex={this.props.sizex} data-sizey={this.props.sizey}>
        <div className="widget widget-text">
          <h1>{this.state.date}</h1>
          <h2>{this.state.clock}</h2>
          <i className={'icon-background ' + (this.props.icon)}></i>
        </div>
      </li>
    );
  }
});
