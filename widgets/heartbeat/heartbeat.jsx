var HeartBeat = React.createClass({
  propTypes : {
    widgetid: React.PropTypes.string.isRequired,
    maxTime : React.PropTypes.number,
    row : React.PropTypes.number.isRequired,
    col : React.PropTypes.number.isRequired,
    sizex : React.PropTypes.number,
    sizey : React.PropTypes.number,
  },
  getDefaultProps : function() {
    return {
      sizex : 1,
      sizey : 1,
      maxTime: 30,
      icon : "icon-time"
    };
  },  
  getInitialState: function() {
    return {
      secondsElapsed: 0,
      isAlive: true                
    };
  },
  tick: function() {
    var secondsElapsed = this.state.secondsElapsed + 1
    this.setState({
      isAlive: secondsElapsed < this.props.maxTime,
      secondsElapsed: secondsElapsed,
    });
  },
  _onChange: function(data) { 
    this.setState({
      isAlive: true,
      secondsElapsed: 0,
    });
  },
  componentDidMount: function() { 
    this.interval = setInterval(this.tick, 1000);
    WidgetStore.addChangeListener(this.props.widgetid, this._onChange);
  }, 
  componentWillUnmount: function() { 
    clearInterval(this.interval);
    WidgetStore.removeChangeListener(this.props.widgetid, this._onChange); 
  },    
  render: function() {
    return (
      <li className="gs_w" data-row={this.props.row} data-col={this.props.col} data-sizex={this.props.sizex} data-sizey={this.props.sizey}>
        <div className={'widget ' + (this.state.isAlive ? 'widget-pass' : 'widget-fail')}>
          <h1>My process</h1>
          <h1>Seconds since last beat:</h1>
          <h2>{this.state.secondsElapsed}</h2>
          <i className={'icon-background ' + (this.state.isAlive ? 'icon-ok-circle' : 'icon-ban-circle')}></i>
        </div>
      </li>
    );
  }
});
