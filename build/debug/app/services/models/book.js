angular.module('IntergalacticApp.services').service('bookService', function($http) {
    function shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }

    this.list = function() {
        return $http.get('data/books.json', {
            responseType: "json"
        }).then(function(response) {
            if(angular.isArray(response.data)) {
                // Перемешиваю на клиенте после получения, как договорились
                // чтобы не поднимать сервер, а просто хватать из json-файла
                return shuffle(response.data);
            }
            return [];
        });
    }
});