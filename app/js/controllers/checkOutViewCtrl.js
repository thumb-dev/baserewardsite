four51.app.controller('CheckOutViewCtrl', ['$scope', '$routeParams', '$location', '$filter', '$rootScope', '$451', 'Analytics', 'User', 'Order', 'OrderConfig', 'FavoriteOrder', 'AddressList', 'Resources',
function ($scope, $routeParams, $location, $filter, $rootScope, $451, Analytics, User, Order, OrderConfig, FavoriteOrder, AddressList, Resources) {
	$scope.errorSection = 'open';

	$scope.isEditforApproval = $routeParams.id != null && $scope.user.Permissions.contains('EditApprovalOrder');
	if ($scope.isEditforApproval) {
		Order.get($routeParams.id, function(order) {
			$scope.currentOrder = order;
		});
    }
    
    angular.forEach($scope.currentOrder.OrderFields, function(field){
        if (field.Name == 'XLUserFirstName') {
            field.Value = $scope.user.FirstName;
        }
        if (field.Name == 'XLUserLastName') {
            field.Value = $scope.user.LastName;
        }
        if (field.Name == 'XLUserCompany') {
            angular.forEach($scope.user.CustomFields, function(uField){
                if (uField.Name == 'XL1_Company') {
                    field.Value = uField.Value;
                }
            });
        }
        if (field.Name == 'XLUserPhoneNumber') {
            field.Value = $scope.user.Phone;
        }
        if (field.Name == 'XLUserMerchant') {
            angular.forEach($scope.user.CustomFields, function(uField){
                if (uField.Name == 'XL1_MerchantUser') {
                    field.Value = uField.Value;
                }
            });
        }
        if (field.Name == 'XLUserMerchantLocation') {
            angular.forEach($scope.user.CustomFields, function(uField){
                if (uField.Name == 'XL1_MerchantLocation') {
                    field.Value = uField.Value;
                }
            });
        }
        if (field.Name == 'XLUserMerchantRep') {
            angular.forEach($scope.user.CustomFields, function(uField){
                if (uField.Name == 'XL1_Rep_Display') {
                    field.Value = uField.Value;
                }
            });
        }
        if (field.Name == 'XLUserPointsSpentTotal') {
            if ($scope.isSplitBilling) {
                field.Value = $scope.currentBudgetAccount.Balance;
            }
            else {
                field.Value = $scope.currentOrder.Total;
            }
        }
    });

    $scope.$watch('splitBilling', function(){
        updatePointsSpent();
    }, true);

    $scope.$watch('currentBudgetAccount', function(){
        updatePointsSpent();
    }, true);

    function updatePointsSpent() {
        angular.forEach($scope.currentOrder.OrderFields, function(field){
            if (field.Name == 'XLUserPointsSpentTotal') {
                if ($scope.isSplitBilling) {
                    field.Value = $scope.currentBudgetAccount.Balance;
                }
                else {
                    field.Value = $scope.currentOrder.Total;
                }
            }
        });
    }

	if (!$scope.currentOrder) {
        $location.path('catalog');
    }
    
    angular.forEach($scope.currentOrder.LineItems, function(item){
        if(item.Product.InteropID == "xl1-order-handling-charge"){
            $scope.handlingCharge = item.LineTotal;
        }
    });

	$scope.hasOrderConfig = OrderConfig.hasConfig($scope.currentOrder, $scope.user);
	$scope.checkOutSection = $scope.hasOrderConfig ? 'order' : 'shipping';

    function submitOrder() {
	    $scope.displayLoadingIndicator = true;
	    $scope.errorMessage = null;
		
		angular.forEach($scope.currentOrder.LineItems, function(item, index) {
			if(item.Product.ExternalID == "XL1-17370"){
				angular.forEach($scope.user.CustomFields, function(field, index) {
					if(field.Name == "XL1_Codes_Submitted"){
						field.Value = "Redeemed";
					}
				});
				//User.save($scope.user);
			}
		});
		
        Order.submit($scope.currentOrder,
	        function(data) {
//				if ($scope.user.Company.GoogleAnalyticsCode) {
//					Analytics.trackOrder(data, $scope.user);
//				}
				$scope.user.CurrentOrderID = null;
				User.save($scope.user, function(data) {
			        $scope.user = data;
	                $scope.displayLoadingIndicator = false;
		        });
		        $scope.currentOrder = null;
		        $location.path('/order/' + data.ID);
	        },
	        function(ex) {
		        $scope.errorMessage = ex.Message;
		        $scope.displayLoadingIndicator = false;
		        $scope.shippingUpdatingIndicator = false;
		        $scope.shippingFetchIndicator = false;
	        }
        );
    };

	$scope.$watch('currentOrder.CostCenter', function() {
		OrderConfig.address($scope.currentOrder, $scope.user);
	});

    function saveChanges(callback) {
	    $scope.displayLoadingIndicator = true;
	    $scope.errorMessage = null;
	    $scope.actionMessage = null;
	    var auto = $scope.currentOrder.autoID;
	    Order.save($scope.currentOrder,
	        function(data) {
		        $scope.currentOrder = data;
		        if (auto) {
			        $scope.currentOrder.autoID = true;
			        $scope.currentOrder.ExternalID = 'auto';
		        }
		        $scope.displayLoadingIndicator = false;
		        if (callback) callback($scope.currentOrder);
	            $scope.actionMessage = "Your changes have been saved";
	        },
	        function(ex) {
		        $scope.currentOrder.ExternalID = null;
		        $scope.errorMessage = ex.Message;
		        $scope.displayLoadingIndicator = false;
		        $scope.shippingUpdatingIndicator = false;
		        $scope.shippingFetchIndicator = false;
	        }
        );
    };

    $scope.continueShopping = function() {
	    if (confirm('Do you want to save changes to your order before continuing?') == true)
	        saveChanges(function() { $location.path('catalog') });
        else
		    $location.path('catalog');
    };

    $scope.cancelOrder = function() {
	    if (confirm('Are you sure you wish to cancel your order?') == true) {
		    $scope.displayLoadingIndicator = true;
	        Order.delete($scope.currentOrder,
		        function() {
		            $scope.user.CurrentOrderID = null;
		            $scope.currentOrder = null;
			        User.save($scope.user, function(data) {
				        $scope.user = data;
				        $scope.displayLoadingIndicator = false;
				        $location.path('catalog');
			        });
		        },
		        function(ex) {
			        $scope.actionMessage = ex.Message;
			        $scope.displayLoadingIndicator = false;
		        }
	        );
	    }
    };

    $scope.saveChanges = function() {
        saveChanges();
    };

    $scope.submitOrder = function() {
       submitOrder();
    };

    $scope.saveFavorite = function() {
        FavoriteOrder.save($scope.currentOrder);
    };

	$scope.cancelEdit = function() {
		$location.path('order');
	};
}]);