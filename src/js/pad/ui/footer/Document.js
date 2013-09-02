define(function() {

	var Document = Backbone.View.extend({
		el: 'footer #documentConfig',

		events: {
			'click': 'clickHandler',
			'click a[data-exec=outline]': 'toggleOutline'
		},

		initialize: function() {},

		clickHandler: function(e) {
			this.trigger('click');
		},

		toggleOutline: function(e) {
			var target = $(e.target);
			var show = target.hasClass('active');

			show = !show;
			show ? target.addClass('active') : target.removeClass('active') ;

			this.trigger('toggle', show);
		},

		set: function(show) {
			var target = this.$('a[data-exec=outline]');
			show ? target.addClass('active') : target.removeClass('active') ;
		}
	});

	return new Document;
});