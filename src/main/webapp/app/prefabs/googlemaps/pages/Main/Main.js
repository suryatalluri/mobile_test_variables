/*global WM, Application*/

Application.$controller("GooglemapsController", ["$scope", "Utils", "$element", "$timeout",
    function ($scope, Utils, $element, $timeout) {
        "use strict";

        var _locations = [],
            _icon = "",
            _lat = "",
            _lng = "",
            _info = "",
            _center,
            defaultMarkers = [],
            mapCtrl = {},
            mapContainer,
            gMap,
            firstTime = true,
            defaultCenter = {
                "latitude": 0,
                "longitude": 0
            },
            _oldBoundLocations = -1;

        $scope.map = {
            "center": defaultCenter,
            "zoom": 5,
            "markers": defaultMarkers,
            "control": mapCtrl
        };

        function constructMarkersModel() {
            $scope.map.markers = defaultMarkers;
            var latSum = 0,
                lngSum = 0,
                latNaNCount = 0,
                lngNaNCount = 0,
                len;
            if (_locations) {
                $scope.map.markers = _locations.map(function (marker, index) {
                    var lat, lng;

                    lat = +Utils.findValueOf(marker, _lat);
                    lng = +Utils.findValueOf(marker, _lng);

                    if (isNaN(lat)) {
                        latNaNCount++;
                    } else {
                        latSum += lat;
                    }

                    if (isNaN(lng)) {
                        lngNaNCount++;
                    } else {
                        lngSum += lng;
                    }

                    return {
                        "latlng": {
                            "latitude": lat,
                            "longitude": lng
                        },
                        "icon": _icon ? Utils.findValueOf(marker, _icon) : "",
                        "info": _info ? Utils.findValueOf(marker, _info) : "",
                        "id": $scope.$id + "_" + index
                    };
                });
                if (!_center) {
                    len = $scope.map.markers.length;
                    if (len > 0 && mapCtrl.refresh) {

                        _center = {
                            "lat": (latSum / (len - latNaNCount) ),
                            "lng": (lngSum / (len - lngNaNCount) )
                        };
                        mapCtrl.refresh({
                            "latitude": _center.lat,
                            "longitude": _center.lng
                        });
                    }
                }
            }
        }

        function _constructMarkersModel() {
            if (!_lat || !_lng) {
                return;
            }

            $timeout(constructMarkersModel, 10);
        }

        function onLocationsChange(newVal) {

            var markerObj,
                widgetProps = $scope.$parent.widgetProps,
                options;

            _locations = [];

            if (WM.isArray(newVal)) {
                _locations = newVal;
            } else {
                if (WM.isObject(newVal)) {
                    if (WM.isArray(newVal.data)) {
                        _locations = newVal.data;
                    } else {
                        _locations = [newVal];
                    }
                }
            }

            if ($scope.widgetid) {

                options = [""];

                widgetProps.lat.options  = options;
                widgetProps.lng.options  = options;
                widgetProps.icon.options = options;
                widgetProps.info.options = options;

                if (_locations.length > 0) {
                    markerObj = _locations[0];

                    Utils.getAllKeysOf(markerObj).forEach(function (key) {
                        options.push(key);
                    });
                }

                if ((_oldBoundLocations !== -1) && (_oldBoundLocations !== $scope.bindlocations)) {
                    /*Remove the attributes from the markup*/
                    $scope.$root.$emit('set-markup-attr', $scope.$parent.widgetid, {
                        "lat": "",
                        "lng": "",
                        "icon": "",
                        "info": ""
                    });
                    $scope.lat  = "";
                    $scope.lng  = "";
                    $scope.icon = "";
                    $scope.info = "";

                    _oldBoundLocations = $scope.bindlocations;
                }

                if (_oldBoundLocations === -1) {
                    _oldBoundLocations = $scope.bindlocations;
                }
            }

            _constructMarkersModel();
        }

        /* Define the property change handler. This function will be triggered when there is a change in the prefab property */
        function propertyChangeHandler(key, newVal) {
            switch (key) {
            case "locations":
                onLocationsChange(newVal);
                break;
            case "lat":
                _lat = newVal;
                _constructMarkersModel();
                break;
            case "lng":
                _lng = newVal;
                _constructMarkersModel();
                break;
            case "icon":
                _icon = newVal;
                _constructMarkersModel();
                break;
            case "info":
                _info = newVal;
                _constructMarkersModel();
                break;
            case "height":
                if (newVal) {
                    newVal = parseInt(newVal, 10);
                    if (isNaN(newVal)) {
                        return;
                    }

                    if (!mapContainer && newVal) {
                        mapContainer = $element.find(".angular-google-map-container");
                    }
                    mapContainer.css("height", newVal - 10);
                }
                break;
            case "zoom":
                newVal = +newVal;
                if (!isNaN(newVal)) {
                    $scope.map.zoom = newVal;
                }

                if (firstTime) {
                    firstTime = false;
                    if (!gMap) {
                        gMap = mapCtrl.getGMap();
                    }
                    gMap.setZoom(newVal);
                }
                break;
            }
        }

        /* register the property change handler */
        $scope.propertyManager.add($scope.propertyManager.ACTIONS.CHANGE, propertyChangeHandler);

        function refresh() {
            $timeout(function () {
                if (!mapCtrl.refresh) {
                    return;
                }
                if (_center) {
                    mapCtrl.refresh({
                        "latitude": _center.lat,
                        "longitude": _center.lng
                    });
                } else {
                    mapCtrl.refresh();
                }
            }, 50, false);
        }

        $scope.refresh = refresh;
        $element.closest(".app-prefab").isolateScope().redraw = refresh;
    }]);