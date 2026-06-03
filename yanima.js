(function () {
    'use strict';

    const BASE_URL = 'https://yanima.space';

    function startPlugin() {
        console.log('%c[Yanima v2.5] Plugin started safely', 'color:#4CAF50');

        // Пытаемся добавить источник поиска (всё в try/catch)
        try {
            if (typeof Lampa !== 'undefined' && 
                Lampa.Search && 
                typeof Lampa.Search.addSource === 'function') {
                
                Lampa.Search.addSource({
                    title: 'Yanima Anime',
                    search: function(query) {
                        return new Promise(function(resolve) {
                            if (!query || query.length < 2) {
                                resolve([]);
                                return;
                            }
                            var url = BASE_URL + '/search?q=' + encodeURIComponent(query);
                            setTimeout(function() {
                                try {
                                    if (Lampa.Browser && typeof Lampa.Browser.open === 'function') {
                                        Lampa.Browser.open(url);
                                    } else {
                                        window.open(url, '_blank');
                                    }
                                } catch(e) {}
                                resolve([]);
                            }, 300);
                        });
                    },
                    enabled: true
                });
            }
        } catch(e) {
            console.log('[Yanima] Search source registration skipped');
        }
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type == 'ready') startPlugin();
        });
    }
})();
