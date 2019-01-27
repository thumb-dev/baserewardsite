four51.app.directive('branding', function() {
    var obj = {
        restrict: 'E',
        templateUrl: 'partials/branding.html',
        controller: 'NavCtrl'
    }
    return obj;
});

four51.app.directive('homemessage', function() {
	var obj = {
		restrict: 'E',
		templateUrl: 'partials/messages/home.html'
	};
	return obj;
});