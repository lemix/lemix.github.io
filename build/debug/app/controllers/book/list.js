angular.module('IntergalacticApp.controllers').controller('bookListController', function($scope, $timeout, bookService) {
    $scope.books = [];
    $scope.dndOptions = {};

    /**
     * Функция обратного вызова завершения перетаскивания
     * @param {*} $newIndex новый индекс элемента в списке (куда притащили)
     * @param {*} $oldIndex старый индекс элемента в списке (откуда тащили)
     */
    $scope.onDragComplete = function($newIndex, $oldIndex) { 
        console.log($oldIndex + '>' + $newIndex);
        $timeout(function () { 
            var book = $scope.books[$oldIndex];
            $scope.books.splice($oldIndex, 1);
            $scope.books.splice($newIndex, 0, book);
        });

    };

    /**
     * Функция обратного вызова директивы-парсера книг
     * @param {*} books 
     */
    $scope.onBookParsed = function(books) { 
        $scope.books = books;
        $scope.parsed = true;
        $timeout(function() {
            $scope.dndOptions.init();
        }, 0);
    }

    $scope.onLoadMoreClick = function() {
        bookService.list().then(function(books) {
            if(books.length) {
                Array.prototype.push.apply($scope.books, books);
                $timeout(function() {
                    $scope.dndOptions.init();
                });
            }
        });
        
    }
});