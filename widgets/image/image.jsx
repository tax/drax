var Image = React.createClass({
    propTypes : {
      widgetid: React.PropTypes.string.isRequired,
      row : React.PropTypes.number.isRequired,
      col : React.PropTypes.number.isRequired,
      sizex : React.PropTypes.number,
      sizey : React.PropTypes.number,
      src : React.PropTypes.string,
    },
    getDefaultProps : function() {
      return {
        sizex : 1,
        sizey : 1,
      };
    },    
    getInitialState: function() {
      return {
        src: this.props.src,
      };
    },  
    _onChange: function(data) { 
      this.setState(data); 
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
          <div className={'widget widget-image ' + (this.props.widgetid)}>
            <img src={this.state.src} data-bind-width="width"/>
          </div>
        </li>        
      );
    }    
  });