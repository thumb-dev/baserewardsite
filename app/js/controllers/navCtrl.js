four51.app.controller('NavCtrl', ['$location', '$route', '$scope', '$451', 'User', function ($location, $route, $scope, $451, User) {
    $scope.Logout = function(){
        User.logout();
        if ($scope.isAnon) {
            $location.path('/catalog');
            User.login();
        }
        else {
            console.log('in there');
            $location.path('/');
        }
    };
    
    $scope.$watch('event', function() {
		if ($scope.event && $scope.event.keyCode == "13") {
			$location.path('search/' + $scope.navSearchTerm);
			$scope.event.keyCode = null;
		}
	});

	$scope.refreshUser = function() {
		store.clear();
	}
	
	/* Open the sidenav */
    $scope.openNav = function() {
        document.getElementById("mySidenav").style.width = "100%";
    }

    /* Close/hide the sidenav */
    $scope.closeNav = function() {
        document.getElementById("mySidenav").style.width = "0";
    }

    // http://stackoverflow.com/questions/12592472/how-to-highlight-a-current-menu-item-in-angularjs
    $scope.isActive = function(path) {
        var cur_path = $location.path().replace('/', '');
        var result = false;

        if (path instanceof Array) {
            angular.forEach(path, function(p) {
                if (p == cur_path && !result)
                    result = true;
            });
        }
        else {
            if (cur_path == path)
                result = true;
        }
        return result;
    };
    // extension of above isActive in path
    $scope.isInPath = function(path) {
        var cur_path = $location.path().replace('/', '');
        var result = false;

        if(cur_path.indexOf(path) > -1) {
            result = true;
        }
        else {
            result = false;
        }
        return result;
    };

	$scope.Clear = function() {
		localStorage.clear();
	}

	$scope.$on('event:orderUpdate', function(event, order) {
		$scope.cartCount = order ? (order.Status == 'Unsubmitted' || order.Status == 'AwaitingApproval') ? order.LineItems.length : null : null;
	});
}]);