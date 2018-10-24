angular.module('IntergalacticApp.directives').directive('search', function ($window, $document, $timeout) {
    return {
        restrict: 'C',
        template: '<button></button><div><input type="text" placeholder="Поиск, скорее всего, не работает"><div>',
        link: function (scope, element, attr) {
        }
    }
});