angular.module('IntergalacticApp.directives').directive('dragAndDrop', function ($document) {
    return {
        restrict: 'A',
        scope: {
            callback: '&dragAndDrop',
            options: '=dragAndDropOpts'
        },
        link: function (scope, element, attr) {
            var activeEl = null, 
                dragEl = null,
                label = null,
                size = { width: 0, height: 0 },
                startX = 0, 
                startY = 0, 
                newIndex = -1, 
                oldIndex = -1, 
                x = 0, 
                y = 0,
                rects = [];

            /**
             * Инициализация (заполнить массив rects координатами центров блоков)
             */
            function init() {
                var items = element.find('article');

                rects = [];
                angular.forEach(items, function (item, index, obj) {
                    var el = obj.eq(index),
                    offsets = getOffset(el, 0, 0),
                        x1 = offsets.x,
                        x2 = x1 + el.prop('offsetWidth'),
                        y1 = offsets.y,
                        y2 = y1 + el.prop('offsetHeight')

                    rects.push({
                        x: Math.round(x1 + (x2 - x1) / 2),
                        y: Math.round(y1 + (y2 - y1) / 2),
                    });
                });
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
             * Находит индекс блока с которым есть максимальное пересечение
             * @param {Number} x X-координата левого верхнего угла перетаскиваемого блока
             * @param {Number} y Y-координата левого верхнего угла перетаскиваемого блока
             * @returns {Number} индекс блока с наибольшим перекрытием или -1
             */
            function overlap(x, y) {
                var index = -1,
                    centerX = Math.round(x + size.width / 2),
                    centerY = Math.round(y + size.height / 2), 
                    prevR = 0;

                for (var i = 0; i < rects.length; i++) {
                    var offsetX = rects[i].x - centerX, // Вертикальный катет
                        offsetY = rects[i].y - centerY, // Горизонтальный катет
                        r = Math.sqrt(offsetX * offsetX + offsetY * offsetY); // Гипотинуза - длина соединяющей линии центров блоков

                    if (r < prevR || prevR == 0) {
                        index = i;
                        prevR = r;
                        if (r < size.width / 2) break;
                    }
                }

                return index;
            }

            /**
             * Обработчик движения мыши
             * @param {*} event 
             */
            function mousemove(event) {
                y = event.pageY - startY;
                x = event.pageX - startX;

                dragEl.css({
                    top: y + 'px',
                    left: x + 'px'
                });

                if (oldIndex == -1) {
                    oldIndex = overlap(x, y);
                    newIndex = oldIndex;
                } else {
                    newIndex = overlap(x, y);
                }

                if(newIndex >= 0) {
                    label.css({
                        display: 'block',
                        left: Math.round(rects[newIndex].x - size.width / 2) + 'px',
                        top: Math.round(rects[newIndex].y - size.height / 2) + 'px',
                    });
                }
            }

            /**
             * Обработчик завершения перетаскивания
             */
            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);

                if (newIndex > -1 && newIndex != oldIndex) {
                    scope.callback({ $newIndex: newIndex, $oldIndex: oldIndex });
                }

                oldIndex = -1;
                newIndex = -1;

                activeEl.css({
                    opacity: '',
                    visibility: 'visible'
                });

                dragEl.remove();
                label.css('display', 'none');
            }

            /**
             * Обработчик начала перетаскивания
             * @param {*} event 
             */
            function mousedown(event) {
                var left, top;
                event.preventDefault();
                activeEl = closest(angular.element(event.target), 'item');
                dragEl = activeEl.clone();
                left = activeEl.prop('offsetLeft');
                top = activeEl.prop('offsetTop');
                size.width = activeEl.prop('offsetWidth');
                size.height = activeEl.prop('offsetHeight');

                /** Абсолютные координаты блока */
                var absCoords = getOffset(activeEl, 0, 0);

                startX = event.pageX - absCoords.x;
                startY = event.pageY - absCoords.y;

                activeEl.css({
                    opacity: 0,
                    visibility: 'hidden'
                });

                dragEl.css({
                    position: 'absolute',
                    left: left + 'px',
                    top: top + 'px',
                    width: size.width + 'px'
                });

                dragEl.addClass('dragged');

                element.append(dragEl);
                startX = event.pageX - left;
                startY = event.pageY - top;

                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            }

            /**
             * Поиск родителя по css-классу
             * @param {*} el 
             * @param {*} className 
             */
            function closest(el, className) {
                if (el[0].nodeName == "HTML") {
                    return null;
                } else if (el.hasClass(className)) {
                    return el;
                } else {
                    return closest(el.parent(), className);
                }
            }

            // RUN
            label = angular.element(document.createElement('span'));
            label.addClass('drag-target-label');
            label.css('display', 'none');
            element.append(label);
            element.on('mousedown', mousedown);

            init();

            angular.extend(scope.options, {
                init: function () {
                    init();
                }
            });
        }
    };
});
angular.module('IntergalacticApp.directives').directive('parseBooks', function ($parse, $timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            var expressionHandler = $parse(attr.parseBooks);
            var elements = element.find('article');
            var data = [];
            angular.forEach(elements, function (item, index, obj) {
                var el = obj.eq(index),
                    label = el.find('div').eq(1).html(),
                    imgSrc = el.find('img').eq(0).attr('src');
                data.push({
                    label: label,
                    src: imgSrc,
                    class: el.prop('className')
                });
            });

            $timeout(function () {
                console.log(888)
                expressionHandler(scope, { $data: data });
            }, 0);
        }
    }
});