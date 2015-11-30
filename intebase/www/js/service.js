/**
 * Created by Jackhu on 2015/8/17.
 */
angular.module('ionicApp')
.factory('loginService', ['$rootScope', '$ionicPopup', '$window', function ($rootScope, $ionicPopup, $window) {
    return{
        doLogin: function (someone) {
            if (someone.username == "b" && someone.password == "b") {
                    $rootScope.loginSuccess = true;
                    return true;
            }
            else{
                var alertPopup = $ionicPopup.alert({
                    title: '帐号或密码错误!',
                    template: '请核实你的帐号密码重新输入'
                });
                alertPopup.then(function(res) {
                    console.log('密码输入错误');
                });
                return false;
            }
        },
        doLogout: function(){
            $rootScope.loginSuccess = false;
            return true;
        },
        getLoginStatus: function() {
            return $rootScope.loginSuccess;
        },
        selectLoginInfo: function (key) {
            return JSON.parse($window.localStorage[key] || '{}');
        },
        upsertLoginInfo: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        }
    }
}])
.factory('highcharts',['$rootScope',function($rootScope){
    return {
        bingtu : function(cssSelector,myData){
            $(cssSelector).highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                },
                title: {
                    text: 'Browser market shares at a specific website, 2010'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            color: '#000000',
                            connectorColor: '#000000',
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                        }
                    }
                },
                series: [{
                    type: 'pie',
                    name: 'Browser share',
                    data: [
                        ['Firefox',   45.0],
                        ['IE',       26.8],
                        {
                            name: 'Chrome',
                            y: 12.8,
                            sliced: true,
                            selected: true
                        },
                        ['Safari',    8.5],
                        ['Opera',     6.2],
                        ['Others',   0.7]
                    ]
                }]
            });
        },
        quxiantu : function(cssSelector){
            $(cssSelector).highcharts({
                title: {
                    text: 'Monthly Average Temperature',
                    x: -20 //center
                },
                subtitle: {
                    text: 'Source: WorldClimate.com',
                    x: -20
                },
                xAxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                },
                yAxis: {
                    title: {
                        text: 'Temperature (°C)'
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                tooltip: {
                    valueSuffix: '°C'
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    borderWidth: 0
                },
                series: [{
                    name: 'Tokyo',
                    data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
                }, {
                    name: 'New York',
                    data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
                }, {
                    name: 'Berlin',
                    data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
                }, {
                    name: 'London',
                    data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
                }]
            });
        }
    }
}])
.factory('stateHelper',['$rootScope','$state',function($rootScope,$state){
        return{
            changeState: function(state, pData){
                $rootScope.stateHelperParams = pData;
                $state.go(state);
            },
            getStateParams: function(){
                return $rootScope.stateHelperParams;
            }
        }
}])
