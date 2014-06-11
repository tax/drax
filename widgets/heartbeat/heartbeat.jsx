var HeartBeat = React.createClass({
  propTypes : {
    row : React.PropTypes.number.isRequired,
    col : React.PropTypes.number.isRequired,
    sizex : React.PropTypes.number,
    sizey : React.PropTypes.number,
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
      secondsElapsed: 0,
      isAlive: true                
    };
  },
  tick: function() {
    this.setState({
      isAlive: this.isAlive(),
      secondsElapsed: this.state.secondsElapsed + 1,
      
    });
  },
  isAlive:function(){
    if( this.state.secondsElapsed > 30){
      return false;
    }
    return true;
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
        <div className={'widget ' + (this.state.isAlive ? 'widget-pass' : 'widget-fail')}>
          <h1>Seconds since last beat:</h1>
          <h2>{this.state.secondsElapsed}</h2>
          <i className={'icon-background ' + (this.state.isAlive ? 'icon-ok-circle' : 'icon-ban-circle')}></i>
        </div>
      </li>
    );
  }
});
