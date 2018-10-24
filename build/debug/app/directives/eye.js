angular.module('IntergalacticApp.directives').directive('eye', function ($window, $document, $timeout) {
    return {
        restrict: 'C',
        template: '<span></span>',
        link: function (scope, element, attr) {
            var eyeOffsets = { x: 0, y: 0 }, 
                eyeSize = { width: 0, height: 0 },
                apple = null,
                appleSize = { width: 0, height: 0 },
                appleMaxMargin = 0; 

            /**
             * Рандом от min до max
             * @param {*} min 
             * @param {*} max 
             */
            function randomInteger(min, max) {
                var rand = min - 0.5 + Math.random() * (max - min + 1)
                rand = Math.round(rand);
                return rand;
            }

            /**
             * Моргание по таймеру с рандомным таймаутом
             * Моргание достигается добавлением css-к ласса "blink"
             */
            function blink() { 
                $timeout(function() {
                    element.addClass('blink');
                    $timeout(function() {
                        element.removeClass('blink');
                        blink();
                    }, 2000);
                }, randomInteger(4, 8) * 1000)
            }

            
            /**
             * Определение координат элемента 
             * @param {*} el 
             * @param {*} x 
             * @param {*} y 
             */
            function getOffset(el, x, y) {
                x += Math.round(el.prop('offsetLeft'));
                y += Math.round(el.prop('offsetTop'));

                if(el.prop('offsetParent')) 
                    return getOffset(angular.element(el.prop('offsetParent')), x, y);

                return { x: x, y: y };
            }

            /**
             * Установка начальных координат, размеров, отступов
             */
            function setEyeOffsets() {
                eyeSize.width = element.prop('offsetWidth');
                eyeSize.height = element.prop('offsetHeight');
                eyeOffsets = getOffset(element, 0, 0);
                eyeOffsets.x += Math.round(eyeSize.width / 2);
                eyeOffsets.y += Math.round(eyeSize.height / 2);
                appleSize.width = apple.prop('offsetWidth');
                appleSize.height = apple.prop('offsetHeight');
                appleMaxMargin = eyeSize.width / 2 - appleSize.width / 2 - 5;
                console.log(appleSize, appleMaxMargin);
            }

            // Зрачок
            apple = element.find('span');

            // Установка координат, размеров, оступов для глаза
            setEyeOffsets();

            // Обновление координат, размеров, оступов для глаза при ресайзе
            angular.element($window).on('resize', setEyeOffsets);

            // Обновление координат, размеров, оступов для глаза при полной загрузке документа
            angular.element($window).on('load', setEyeOffsets);

            // Позиционирование зрачка при движении курсора
            $document.on('mousemove', function(event) {
                /** Положение относительно окна с учётом прокрутки по оси Х */
                var x = eyeOffsets.x - $window.pageXOffset;
                /** Положение относительно окна с учётом прокрутки по оси Y */
                var y = eyeOffsets.y - $window.pageYOffset;
                /** Положение курсора относительно видимой части окна */
                var cursorX = event.pageX - $window.pageXOffset;
                /** Положение курсора относительно видимой части окна */
                var cursorY = event.pageY - $window.pageYOffset;
                /** Смещение зрачка по оси Х */
                var distanceX = Math.round((cursorX - x) / ($window.innerWidth / 1.3) * (eyeSize.width / 2));
                /** Смещение зрачка по оси Y */
                var distanceY = Math.round((cursorY - y) / ($window.innerHeight / 1.3) * (eyeSize.height / 2));
                /** Угол */
                var angle = Math.abs(Math.atan(distanceY / distanceX));
                /** Гипотинуза (она же радиус), привет Пифагору */
                var r = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

                if(r > appleMaxMargin) {
                    // Упс, зрачок ушёл за глазницу
                    r = appleMaxMargin;
                    // Корректируем зная радиус и угол
                    distanceX = (distanceX < 0 ? -1 : 1) * r * Math.cos(angle);
                    distanceY = (distanceY < 0 ? -1 : 1) * r * Math.sin(angle);
                }

                apple.css({
                    'left': distanceX + 'px',
                    'top': distanceY + 'px'
                });
            });

            // Запуск моргания
            blink();
        }
    }
});