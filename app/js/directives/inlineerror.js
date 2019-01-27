four51.app.directive('inlineerror', function () {
	return {
		restrict:'E',
		transclude:true,
		scope:{ title:'@' },
		template:'<p class="view-inline-error">{{title}}</p>',
		replace:true
	};
});

four51.app.directive('inlinecodeerror', function () {
	return {
		restrict:'E',
		transclude:true,
		scope:{ title:'@' },
		template:'<p class="view-inline-error"><span ng-bind-html="title"></span><i style="cursor:pointer; float:right;" ng-click="$parent.clearCodeReturn()" class="fa fa-times-circle"></i></p>',
		replace:true
	};
});