four51.app.controller('CartViewCtrl', ['$scope', '$routeParams', '$location', '$451', 'Order', 'OrderConfig', 'User', 'Product', 'ProductDisplayService',
    function ($scope, $routeParams, $location, $451, Order, OrderConfig, User, Product, ProductDisplayService) {
        $scope.isEditforApproval = $routeParams.id != null && $scope.user.Permissions.contains('EditApprovalOrder');
        if ($scope.isEditforApproval) {
            Order.get($routeParams.id, function (order) {
                $scope.currentOrder = order;
                // add cost center if it doesn't exists for the approving user
                var exists = false;
                angular.forEach(order.LineItems, function (li) {
                    angular.forEach($scope.user.CostCenters, function (cc) {
                        if (exists) return;
                        exists = cc == li.CostCenter;
                    });
                    if (!exists) {
                        $scope.user.CostCenters.push({
                            'Name': li.CostCenter
                        });
                    }
                });
            });
        }

        $scope.currentDate = new Date();
        $scope.errorMessage = null;
        $scope.continueShopping = function () {
            if (!$scope.cart.$invalid) {
                if (confirm('Do you want to save changes to your order before continuing?') == true)
                    $scope.saveChanges(function () { $location.path('catalog') });
            }
            else
                $location.path('catalog');
        };

        $scope.cancelOrder = function (bypass) {
            if (bypass) {
                $scope.displayLoadingIndicator = true;
                $scope.actionMessage = null;
                Order.delete($scope.currentOrder,
                    function () {
                        $scope.currentOrder = null;
                        $scope.user.CurrentOrderID = null;
                        User.save($scope.user, function () {
                            $location.path('catalog');
                        });
                        $scope.displayLoadingIndicator = false;
                        $scope.actionMessage = 'Your Changes Have Been Saved';
                    },
                    function (ex) {
                        $scope.actionMessage = 'An error occurred: ' + ex.Message;
                        $scope.displayLoadingIndicator = false;
                    }
                );
            }

            else if (confirm('Are you sure you wish to cancel your order?') == true) {
                $scope.displayLoadingIndicator = true;
                $scope.actionMessage = null;
                Order.delete($scope.currentOrder,
                    function () {
                        $scope.currentOrder = null;
                        $scope.user.CurrentOrderID = null;
                        User.save($scope.user, function () {
                            $location.path('catalog');
                        });
                        $scope.displayLoadingIndicator = false;
                        $scope.actionMessage = 'Your Changes Have Been Saved';
                    },
                    function (ex) {
                        $scope.actionMessage = 'An error occurred: ' + ex.Message;
                        $scope.displayLoadingIndicator = false;
                    }
                );
            }
        };

        $scope.saveChanges = function (callback) {
			console.log($scope.currentOrder);
            $scope.actionMessage = null;
            $scope.errorMessage = null;
            if ($scope.currentOrder.LineItems.length == $451.filter($scope.currentOrder.LineItems, { Property: 'Selected', Value: true }).length) {
                $scope.cancelOrder();
            }

            else {
                $scope.displayLoadingIndicator = true;
                OrderConfig.address($scope.currentOrder, $scope.user);
                Order.save($scope.currentOrder,
                    function (data) {
						console.log($scope.currentOrder);
                        $scope.currentOrder = data;
                        $scope.displayLoadingIndicator = false;
                        if (callback) callback();
                        $scope.actionMessage = 'Your Changes Have Been Saved';
                    },
                    function (ex) {
                        $scope.errorMessage = ex.Message;
                        $scope.displayLoadingIndicator = false;
                    }
                );
            }
        };

        $scope.removeItem = function (item, bypass) {
            if (bypass) {
                Order.deletelineitem($scope.currentOrder.ID, item.ID,
                    function (order) {
                        $scope.currentOrder = order;
                        Order.clearshipping($scope.currentOrder);
                        if (!order) {
                            $scope.user.CurrentOrderID = null;
                            User.save($scope.user, function () {
                                $location.path('catalog');
                            });
                        }

                        if ($scope.currentOrder.LineItems.length == 1 && $scope.currentOrder.LineItems[0].Product.InteropID == 'xl1-order-handling-charge') {
                            $scope.cancelOrder(true);
                        }

                        $scope.displayLoadingIndicator = false;
                        $scope.actionMessage = 'Your Changes Have Been Saved';
                    },
                    function (ex) {
                        $scope.errorMessage = ex.Message.replace(/\<<Approval Page>>/g, 'Approval Page');
                        $scope.displayLoadingIndicator = false;
                    }
                );
            }
            else {
                if (confirm('Are you sure you wish to remove this item from your cart?') == true) {
                    Order.deletelineitem($scope.currentOrder.ID, item.ID,
                        function (order) {
                            $scope.currentOrder = order;
                            Order.clearshipping($scope.currentOrder);
							//numberOfItems();
                            if (!order) {
                                $scope.user.CurrentOrderID = null;
                                User.save($scope.user, function () {
                                    $location.path('catalog');
                                });
                            }

                            if ($scope.currentOrder.LineItems.length == 1 && $scope.currentOrder.LineItems[0].Product.InteropID == 'xl1-order-handling-charge') {
                                $scope.cancelOrder(true);
                            }

                            $scope.displayLoadingIndicator = false;
                            $scope.actionMessage = 'Your Changes Have Been Saved';
                        },
                        function (ex) {
                            $scope.errorMessage = ex.Message.replace(/\<<Approval Page>>/g, 'Approval Page');
                            $scope.displayLoadingIndicator = false;
                        }
                    );	
                }
            }
        }

        $scope.checkOut = function () {
            $scope.displayLoadingIndicator = true;
            if (!$scope.isEditforApproval)
                OrderConfig.address($scope.currentOrder, $scope.user);
            Order.save($scope.currentOrder,
                function (data) {
                    $scope.currentOrder = data;
                    $location.path($scope.isEditforApproval ? 'checkout/' + $routeParams.id : 'checkout');
                    $scope.displayLoadingIndicator = false;
                },
                function (ex) {
                    $scope.errorMessage = ex.Message;
                    $scope.displayLoadingIndicator = false;
                }
            );
        };

        $scope.catList = [
            'xl1-giftcards'
        ];

        $scope.integerator = function (string) {
            return parseInt(string);
        };

        $scope.catProds = [];
        $scope.prodCount = 0;
        var catIndex = 0;
        catLooper();

        function getCategories(which) {
            Product.search($scope.catList[which], null, null, function (products, count) {
                angular.forEach(products, function (product) {
                    $scope.catProds.push(product.ExternalID);
                });
                catIndex++;
                catLooper();
            }, 1, 100);
        }

        function catLooper() {
            if (catIndex < $scope.catList.length)
                getCategories(catIndex);
            else
                numberOfItems();
        }

        $scope.numberOfItems = numberOfItems;

        function numberOfItems() {
            if ($scope.currentOrder && $scope.currentOrder.LineItems) {
                $scope.prodCount = 0;
                angular.forEach($scope.currentOrder.LineItems, function (item) {
                    if ($scope.catProds.indexOf(item.Product.ExternalID) !== -1) {
                        $scope.prodCount += parseInt(item.Quantity);
                    }
                });
                $scope.updateOrderCharge();
            }
        }

        $scope.updateOrderCharge = function () {
            $scope.chargeItem = null;
            angular.forEach($scope.currentOrder.LineItems, function (item) {
                if (item.Product.InteropID == "xl1-order-handling-charge") {
                    $scope.chargeItem = item;
                }
            });
            if ($scope.prodCount > 0 && $scope.chargeItem === null) {
				$scope.displayLoadingIndicator = true;
                Product.get("xl1-order-handling-charge", function (product) {
                    $scope.chargeItem = {};
                    $scope.chargeItem.Product = product;
                    $scope.chargeItem.Quantity = 1;
                    $scope.chargeItem.PriceSchedule = $scope.chargeItem.Product.StandardPriceSchedule;
                    $scope.currentOrder.LineItems.push($scope.chargeItem);
                    Order.save($scope.currentOrder,
                        function (data) {
                            $scope.currentOrder = data;
                            $scope.displayLoadingIndicator = false;
                            $scope.actionMessage = 'Order Handling Charge Has Been Applied';
                        },
                        function (ex) {
                            $scope.errorMessage = ex.Message;
                            $scope.displayLoadingIndicator = false;
                        }
                    );
                });
            }
            if ($scope.prodCount == 0 && $scope.chargeItem) {
				$scope.displayLoadingIndicator = true;
                $scope.removeItem($scope.chargeItem, true);
            }
        };

        $scope.$watch('currentOrder.LineItems', function (newval) {
			if(!$scope.displayLoadingIndicator && catIndex == $scope.catList.length){
				numberOfItems();
			}
            var newTotal = 0;
            if (!$scope.currentOrder) return newTotal;
            angular.forEach($scope.currentOrder.LineItems, function (item) {
                if (item.IsKitParent)
                    $scope.cart.$setValidity('kitValidation', !item.KitIsInvalid);
                newTotal += item.LineTotal;
            });
            $scope.currentOrder.Subtotal = newTotal;
        }, true);

        $scope.copyAddressToAll = function () {
            angular.forEach($scope.currentOrder.LineItems, function (n) {
                n.DateNeeded = $scope.currentOrder.LineItems[0].DateNeeded;
            });
        };

        $scope.copyCostCenterToAll = function () {
            angular.forEach($scope.currentOrder.LineItems, function (n) {
                n.CostCenter = $scope.currentOrder.LineItems[0].CostCenter;
            });
        };

        $scope.onPrint = function () {
            window.print();
        };

        $scope.cancelEdit = function () {
            $location.path('order');
        };
/*
        if ($scope.currentOrder !== null) {
            numberOfItems();
        }
*/
        $scope.downloadProof = function (item) {
            window.location = item.Variant.ProofUrl;
        };

    }]);