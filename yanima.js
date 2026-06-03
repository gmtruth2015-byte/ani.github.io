// =============================================
// Yanima.space — Стабильная версия 2.2 для Lampa
// =============================================

(function() {
    'use strict';

    const BASE_URL = 'https://yanima.space';

    function YanimaPlugin() {
        this.name = "Yanima Anime 4K";
        this.version = "2.2";
        this.author = "Grok";
    }

    YanimaPlugin.prototype.init = function() {
        // Основной источник
        Lampa.Listener.send('add_source', {
            title: 'Yanima Anime 4K',
            type: 'anime',
            source: 'yanima',
            method: this.search.bind(this)
        });

        // Настройки плагина
        Lampa.Settings.add('yanima', {
            title: 'Yanima Anime 4K',
            items: [
                { name: 'Войти в аккаунт', type: 'button', callback: () => this.showLogin() },
                { name: 'Очистить данные', type: 'button', callback: () => this.clearData() },
                { name: 'Версия', type: 'text', text: this.version }
            ]
        });

        console.log('✅ Yanima Plugin v2.2 успешно загружен');
        Lampa.Noty.show('Yanima Plugin загружен', { timeout: 2000 });
    };

    // Форма входа
    YanimaPlugin.prototype.showLogin = function() {
        Lampa.Dialog.show({
            title: 'Вход в Yanima.space',
            html: `
                <div style="padding: 15px 10px;">
                    <input id="yanima_login" type="text" placeholder="Логин или Email" 
                           style="width:100%; padding:14px; margin:8px 0; border-radius:8px; font-size:16px;">
                    <input id="yanima_password" type="password" placeholder="Пароль" 
                           style="width:100%; padding:14px; margin:8px 0; border-radius:8px; font-size:16px;">
                </div>
            `,
            buttons: [
                { name: 'Отмена', callback: () => {} },
                { name: 'Войти', callback: () => {
                    const login = document.getElementById('yanima_login').value.trim();
                    const pass = document.getElementById('yanima_password').value.trim();
                    if (login && pass) {
                        this.saveLogin(login, pass);
                    } else {
                        Lampa.Noty.show('Введите логин и пароль');
                    }
                }}
            ]
        });
    };

    YanimaPlugin.prototype.saveLogin = function(login, password) {
        localStorage.setItem('yanima_login', login);
        localStorage.setItem('yanima_password', password);
        Lampa.Noty.show('✅ Данные сохранены! (Полная авторизация позже)', { timeout: 4000 });
    };

    YanimaPlugin.prototype.clearData = function() {
        localStorage.removeItem('yanima_login');
        localStorage.removeItem('yanima_password');
        Lampa.Noty.show('Данные очищены');
    };

    // Поиск (упрощённый, чтобы не было ошибок)
    YanimaPlugin.prototype.search = function(query, page = 1) {
        return new Promise((resolve) => {
            if (!query) {
                resolve([]);
                return;
            }

            Lampa.Noty.show('Открываем Yanima...');

            // Пока открываем сайт в браузере Lampa (самый стабильный способ на данный момент)
            setTimeout(() => {
                Lampa.Browser.open(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
                resolve([]); // возвращаем пустой результат, чтобы не было ошибок
            }, 800);
        });
    };

    // Регистрация
    window.YanimaPlugin = new YanimaPlugin();
    
    if (typeof Lampa !== 'undefined' && Lampa.Plugins) {
        Lampa.Plugins.add('yanima', window.YanimaPlugin);
    }
})();
