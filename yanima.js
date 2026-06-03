(function () {
    'use strict';

    /**
     * Yanima Anime — плагин для Lampa
     * Версия: 1.0.0
     * 
     * Позволяет искать и смотреть аниме с yanima.space
     * через встроенный браузер Lampa.
     */

    var PLUGIN_NAME  = 'yanima_anime';
    var PLUGIN_TITLE = 'Yanima Anime';
    var PLUGIN_VER   = '1.0.0';
    var BASE_URL     = 'https://yanima.space';

    // ========== Утилиты ==========

    /**
     * Безопасный логгер — не падает, если console недоступен
     */
    function log(msg) {
        try {
            console.log('[' + PLUGIN_TITLE + '] ' + msg);
        } catch (e) {
            // тихо
        }
    }

    /**
     * Проверяет, не был ли плагин уже инициализирован
     * (защита от дублирования при повторном подключении)
     */
    function isAlreadyLoaded() {
        try {
            return window.__yanima_anime_loaded === true;
        } catch (e) {
            return false;
        }
    }

    function markAsLoaded() {
        try {
            window.__yanima_anime_loaded = true;
        } catch (e) {
            // тихо
        }
    }

    // ========== Настройки ==========

    /**
     * Получить значение настройки
     */
    function getSetting(key, fallback) {
        try {
            var val = Lampa.Storage.get(PLUGIN_NAME + '_' + key, '');
            return val || fallback || '';
        } catch (e) {
            return fallback || '';
        }
    }

    /**
     * Регистрация блока настроек плагина в меню Lampa
     */
    function addSettings() {
        try {
            // Проверяем, не были ли настройки уже добавлены
            if (Lampa.Settings && Lampa.Settings.main) {
                // Добавляем кнопку в главное меню настроек
                var field_button = $('<div class="settings-folder" data-component="' + PLUGIN_NAME + '">\
                    <div class="settings-folder__icon">\
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">\
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>\
                        </svg>\
                    </div>\
                    <div class="settings-folder__name">' + PLUGIN_TITLE + '</div>\
                </div>');

                // Вставляем после последнего элемента основных настроек
                if ($('[data-component="' + PLUGIN_NAME + '"]').length === 0) {
                    field_button.insertAfter('.settings [data-component="more"]');
                    if (field_button.parent().length === 0) {
                        // Fallback: вставляем в конец
                        Lampa.Settings.main().find('.settings-content').append(field_button);
                    }
                }
            }

            // Параметры настроек
            var params = {
                component: PLUGIN_NAME,
                name: PLUGIN_TITLE,
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
            };

            // Добавляем поля настроек
            Lampa.SettingsApi.addParam({
                component: PLUGIN_NAME,
                param: {
                    name: PLUGIN_NAME + '_login',
                    type: 'input',
                    placeholder: 'Email или логин',
                    values: '',
                    default: ''
                },
                field: {
                    name: 'Логин Yanima',
                    description: 'Ваш логин на yanima.space (для доступа к 4K контенту)'
                }
            });

            Lampa.SettingsApi.addParam({
                component: PLUGIN_NAME,
                param: {
                    name: PLUGIN_NAME + '_password',
                    type: 'input',
                    placeholder: 'Пароль',
                    values: '',
                    default: ''
                },
                field: {
                    name: 'Пароль Yanima',
                    description: 'Ваш пароль на yanima.space'
                }
            });

            Lampa.SettingsApi.addParam({
                component: PLUGIN_NAME,
                param: {
                    name: PLUGIN_NAME + '_quality',
                    type: 'select',
                    values: {
                        auto: 'Авто',
                        '1080': '1080p',
                        '4k':   '4K (нужна подписка)'
                    },
                    default: 'auto'
                },
                field: {
                    name: 'Качество видео',
                    description: 'Предпочитаемое качество воспроизведения'
                }
            });

            log('Настройки зарегистрированы');
        } catch (e) {
            log('Ошибка при добавлении настроек: ' + e.message);
        }
    }

    // ========== Компонент поиска ==========

    /**
     * Открыть yanima.space с поисковым запросом
     */
    function openSearch(query) {
        try {
            if (!query) {
                Lampa.Noty.show('Введите поисковый запрос');
                return;
            }

            var searchUrl = BASE_URL + '/search?q=' + encodeURIComponent(query);

            log('Открываю поиск: ' + searchUrl);

            // Пробуем разные способы открыть браузер в Lampa
            if (typeof Lampa.Browser !== 'undefined' && Lampa.Browser.open) {
                Lampa.Browser.open(searchUrl);
            } else if (typeof Lampa.Utils !== 'undefined' && Lampa.Utils.openURL) {
                Lampa.Utils.openURL(searchUrl);
            } else {
                // Fallback — открытие через Android intent или системный браузер
                window.open(searchUrl, '_blank');
            }
        } catch (e) {
            log('Ошибка открытия поиска: ' + e.message);
            try {
                Lampa.Noty.show('Не удалось открыть Yanima: ' + e.message);
            } catch (e2) {
                // тихо
            }
        }
    }

    /**
     * Открыть главную страницу yanima.space
     */
    function openMain() {
        try {
            log('Открываю главную: ' + BASE_URL);
            if (typeof Lampa.Browser !== 'undefined' && Lampa.Browser.open) {
                Lampa.Browser.open(BASE_URL);
            } else if (typeof Lampa.Utils !== 'undefined' && Lampa.Utils.openURL) {
                Lampa.Utils.openURL(BASE_URL);
            } else {
                window.open(BASE_URL, '_blank');
            }
        } catch (e) {
            log('Ошибка открытия главной: ' + e.message);
        }
    }

    // ========== Регистрация источника ==========

    /**
     * Регистрация компонента-источника «Yanima Anime»
     * в поисковой системе Lampa
     */
    function registerSource() {
        try {
            // Создаём компонент-источник
            var YanimaSource = function (object) {
                var network = new Lampa.Reguest();
                var _this    = this;

                this.create = function () {
                    // Компонент создан
                };

                /**
                 * Поиск — открывает yanima.space в браузере
                 */
                this.search = function (query, page) {
                    try {
                        // Показываем уведомление и открываем в браузере
                        Lampa.Noty.show('Yanima: открываю поиск «' + query + '»');
                        openSearch(query);

                        // Сообщаем Lampa, что результатов из парсинга нет
                        // (мы открыли в браузере)
                        if (_this.onEmpty) _this.onEmpty();
                    } catch (e) {
                        log('Ошибка в search: ' + e.message);
                        if (_this.onEmpty) _this.onEmpty();
                    }
                };

                this.extendChoice = function (resolved) {
                    // Нет расширенных результатов
                };

                this.reset = function () {
                    try {
                        network.clear();
                    } catch (e) {
                        // тихо
                    }
                };

                this.destroy = function () {
                    try {
                        network.clear();
                        network = null;
                    } catch (e) {
                        // тихо
                    }
                };
            };

            // Регистрируем источник в Lampa
            if (Lampa.Api && Lampa.Api.sources) {
                // Проверяем, не зарегистрирован ли уже
                if (!Lampa.Api.sources[PLUGIN_NAME]) {
                    Lampa.Api.sources[PLUGIN_NAME] = YanimaSource;
                    log('Источник зарегистрирован в Api.sources');
                } else {
                    log('Источник уже зарегистрирован, пропускаю');
                }
            }

            // Альтернативный способ регистрации через Manifest
            try {
                if (Lampa.Manifest && Lampa.Manifest.plugins) {
                    var found = false;
                    Lampa.Manifest.plugins.forEach(function (p) {
                        if (p.name === PLUGIN_NAME || p.component === PLUGIN_NAME) found = true;
                    });
                    if (!found) {
                        log('Manifest-регистрация не требуется (используем Api.sources)');
                    }
                }
            } catch (e) {
                // Manifest может быть недоступен — это нормально
            }

            log('Источник «' + PLUGIN_TITLE + '» зарегистрирован');
        } catch (e) {
            log('Ошибка регистрации источника: ' + e.message);
        }
    }

    // ========== Добавление кнопки в меню ==========

    /**
     * Добавляет кнопку «Yanima Anime» в меню Lampa
     */
    function addMenuButton() {
        try {
            var ico = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9.5 7.5l7 4.5-7 4.5v-9z"/></svg>';

            // Добавляем кнопку в боковое меню
            var menuItem = $('<li class="menu__item selector" data-action="' + PLUGIN_NAME + '">\
                <div class="menu__ico">' + ico + '</div>\
                <div class="menu__text">' + PLUGIN_TITLE + '</div>\
            </li>');

            // Проверяем, что кнопка ещё не добавлена
            if ($('.menu__item[data-action="' + PLUGIN_NAME + '"]').length === 0) {
                // Вставляем после кнопки «Избранное» или в конец меню
                var menu = $('.menu .menu__list');
                if (menu.length) {
                    menu.append(menuItem);
                }

                // Обработчик нажатия
                menuItem.on('hover:enter', function () {
                    openMain();
                });
            }

            log('Кнопка меню добавлена');
        } catch (e) {
            log('Ошибка добавления кнопки меню: ' + e.message);
        }
    }

    // ========== Главная функция запуска ==========

    function startPlugin() {
        // Защита от повторной инициализации
        if (isAlreadyLoaded()) {
            log('Плагин уже загружен, повторная инициализация отменена');
            return;
        }

        try {
            log('Инициализация v' + PLUGIN_VER + '...');

            // 1. Регистрируем настройки
            addSettings();

            // 2. Регистрируем источник поиска
            registerSource();

            // 3. Добавляем кнопку в меню
            addMenuButton();

            // 4. Отмечаем плагин как загруженный
            markAsLoaded();

            log('Плагин успешно инициализирован (v' + PLUGIN_VER + ')');

            // Тихое уведомление при первом запуске
            try {
                if (!Lampa.Storage.get(PLUGIN_NAME + '_welcomed', false)) {
                    Lampa.Noty.show(PLUGIN_TITLE + ' подключён');
                    Lampa.Storage.set(PLUGIN_NAME + '_welcomed', true);
                }
            } catch (e) {
                // тихо
            }

        } catch (e) {
            log('КРИТИЧЕСКАЯ ОШИБКА инициализации: ' + e.message);
            // Не пробрасываем ошибку дальше, чтобы не ломать другие плагины
        }
    }

    // ========== Точка входа (стандартный паттерн Lampa) ==========

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }

})();
