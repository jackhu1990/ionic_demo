// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('ionicApp', ['ionic', 'ngSanitize', 'ngCordova'])

.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
	$ionicConfigProvider.platform.ios.tabs.style('standard'); 
	$ionicConfigProvider.platform.ios.tabs.position('bottom');
	$ionicConfigProvider.platform.android.tabs.style('standard');
	$ionicConfigProvider.platform.android.tabs.position('standard');

	$ionicConfigProvider.platform.ios.navBar.alignTitle('center'); 
	$ionicConfigProvider.platform.android.navBar.alignTitle('left');

	$ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
	$ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');        

	$ionicConfigProvider.platform.ios.views.transition('ios'); 
	$ionicConfigProvider.platform.android.views.transition('android');


  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js

  $urlRouterProvider.otherwise("/login");
  $stateProvider
    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })
    .state('alarms', {
      url: '/alarms',
      templateUrl: 'templates/alarms.html',
      controller: 'AlarmsCtrl'
    })
    .state('videos', {
      url: '/videos',
      templateUrl: 'templates/videos.html',
      controller: 'VideosCtrl'
    })
  .state('settings', {
      url: '/settings',
      templateUrl: 'templates/settings.html',
      controller: 'SettingsCtrl'
    })
    .state('systems', {
        url: '/systems',
        templateUrl: 'templates/systems.html',
        controller: 'SystemsCtrl'  
    })
    .state('systems.overview', {
        url: '/overview',
        templateUrl: 'templates/systems.overview.html',
        controller: 'SystemsOverViewCtrl'
    })
    .state('systems.ba', {
        url: '/ba',
        templateUrl: 'templates/systems.items.html',
        controller: 'SystemsBACtrl'
    })
    .state('systems.etd', {
        url: '/etd',
        templateUrl: 'templates/systems.items.html',
        controller: 'SystemsETDCtrl'
    })
    .state('systems.zm', {
        url: '/zm',
        templateUrl: 'templates/systems.items.html',
        controller: 'SystemsZMCtrl'
    })
    .state('systems.fas', {
        url: '/fas',
        templateUrl: 'templates/systems.items.html',
        controller: 'SystemsFASCtrl'
    })
    .state('systems.mj', {
        url: '/mj',
        templateUrl: 'templates/systems.items.html',
        controller: 'SystemsMJCtrl'
    })
    .state('systems.energy', {
        url: '/energy',
        templateUrl: 'templates/systems.items.html',
        controller: 'SystemsENERGYCtrl'
    })
    //子系统的设备（items）中单独某个设备的详细属性列表（items->device）
    .state('systems.device', {
        url: '/device/:device',
        templateUrl: 'templates/systems.device.sample.html',//普通设备属性列表模版
        controller: 'SystemsDeviceCtrl'
    })
    .state('systems.energydevice', {
        url: '/energydevice/:device',
        templateUrl: 'templates/systems.device.energy.html',//能源设备属性列表模版
        controller: 'SystemsDeviceCtrl'
    })
    .state('systems.zmdevice', {
        url: '/zmdevice/:device',
        templateUrl: 'templates/systems.device.zm.html',//照明设备属性列表模版
        controller: 'SystemsDeviceCtrl'
    })
    .state('systems.chart', {
        url: '/chart/:tag',
        templateUrl: 'templates/systems.chart.html',
        controller: 'SystemsChartCtrl'
    })
    ;
  // if none of the above states are matched, use this as the fallback
});
