var Image = React.createClass({
  mixins: [StreamUpdateMixin],

  propTypes : {
    src : React.PropTypes.string,
  },

  getInitialState: function() {
    return {
      src: this.props.src,
    };
  },  
  
  render: function() {
    return (
      <Widget className="widget-image"  widgetid={this.props.widgetid} row={this.props.row} col={this.props.col} sizex={this.props.sizex} sizey={this.props.sizey}>
        <img src={this.state.src} data-bind-width="width"/>
      </Widget>
    );
  }
});