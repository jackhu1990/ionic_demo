angular.module('ionicApp')
    .controller('LoginCtrl', ['$scope', '$ionicLoading', 'loginService', 'stateHelper', '$rootScope', '$state', function ($scope, $ionicLoading, loginService, stateHelper, $rootScope, $state) {
        $scope.title = "请登录系统";      
        $rootScope.loginData = loginService.selectLoginInfo("userInfo");
        $rootScope.goSystem = function (system, param) {
            stateHelper.changeState(system, param);
        }
        $rootScope.autoCheck = function () {
            if (!loginService.getLoginStatus()) {
                $rootScope.goSystem('login');
            }
        };
        $scope.doLogin = function (index) {
            $ionicLoading.show({ template: 'Loading...' });
            if ($rootScope.loginData) {
                if (loginService.doLogin($rootScope.loginData)) {
                    if ($rootScope.loginData.isSave) {
                        loginService.upsertLoginInfo("userInfo", $rootScope.loginData);
                    }
                    $rootScope.goSystem('alarms');
                }
            }
            $ionicLoading.hide();
        }
    }])
    .controller('AlarmsCtrl', ['$scope', '$ionicLoading', '$rootScope', '$ionicPopup','$http', function ($scope, $ionicLoading, $rootScope, $ionicPopup,$http) {
        $rootScope.autoCheck();
        $ionicLoading.show({
            template: '准备构建实时报警系统...'
        });
        $scope.title = "实时报警";
        $scope.doRefresh = function () {
            $http.get("json/alarmLogs.json").success(function (response) {
                $scope.alarmLogs = response;
                angular.forEach($scope.alarmLogs, function (item) {
                    item.$date = moment(new Date(item.almt)).format("YY/MM/DD");
                    item.$time = moment(new Date(item.almt)).format("HH:mm:ss");
                    switch (item.almprority) {
                        case 1:
                            item.$almprorityName = "普通";
                            break;
                        case 2:
                        case 3:
                            item.$almprorityName = "警告";
                            break;
                        case 4:
                            item.$almprorityName = "紧急";
                            break;
                    }
                });
            })
            .finally(function () {
                $scope.$broadcast('scroll.refreshComplete');
            });
        };
        $scope.doRefresh();
        $scope.upload = function(){
            var alertPopup = $ionicPopup.alert({
                title: '上传',
                template: "报警已上传总部"
            });
        }
        $scope.ackAlarm = function(alarmlog){
            var alertPopup = $ionicPopup.alert({
                title: '应答报警!',
                template: '成功应答报警'
            });
        }
        $scope.getDetails = function(alarmlog){
            //var alertPopup = $ionicPopup.alert({
            //    title: '报警详情!',
            //    template: JSON.stringify(alarmlog)
            //});
            $scope.$alarmlogDetails = JSON.stringify(alarmlog);
            $ionicPopup.show({
                template: '<div>{{$alarmlogDetails}}</div>',
                title: '报警详情',
                scope: $scope,
                buttons: [
                    {
                        text: '<b>处理</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            alert("处理完成");
                        }
                    },
                    {
                        text: '<b>确定</b>',
                        type: 'button-balanced'
                    }
                ]
            });
        }
        $ionicLoading.hide();
    }])
    .controller('VideosCtrl',['$scope','$rootScope','$ionicModal','$sce','$http',function($scope,$rootScope,$ionicModal,$sce, $http){
        $rootScope.autoCheck();
        $scope.title = "实时视频";
        //此地址是读取的cookie的值
        $rootScope.mediaServerIP = "124.205.5.20";
        $rootScope.mediaServerPort = "18080";
        $scope.currentCamera = [];
        $scope.doRefresh = function () {
            $http.get("json/camerasItems.json").success(function (response) {
                $scope.camerasItems = response;
            })
            .finally(function () {
                $scope.$broadcast('scroll.refreshComplete');
            });
        };
        $scope.doRefresh();
        //弹窗相关
        $ionicModal.fromTemplateUrl('templates/videos.live.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.openModal = function() {
                $scope.modal.show();
            };
            $scope.closeModal = function() {
                $scope.modal.hide();
            };
            //当我们用到模型时，清除它！
            $scope.$on('$destroy', function() {
                $scope.modal.remove();
            });
            // 当隐藏的模型时执行动作
            $scope.$on('modal.hide', function() {
                // 执行动作
            });
            // 当移动模型时执行动作
            $scope.$on('modal.removed', function() {
                // 执行动作
            });
        });

        $scope.requestFullSceen = function(element){
            // 找到支持的方法, 使用需要全屏的 element 调用
            if(element.requestFullscreen) {
                element.requestFullscreen();
            } else if(element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if(element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if(element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        }
        $scope.myfullScreen = function(){
           var liveDiv = document.getElementById("video-live");
            $scope.requestFullSceen(liveDiv);
        }

        //流媒体服务相关
        $rootScope.guid = (function(){
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = "-";

            var uuid = s.join("");
            return uuid;
        })();

        var URL = "ws://" + $rootScope.mediaServerIP+ ":" + $rootScope.mediaServerPort + "/MediaServer" +"/websocket/" + $rootScope.guid;
        $scope.webSocket =  new ReconnectingWebSocket(URL);
        $scope.webSocket.onerror = function(event) {console.log(event);};
        $scope.webSocket.onopen = function(event) {
            console.log("websocket open");

            $scope.sendMessage = function(message){
                var json = JSON.stringify(message);
                $scope.webSocket.send(json);
            };

            $scope.getInfo = function(){
                var getInfo = new Object();
                getInfo["action"] = "getInfo";
                getInfo["guid"] = $rootScope.guid;
                $scope.sendMessage(getInfo);
            };
            $scope.getInfo();

            $scope.live = function(camera){
                if(camera){
                    var live = new Object();
                    live["action"] = "live";
                    live["guid"] = $rootScope.guid;
                    live["cameraId"] = camera.cameraId;
                    live["host"] = $rootScope.mediaServerIP;
                    $scope.sendMessage(live);
                }
            };

            $scope.beartbeat = function(camera){
                if(camera){
                    var beartbeat = new Object();
                    beartbeat["action"] = "beartbeat";
                    beartbeat["guid"] = $rootScope.guid;
                    beartbeat["cameraName"] = camera.cameraName;
                    $scope.sendMessage(beartbeat);
                    console.log("定时发送心跳:" + camera["heartHeatInterval"]/2 +"MS");
                }
            };

            $scope.webSocket.onmessage = function(event) {
                console.log("订阅到数据" + event.data);
                var obj = JSON.parse(event.data);
                var action = obj["action"];
                if(action=="getInfo"){
                    $scope.cameraList = obj["cameraList"];
                    $scope.$apply();
                }
                else if(action=="live"){
                    $scope.currentCamera.mediaURL = $sce.trustAsResourceUrl(obj["hls"]);
                    $scope.$apply();
                    var liveDiv = document.getElementById("video-live");
                    liveDiv.load();
                    liveDiv.play();
                    //定时发送心跳
                    $scope.currentCamera.timer1 = setInterval(function(){
                        $scope.beartbeat(obj);
                    }, obj["heartHeatInterval"]/2);
                }
            };
            $scope.refreshVideo = function(){
                var liveDiv = document.getElementById("video-live");
                liveDiv.load();
                liveDiv.play();
            }
            $scope.startVideo = function(camera){
                $scope.currentCamera = camera;
                $scope.openModal();
                $scope.live(camera);
            }
            $scope.stopVideo = function(){
                clearInterval($scope.currentCamera.timer1);
                $scope.currentCamera=[];
                $scope.closeModal();
                var liveDiv = document.getElementById("video-live");
                liveDiv.pause();
            }

        };
    }])
    .controller('SettingsCtrl',['$scope','$rootScope','$ionicLoading','loginService','$cordovaCamera',function($scope,$rootScope,$ionicLoading,loginService,$cordovaCamera){
        $rootScope.autoCheck();
        $scope.title = "设置";
        $scope.doLogout = function() {
            $ionicLoading.show({
                template: 'Loading...'
            });
            if (loginService.doLogout()) {
                $rootScope.autoCheck();
            }
            $ionicLoading.hide();
        }
        $scope.takePhoto = function () {
            var options = {
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA,
            };

            $cordovaCamera.getPicture(options).then(function (imageURI) {
                $scope.imageSrc = imageURI;
            }, function (err) {
                // error  
            });
        }
    }])
    .controller('SystemsCtrl', ['$scope', '$rootScope','$http', function ($scope, $rootScope, $http) {
        $rootScope.autoCheck();
        $scope.title = "子系统";
    }])
    .controller('SystemsOverViewCtrl', ['$scope', '$rootScope','$http', function ($scope, $rootScope, $http) {
        $rootScope.autoCheck();
        $scope.title = "概览";
        $scope.doRefresh = function () {
            $http.get("json/systemsItems.json").success(function (response) {
                $scope.systemsItems = response;
            })
           .finally(function () {
               $scope.$broadcast('scroll.refreshComplete');
           });
        };
        $scope.doRefresh();
    }])
    .controller('SystemsBACtrl', ['$scope', '$rootScope','$http', function ($scope, $rootScope,$http) {
        $rootScope.autoCheck();
        $scope.title = "楼控";
        $scope.doRefresh = function () {
            $http.get("json/baItems.json").success(function (response) {
                $scope.devicesItems = response;
            })
           .finally(function () {
               $scope.$broadcast('scroll.refreshComplete');
           });
        };
        $scope.doRefresh();
    }])
    .controller('SystemsETDCtrl', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
        $rootScope.autoCheck();
        $scope.title = "变配电";
        $scope.doRefresh = function () {
            $http.get("json/etdItems.json").success(function (response) {
                $scope.devicesItems = response;
            })
           .finally(function () {
               $scope.$broadcast('scroll.refreshComplete');
           });
        };
        $scope.doRefresh();
    }])
    .controller('SystemsZMCtrl', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
        $rootScope.autoCheck();
        $scope.title = "照明";
        $scope.doRefresh = function () {
            $http.get("json/zmItems.json").success(function (response) {
                $scope.devicesItems = response;
            })
           .finally(function () {
               $scope.$broadcast('scroll.refreshComplete');
           });
        };
        $scope.doRefresh();
    }])
    .controller('SystemsFASCtrl', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
        $rootScope.autoCheck();
        $scope.title = "消防报警";
        $scope.doRefresh = function () {
            $http.get("json/fasItems.json").success(function (response) {
                $scope.devicesItems = response;
            })
           .finally(function () {
               $scope.$broadcast('scroll.refreshComplete');
           });
        };
        $scope.doRefresh();
    }])
    .controller('SystemsMJCtrl', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
        $rootScope.autoCheck();
        $scope.title = "门禁";
        $scope.doRefresh = function () {
            $http.get("json/mjItems.json").success(function (response) {
                $scope.devicesItems = response;
            })
           .finally(function () {
               $scope.$broadcast('scroll.refreshComplete');
           });
        };
        $scope.doRefresh();
    }])
    .controller('SystemsENERGYCtrl', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
        $rootScope.autoCheck();
        $scope.title = "能耗统计";
        $scope.doRefresh = function () {
            $http.get("json/energyItems.json").success(function (response) {
                $scope.devicesItems = response;
            })
           .finally(function () {
               $scope.$broadcast('scroll.refreshComplete');
           });
        };
        $scope.doRefresh();
    }])
    .controller('SystemsDeviceCtrl', ['$scope', 'stateHelper', '$rootScope', function ($scope, stateHelper, $rootScope) {
        $rootScope.autoCheck();
        try {
            $scope.device = stateHelper.getStateParams();
            $scope.title = $scope.device.name;
        } catch (e) {
            alert(e.name + ": " + e.message);
            console.log(e);
        }
    }])
    .controller('SystemsChartCtrl', ['$scope', 'stateHelper', '$rootScope', 'highcharts', function ($scope, stateHelper, $rootScope, highcharts) {
        $rootScope.autoCheck();
        try {
            $scope.tag = stateHelper.getStateParams();
            $scope.title = $scope.tag.name + "的图表";
        } catch (e) {
            alert(e.name + ": " + e.message);
            console.log(e);
        }
        $scope.bingtu = function (cssSelector) {
            var data = "[['Firefox',45.0],['IE',26.8],{name: 'Chrome',y: 12.8,sliced: true,selected: true},['Safari',8.5],['Opera',6.2],['Others',0.7]]";
            highcharts.bingtu(cssSelector, data);
        };
        $scope.quxiantu = function (cssSelector) {
            var data;
            highcharts.quxiantu(cssSelector, data);
        }
    }])
    ;
