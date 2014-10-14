var Number = React.createClass({

  propTypes : {
    icon : React.PropTypes.string,
    initialTitle : React.PropTypes.string,
    initialText : React.PropTypes.string,
    initialInfo : React.PropTypes.string,
    style : React.PropTypes.string,
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

  render: function() {
    return (
      <Widget className="widget-number"  widgetid={this.props.widgetid} row={this.props.row} col={this.props.col} sizex={this.props.sizex} sizey={this.props.sizey}> 
        <h1 className="title">{this.state.title}</h1>
        <h2 className="value">{this.state.current}</h2>
        <p className="change-rate">
            <i className={this.state.arrowClass}></i>
            <span data-bind="difference">10%</span>
        </p>
        <p className="more-info">{this.state.info}</p>
        <p className="updated-at">{this.state.updatedAt}</p>
      </Widget>     
    );
  }
});
