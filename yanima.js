// =============================================
// Yanima.space Plugin v2.3 — Чистая версия
// Не ломает другие плагины
// =============================================

(function() {
    'use strict';

    const BASE_URL = 'https://yanima.space';

    function Yanima() {
        this.name = "Yanima Anime";
        this.version = "2.3";
    }

    Yanima.prototype.init = function() {
        // Добавляем источник поиска
        if (Lampa && Lampa.Search && Lampa.Search.addSource) {
            Lampa.Search.addSource({
                title: 'Yanima Anime 4K',
                search: this.search.bind(this),
                enabled: true
            });
        }

        // Добавляем кнопку в настройки (без конфликтов)
        if (Lampa && Lampa.Settings && typeof Lampa.Settings.add === 'function') {
            try {
                Lampa.Settings.add('yanima_button', {
                    title: 'Yanima Anime 4K',
                    items: [
                        {
                            name: 'Открыть Yanima',
                            type: 'button',
                            callback: () => {
                                if (Lampa.Browser && Lampa.Browser.open) {
                                    Lampa.Browser.open(BASE_URL);
                                } else {
                                    window.open(BASE_URL, '_blank');
                                }
                            }
                        },
                        {
                            name: 'Войти в аккаунт (сохранение)',
                            type: 'button',
                            callback: () => this.showLogin()
                        }
                    ]
                });
            } catch(e) {
                console.log('Yanima: Settings.add не сработал, но плагин работает');
            }
        }

        console.log('%c[Yanima] Плагин v2.3 загружен успешно', 'color:#4CAF50');
    };

    Yanima.prototype.search = function(query) {
        return new Promise((resolve) => {
            if (!query) {
                resolve([]);
                return;
            }

            // Открываем сайт с поиском (самый стабильный способ сейчас)
            const searchUrl = BASE_URL + '/search?q=' + encodeURIComponent(query);
            
            setTimeout(() => {
                if (Lampa.Browser && Lampa.Browser.open) {
                    Lampa.Browser.open(searchUrl);
                } else {
                    window.open(searchUrl, '_blank');
                }
                resolve([]);
            }, 300);
        });
    };

    Yanima.prototype.showLogin = function() {
        Lampa.Dialog.show({
            title: 'Yanima — Вход',
            html: `
                <div style="padding:15px 10px; text-align:left;">
                    <input id="y_login" type="text" placeholder="Логин / Email" 
                           style="width:100%; padding:12px; margin:6px 0; border-radius:6px; font-size:16px; box-sizing:border-box;">
                    <input id="y_pass" type="password" placeholder="Пароль" 
                           style="width:100%; padding:12px; margin:6px 0; border-radius:6px; font-size:16px; box-sizing:border-box;">
                    <p style="font-size:12px; color:#888; margin-top:10px;">Данные сохраняются локально</p>
                </div>
            `,
            buttons: [
                { name: 'Отмена', callback: () => {} },
                { name: 'Сохранить', callback: () => {
                    const login = document.getElementById('y_login').value.trim();
                    const pass = document.getElementById('y_pass').value.trim();
                    if (login && pass) {
                        localStorage.setItem('yanima_login', login);
                        localStorage.setItem('yanima_pass', pass);
                        Lampa.Noty.show('✅ Данные сохранены');
                    } else {
                        Lampa.Noty.show('Введите логин и пароль');
                    }
                }}
            ]
        });
    };

    // Запуск
    const plugin = new Yanima();

    if (window.appready) {
        plugin.init();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') plugin.init();
        });
    }

    // Делаем доступным глобально (для отладки)
    window.YanimaPlugin = plugin;
})();
