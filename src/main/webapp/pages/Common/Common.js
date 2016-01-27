Application.$controller("CommonPageController", ['$scope',
    function ($scope) {
        "use strict";

        /* perform any action on the variables within this block(on-page-load) */
        $scope.onPageVariablesReady = function () {
            /*
             * variables can be accessed through '$scope.Variables' property here
             * e.g. to get data in a static variable named 'loggedInUser' use following script
             * $scope.Variables.loggedInUser.getData()
             */
        };
        /* perform any action on widgets within this block */
        $scope.onPageReady = function () {
            /*
             * widgets can be accessed through '$scope.Widgets' property here
             * e.g. to get value of text widget named 'username' use following script
             * '$scope.Widgets.username.datavalue'
             */
        };
    }
]);

Application.$controller("CommonLoginDialogController", ["$scope", "DialogService", "$window",
    function ($scope, DialogService, $window) {
        "use strict";
        $scope.ctrlScope = $scope;

        $scope.CommonLoginDialogError = function ($event, $isolateScope) {
            /*
             * Error message can be accessed from the property $isolateScope.loginMessage.caption
             */
        };

        $scope.CommonLoginDialogSuccess = function ($event, $isolateScope) {
            /*
             * This success handler provides a redirectUrl which is the role based url set while configuring Security service for the project.
             * The redirectUrl can be accessed as $isolateScope.redirectUrl
             * To navigate to the url use '$window' service as:
             * $window.location = $isolateScope.redirectUrl
             */
            DialogService.hideDialog("CommonLoginDialog");
        };
    }
]);