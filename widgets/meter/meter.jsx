var Meter = React.createClass({
    propTypes : {
      widgetid: React.PropTypes.string.isRequired,
      row : React.PropTypes.number.isRequired,
      col : React.PropTypes.number.isRequired,
      min : React.PropTypes.number,
      max : React.PropTypes.number,
      sizex : React.PropTypes.number,
      sizey : React.PropTypes.number,
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
        sizex : 1,
        sizey : 1,
        initialValue: 0,
      };
    },    
    getInitialState: function() {
      return {
        title: this.props.initialTitle,
        text: this.props.initialText,
        info: this.props.initialInfo,
        value: this.props.initialValue,
        updatedAt: "11"
      };
    },  
    _onChange: function(data) { 
      var from = this.state.value;
      var to = data.value;
      var that = this;
      $({ n: from }).animate({ n: to}, {
          duration: 1000,
          step: function(now, fx) {
            console.log(now);
            that.setState({value: Math.round(now)});
            $(".meter").trigger('change');
          }
      });      
    },
    componentDidMount: function() { 
      $(".meter").knob();
      WidgetStore.addChangeListener(this.props.widgetid, this._onChange);
    }, 
    componentWillUnmount: function() { 
      WidgetStore.removeChangeListener(this.props.widgetid, this._onChange); 
    },
    render: function() {
      return (
        <li className="gs_w" data-row={this.props.row} data-col={this.props.col} data-sizex={this.props.sizex} data-sizey={this.props.sizey}>
          <div className={'widget widget-meter ' + (this.props.widgetid)}>
            <h1 className="title">{this.state.title}</h1>
            <input className="meter" value={this.state.value} data-min={this.props.min} data-max={this.props.max} data-angleoffset="-125" data-anglearc="250" data-width="200" data-readonly="true"/>
            <p className="more-info">{this.state.info}</p>
            <p className="updated-at">{this.state.updatedAt}</p>
            <i className={'icon-background ' + (this.props.icon)}></i>
          </div>
        </li>        
      );
    }    
  });

