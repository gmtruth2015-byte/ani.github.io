// =============================================
// Yanima.space — Максимально безопасная версия 2.4
// Не ломает cub и другие плагины
// =============================================

(function() {
    'use strict';

    const BASE_URL = 'https://yanima.space';

    function YanimaSafe() {
        this.name = "Yanima";
        this.version = "2.4";
    }

    YanimaSafe.prototype.init = function() {
        console.log('%c[Yanima v2.4] Загружен безопасно', 'color:#4CAF50');

        // Добавляем источник поиска (обёрнуто, чтобы не ломать другие)
        try {
            if (Lampa && Lampa.Search && typeof Lampa.Search.addSource === 'function') {
                Lampa.Search.addSource({
                    title: 'Yanima Anime',
                    search: this.doSearch.bind(this),
                    enabled: true
                });
            }
        } catch(e) {
            console.log('[Yanima] Не удалось добавить источник, но плагин работает');
        }
    };

    YanimaSafe.prototype.doSearch = function(query) {
        return new Promise((resolve) => {
            if (!query || query.length < 2) {
                resolve([]);
                return;
            }

            // Просто открываем сайт с поиском — самый стабильный способ
            const url = BASE_URL + '/search?q=' + encodeURIComponent(query);
            
            setTimeout(() => {
                try {
                    if (Lampa.Browser && typeof Lampa.Browser.open === 'function') {
                        Lampa.Browser.open(url);
                    } else {
                        window.open(url, '_blank');
                    }
                } catch(e) {}
                resolve([]);
            }, 400);
        });
    };

    // Запуск плагина
    const plugin = new YanimaSafe();

    function start() {
        plugin.init();
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') start();
        });
    }

    window.YanimaSafe = plugin;
})();
