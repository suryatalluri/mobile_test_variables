/*global WM, Application*/

Application.$controller("GooglemapsController", ["$scope", "Utils", "$element", "NgMap", "$timeout",
    function ($scope, Utils, $element, NgMap, $timeout) {
        "use strict";
        var _locations = [],
            _icon = "",
            _lat = "",
            _lng = "",
            _info = "",
            _color,
            _radius,
            perimeter,
            mapContainer,
            defaultCenter = "current-position",
            _oldBoundLocations = -1;
        $scope.maps = $scope.directionsData = [];
        $scope.$on('mapInitialized', function(event, evtMap) {
            $scope.maps.push(evtMap);
        });

        function buildMap() {
            var lat, lng, latlng,
                len,
                latSum = 0,
                lngSum = 0,
                latNaNCount = 0,
                lngNaNCount = 0;
            if(_locations) {
                if (!_lat || !_lng) {
                    return;
                }
                $scope.markersData = _locations.map(function (marker, index) {
                    lat = Utils.findValueOf(marker, _lat);
                    lng = Utils.findValueOf(marker, _lng);
                    if(lat && lng) {
                        latlng = "[" + lat + ", " + lng + "]";
                    }
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
                        "latlng":latlng,
                        "iconData":_icon ? Utils.findValueOf(marker, _icon) : "",
                        "information":_info ? Utils.findValueOf(marker, _info) : "",
                        "id":$scope.$id + "_" + index,
                        "color": _color ? Utils.findValueOf(marker, _color) : "",
                        "radius": _radius ? Utils.findValueOf(marker, _radius) : ""
                    }
                });
                len = $scope.markersData.length;
                $scope.center = (len === latNaNCount || len === lngNaNCount) ? "[0,0]" : "[" + latSum/(len-latNaNCount) + ", " + lngSum/(len-lngNaNCount) + "]";
            } else {
                $scope.center = defaultCenter;
            }
        }

        function _buildMap() {
            if(!_lat || !_lng) {
                return;
            }
            $timeout(buildMap, 30);
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
                widgetProps.shade.options = options;
                widgetProps.radius.options = options;

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
                        "info": "",
                        "shade": "",
                        "radius": "",
                        "perimeter": ""
                    });
                    $scope.lat  = "";
                    $scope.lng  = "";
                    $scope.icon = "";
                    $scope.info = "";
                    $scope.shade = "";
                    $scope.radius = "";
                    $scope.perimeter = "";

                    _oldBoundLocations = $scope.bindlocations;
                }

                if (_oldBoundLocations === -1) {
                    _oldBoundLocations = $scope.bindlocations;
                }
            }

            _buildMap();
        }

        /* Define the property change handler. This function will be triggered when there is a change in the prefab property */
        function propertyChangeHandler(key, newVal) {
            switch (key) {
                case "locations":
                    onLocationsChange(newVal);
                    break;
                case "lat":
                    _lat = newVal;
                    _buildMap();
                    break;
                case "lng":
                    _lng = newVal;
                    _buildMap();
                    break;
                case "icon":
                    _icon = newVal;
                    _buildMap();
                    break;
                case "info":
                    _info = newVal;
                    _buildMap();
                    break;
                case "shade":
                    _color = newVal;
                    _buildMap();
                    break;
                case "radius":
                    _radius = newVal;
                    _buildMap();
                    break;
                case "zoom":
                    if (!isNaN(newVal)) {
                        $scope.zoom = newVal;
                    }
                    break;
                case "origin":
                    $scope.directionsData.origin = newVal;
                    break;
                case "destination":
                    $scope.directionsData.destination = newVal;
                    break;
                case "perimeter":
                    perimeter = newVal;
                    break;
                case "trafficlayer":
                    $scope.trafficlayer = newVal;
                    break;
            }
        }

        /* register the property change handler */
        $scope.propertyManager.add($scope.propertyManager.ACTIONS.CHANGE, propertyChangeHandler);

        function refresh() {
            $timeout(function(){
                google.maps.event.trigger($scope.maps[0], 'resize');
            }, 100);
        }
        $scope.refresh = refresh;
        $element.closest(".app-prefab").isolateScope().redraw = refresh;
    }]);