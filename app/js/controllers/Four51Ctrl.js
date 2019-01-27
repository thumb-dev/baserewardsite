four51.app.controller('Four51Ctrl', ['$scope', '$route', '$location', '$451', 'User', 'Order', 'Security', 'OrderConfig', 'Category', 'AppConst', 'XLATService', 'SpendingAccount', 'GoogleAnalytics',
    function($scope, $route, $location, $451, User, Order, Security, OrderConfig, Category, AppConst, XLATService, SpendingAccount, GoogleAnalytics) {
        $scope.AppConst = AppConst;
        $scope.scroll = 0;
        $scope.isAnon = $451.isAnon; //need to know this before we have access to the user object
        $scope.Four51User = Security;
        if ($451.isAnon && !Security.isAuthenticated()) {
            //User.login(function() {
               // $route.reload();
            //});
        }
        
        if(!$scope.sortSet){
			$scope.sort = null;
			$scope.sortName = null;
			$scope.sorter = null;
			$scope.sortSet = true;
        }

        function contains(array, obj) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].Name == obj) {
                    return true;
                }
            }
            return false;
        }
            
        $scope.navigateTo = function(place){$location.path(place);};
        $scope.navigateOutTo = function(place){
            var win = window.open(place, '_blank');
            win.focus();
        };
            
            // fix Bootstrap fixed-top and fixed-bottom from jumping around on mobile input when virtual keyboard appears
        if ($(window).width() < 960) {
            $(document).on('focus', ':input:not("button")', function(e) {
                $('.navbar-fixed-bottom, .headroom.navbar-fixed-top').css("position", "relative");
            }).on('blur', ':input', function(e) {
                $('.navbar-fixed-bottom, .headroom.navbar-fixed-top').css("position", "fixed");
            });
        }

        function init() {
            if (Security.isAuthenticated()) {
                User.get(function(user) {
                    $scope.user = user;
                    $scope.user.Culture.CurrencyPrefix = XLATService.getCurrentLanguage(user.CultureUI, user.Culture.Name)[1];
                    $scope.user.Culture.DateFormat = XLATService.getCurrentLanguage(user.CultureUI, user.Culture.Name)[2];
                    if (!$scope.user.TermsAccepted && $scope.user.Type !== 'TempCustomer')
                        $location.path('conditions');
                    if (user.CurrentOrderID) {
                        Order.get(user.CurrentOrderID, function(ordr) {
                            $scope.currentOrder = ordr;
                            OrderConfig.costcenter(ordr, user);
                        });
                    } else $scope.currentOrder = null;
                    if (user.Company.GoogleAnalyticsCode) {
                        GoogleAnalytics.analyticsLogin(user.Company.GoogleAnalyticsCode);
                    }
                });
                Category.tree(function(data) {
                    $scope.tree = data;
                    $scope.$broadcast("treeComplete", data);
                });
            }
        }

        function analytics(id) {
            if (id.length == 0 || window.ga) return;
            (function(i, s, o, g, r, a, m) {
                i['GoogleAnalyticsObject'] = r;
                i[r] = i[r] || function() {
                    (i[r].q = i[r].q || []).push(arguments)
                }, i[r].l = 1 * new Date();
                a = s.createElement(o),
                    m = s.getElementsByTagName(o)[0];
                a.async = 1;
                a.src = g;
                m.parentNode.insertBefore(a, m)
            })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
            ga('create', id, 'four51.com');
            ga('require', 'ecommerce', 'ecommerce.js');
        }
        try {
            trackJs.configure({
                trackAjaxFail: false
            });
        } catch (ex) {}
        $scope.errorSection = '';

        function cleanup() {
            Security.clear();
        }
        $scope.$on('event:auth-loginConfirmed', function() {
            $route.reload();
        });
        $scope.$on("$routeChangeSuccess", init);
        $scope.$on('event:auth-loginRequired', cleanup);

        $scope.$watch('user', function() {
		    SpendingAccount.query(function(data) {
		        if (data[0]){
    			$scope.user.SpendingAccounts = data;
    			$scope.user.SpendingAccounts[0].Balance = $scope.user.SpendingAccounts[0].Balance.toFixed(2);
    			$scope.user.SpendingAccounts[0].Balance = $scope.user.SpendingAccounts[0].Balance.replace(/(\.[0-9]*?)0+$/, "$1"); // remove trailing zeros
    			$scope.user.SpendingAccounts[0].Balance = $scope.user.SpendingAccounts[0].Balance.replace(/\.$/, "");              // remove trailing dot
    			$scope.user.SpendingAccounts[0].Balance = addCommas($scope.user.SpendingAccounts[0].Balance);
		        }

	        });
    	});
    	
    	function addCommas(num) {
        	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    	}
    }
]);