var Number = React.createClass({
    propTypes : {
      widgetid: React.PropTypes.string.isRequired,
      row : React.PropTypes.number.isRequired,
      col : React.PropTypes.number.isRequired,
      sizex : React.PropTypes.number,
      sizey : React.PropTypes.number,
      icon : React.PropTypes.string,
      initialTitle : React.PropTypes.string,
      initialText : React.PropTypes.string,
      initialInfo : React.PropTypes.string,
      style : React.PropTypes.string,
    },
    getDefaultProps : function() {
      return {
        sizex : 1,
        sizey : 1,
      };
    },    
    getInitialState: function() {
      return {
        title: this.props.initialTitle,
        text: this.props.initialText,
        info: this.props.initialInfo,
        arrowClass: "icon-arrow-up",
        updatedAt: "Last updated at 21:14",
        current:10
      };
    },    
    _onChange: function(data) { 
      this.setState({ 
        value: data
      }); 
    },
    componentDidMount: function() { 
      WidgetStore.addChangeListener(this.props.widgetid, this._onChange);
    }, 
    componentWillUnmount: function() { 
      WidgetStore.removeChangeListener(this.props.widgetid, this._onChange); 
    },    
    render: function() {
      return (
        <li className="gs_w" data-row={this.props.row} data-col={this.props.col} data-sizex={this.props.sizex} data-sizey={this.props.sizey}>
          <div className={'widget widget-number ' + (this.props.widgetid)}>
            <h1 className="title">{this.state.title}</h1>
            <h2 className="value">{this.state.current}</h2>
            <p className="change-rate">
                <i className={this.state.arrowClass}></i>
                <span data-bind="difference">10%</span>
            </p>
            <p className="more-info">{this.state.info}</p>
            <p className="updated-at">{this.state.updatedAt}</p>
          </div>
        </li>        
      );
    }
  });