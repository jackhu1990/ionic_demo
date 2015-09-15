angular.module('ionicApp')
    .controller('LoginCtrl',['$scope','$ionicLoading','loginService',function($scope,$ionicLoading,loginService){
        $scope.title = "请登录系统";
        $scope.loginData = {};
        $scope.doLogin = function() {
            $ionicLoading.show({
                template: 'Loading...'
            });
            loginService.doLogin($scope.loginData);
            $ionicLoading.hide();
        }
    }])
    .controller('AlarmsCtrl',['$scope','$http','$ionicLoading','loginService','$ionicPopup','highcharts',function($scope, $http, $ionicLoading,loginService,$ionicPopup,highcharts){
        loginService.autoCheck();
        $ionicLoading.show({
            template: '准备构建实时报警系统...'
        });
        $scope.title = "实时报警";
        $scope.upload = function(){
            var alertPopup = $ionicPopup.alert({
                title: '上传',
                template: "报警已上传总部"
            });
        }
        //restful api
        //$scope.alarmLogs = $resource("json/alarmLogs.json").query();
        $http.get("json/alarmLogs.json").success(function(response) {
            $scope.alarmLogs = response;
            angular.forEach( $scope.alarmLogs,function(item){
                item.$date = moment(item.almt).format("YY/MM/DD");
                item.$time = moment(item.almt).format("HH:mm:ss");
                switch(item.almprority){
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
        });
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
    .controller('VideosCtrl',['$scope','$rootScope','loginService','$ionicModal','$sce','$http',function($scope,$rootScope,loginService,$ionicModal,$sce,$http){
        loginService.autoCheck();
        $scope.title = "实时视频";
        //此地址是读取的cookie的值
        $rootScope.mediaServerIP = "124.205.5.20";
        $rootScope.mediaServerPort = "18080";
        $scope.currentCamera = [];
        $http.get("json/camerasItems.json").success(function(response) {
            $scope.camerasItems = response;
        });
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
    .controller('SettingsCtrl',['$scope','$rootScope','$ionicLoading','loginService',function($scope,$rootScope,$ionicLoading,loginService){
        loginService.autoCheck();
        $scope.title = "设置";
        $scope.doLogout = function() {
            $ionicLoading.show({
                template: 'Loading...'
            });
            loginService.doLogout();
            $ionicLoading.hide();
        }
    }])
    .controller('SystemsCtrl',['$scope','$http', 'loginService','$rootScope','stateHelper',function($scope, $http,loginService,$rootScope,stateHelper){
        loginService.autoCheck();
        $scope.title = "子系统";
        $http.get("json/systemsItems.json").success(function(response) {
            $scope.systemsItems = response;
        });
        $rootScope.goSystem = function(system,param){
            stateHelper.changeState(system,param);
        }
        $rootScope.goSystem('systems.overview');
    }])
    .controller('SystemsDeviceCtrl',['$scope','stateHelper','loginService',function($scope,stateHelper,loginService){
        loginService.autoCheck();
        try{
            $scope.device = stateHelper.getStateParams();
            $scope.title = $scope.device.name;
        }catch(e){
            alert(e.name + ": " + e.message);
            console.log(e);
        }
    }])
    .controller('SystemsChartsCtrl',['$scope','stateHelper','loginService','highcharts',function($scope,stateHelper,loginService,highcharts){
        loginService.autoCheck();
        try{
            $scope.tag = stateHelper.getStateParams();
            $scope.title = $scope.tag.name + "的图表";
        }catch(e){
            alert(e.name + ": " + e.message);
            console.log(e);
        }
        $scope.bingtu = function(cssSelector){
            var data ="[['Firefox',45.0],['IE',26.8],{name: 'Chrome',y: 12.8,sliced: true,selected: true},['Safari',8.5],['Opera',6.2],['Others',0.7]]";
            highcharts.bingtu(cssSelector,data);
        };
        $scope.quxiantu = function(cssSelector){
            var data;
            highcharts.quxiantu(cssSelector,data);
        }
    }])
    .controller('SystemsOverViewCtrl',['$scope','loginService',function($scope,loginService){
        loginService.autoCheck();
        $scope.title = "概览";
    }])
    .controller('SystemsBACtrl',['$scope','loginService','$http',function($scope,loginService,$http){
        loginService.autoCheck();
        $scope.title = "楼控";
        $http.get("json/baDevices.json").success(function(response) {
            $scope.devicesItems = response;
        });
    }])
    .controller('SystemsETDCtrl',['$scope','loginService','$http',function($scope,loginService,$http){
        loginService.autoCheck();
        $scope.title = "变配电";
        $http.get("json/etdDevices.json").success(function(response) {
            $scope.devicesItems = response;
        });
    }])
    .controller('SystemsZMCtrl',['$scope','loginService','$http',function($scope,loginService,$http){
        loginService.autoCheck();
        $scope.title = "照明";
        $http.get("json/zmDevices.json").success(function(response) {
            $scope.devicesItems = response;
        });
    }])
    .controller('SystemsFASCtrl',['$scope','loginService','$http',function($scope,loginService,$http){
        loginService.autoCheck();
        $scope.title = "消防报警";
        $http.get("json/fasDevices.json").success(function(response) {
            $scope.devicesItems = response;
        });
    }])
    .controller('SystemsMJCtrl',['$scope','loginService','$http',function($scope,loginService,$http){
        loginService.autoCheck();
        $scope.title = "门禁";
        $http.get("json/mjDevices.json").success(function(response) {
            $scope.devicesItems = response;
        });
    }])
    .controller('SystemsENERGYCtrl',['$scope','loginService','$http',function($scope,loginService,$http){
        loginService.autoCheck();
        $scope.title = "能耗统计";
        $http.get("json/energyDevices.json").success(function(response) {
            $scope.devicesItems = response;
        });
    }])
