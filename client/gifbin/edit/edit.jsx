
var React = require('react');
var _ = require('lodash');
var GifForm = require('gifbin/gifForm/gifForm.jsx');

var Edit = React.createClass({
	componentDidMount: function() {
		document.title = 'gifbin.edit';
	},
	render : function(){
		var self = this;
		return(
			<div className='edit'>
				<GifForm gif={this.props.gif} />
			</div>
		);
	}
});

module.exports = Edit;
