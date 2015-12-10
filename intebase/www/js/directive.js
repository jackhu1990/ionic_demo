/**
 * Created by jackhu on 2015/11/30.
 */
/**
 * Created by Jackhu on 2015/8/17.
 */
angular.module('ionicApp')
    .directive('hideTabs',function($rootScope){
        return {
            restrict:'A',
            link: function(scope, element, attributes){
                scope.$on('$ionicView.beforeEnter',function(){
                    scope.$watch(attributes.hideTabs, function(value){
                        $rootScope.hideTabs = value;
                    })
                });
                scope.$on('$ionicView.beforeLeave',function(){
                    $rootScope.hideTabs = false;
                })
            }
        }
    })