var List = React.createClass({
    propTypes : {
      widgetid: React.PropTypes.string.isRequired,
      row : React.PropTypes.number.isRequired,
      col : React.PropTypes.number.isRequired,
      sizex : React.PropTypes.number,
      sizey : React.PropTypes.number,
      initialTitle : React.PropTypes.string,
      unordered : React.PropTypes.bool,
    },
    getDefaultProps : function() {
      return {
        sizex : 1,
        sizey : 1,
        unordered: true
      };
    },    
    getInitialState: function() {
      return {
        title: this.props.initialTitle,
        info: this.props.initialInfo,
        items: []
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
      var listItems = this.state.items.map(function (item) {
        return <li>
                <span className="label">{item.label}</span>
                <span className="value">{item.value}</span>
            </li>
      });        
      return (
        <li className="gs_w" data-row={this.props.row} data-col={this.props.col} data-sizex={this.props.sizex} data-sizey={this.props.sizey}>
          <div className={'widget widget-list ' + (this.props.widgetid)}>
            <h1 className="title">{this.state.title}</h1>
            {this.props.unordered ? <ul className="list-nostyle">{listItems}</ul> : <ol>{listItems}</ol>}
            <p className="more-info">{this.state.info}</p>
            <p className="updated-at">{this.state.updatedAt}</p>
          </div>
        </li>        
      );
    }    
});