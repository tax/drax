var List = React.createClass({
  mixins: [StreamUpdateMixin],

  propTypes : {
    initialTitle : React.PropTypes.string,
    unordered : React.PropTypes.bool,
  },

  getDefaultProps : function() {
    return {
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

  render: function() {
    var listItems = this.state.items.map(function (item) {
      return <li>
              <span className="label">{item.label}</span>
              <span className="value">{item.value}</span>
          </li>
    });        
    return (
      <Widget className="widget-list" widgetid={this.props.widgetid} row={this.props.row} col={this.props.col} sizex={this.props.sizex} sizey={this.props.sizey}>
        <h1 className="title">{this.state.title}</h1>
        {this.props.unordered ? <ul className="list-nostyle">{listItems}</ul> : <ol>{listItems}</ol>}
        <p className="more-info">{this.state.info}</p>
        <p className="updated-at">{this.state.updatedAt}</p>
      </Widget>        
    );
  }
});