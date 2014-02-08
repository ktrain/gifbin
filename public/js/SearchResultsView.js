SearchResultsView = xo.view.extend({
	schematic : DOM.div({class : 'searchResults', style : 'margin-left:-7px'}),

	initialize : function(){
		this.collection = this.model;
		return this;
	},

	render : function(){
		var self = this;

		this.collection.each(function(gif){
			var newView = CardView.create(gif).appendTo(self.dom.view);
		});

		this.searchBar.on('searching', function(){
			if(self.dom.view.is(':visible')) self.dom.view.stop().fadeTo(300, 0.4);
		});
		this.searchBar.on('searched', function(terms){
			self.collection.search(terms);
			if(self.dom.view.is(':visible')) self.dom.view.stop().fadeTo(100, 1);
		});

		return this;
	},


});