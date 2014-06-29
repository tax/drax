var Text = React.createClass({
    mixins: [StreamUpdateMixin],

    propTypes : {
      icon : React.PropTypes.string,
      initialTitle : React.PropTypes.string,
      initialInfo : React.PropTypes.string,
      initialText : React.PropTypes.string,
      style : React.PropTypes.string,
    },
    
    getInitialState: function() {
      return {
        title: this.props.initialTitle,
        text: this.props.initialText,
        info: this.props.initialInfo,
        updatedAt: ""
      };
    },  

    render: function() {
      return (
        <Widget widgetid={this.props.widgetid} row={this.props.row} col={this.props.col} sizex={this.props.sizex} sizey={this.props.sizey}>
          <h1 className="title">{this.state.title}</h1>
          <h3>{this.state.text}</h3>
          <p className="more-info">{this.state.info}</p>
          <p className="updated-at">{this.state.updatedAt}</p>
          <i className={'icon-background ' + (this.props.icon)}></i>
        </Widget>        
      );
    }    
  });