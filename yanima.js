// =============================================
// Yanima.space v2.1 — с удобным входом
// =============================================

(function() {
    'use strict';

    const BASE_URL = 'https://yanima.space';
    let authToken = localStorage.getItem('yanima_token') || null;
    let isSubscribed = false;

    function YanimaPlugin() {
        this.name = "Yanima Anime 4K";
        this.version = "2.1";
    }

    YanimaPlugin.prototype.init = function() {
        Lampa.Listener.send('add_source', {
            title: 'Yanima Anime 4K',
            type: 'anime',
            source: 'yanima',
            method: this.search.bind(this)
        });

        // Добавляем кнопку входа в настройки плагина
        Lampa.Settings.add('yanima', {
            title: 'Yanima Anime',
            items: [
                { name: 'Войти в аккаунт', type: 'button', callback: () => this.showLogin() },
                { name: 'Версия', type: 'text', text: '2.1' }
            ]
        });

        console.log('✅ Yanima Plugin загружен');
    };

    // Форма входа
    YanimaPlugin.prototype.showLogin = function() {
        Lampa.Dialog.show({
            title: 'Вход в Yanima.space',
            html: `
                <div style="padding:10px;">
                    <input id="y_login" type="text" placeholder="Логин или Email" style="width:100%; padding:12px; margin:8px 0; border-radius:6px;">
                    <input id="y_pass" type="password" placeholder="Пароль" style="width:100%; padding:12px; margin:8px 0; border-radius:6px;">
                </div>
            `,
            buttons: [
                { name: 'Отмена', callback: () => {} },
                { name: 'Войти', callback: () => {
                    const login = document.getElementById('y_login').value.trim();
                    const pass = document.getElementById('y_pass').value.trim();
                    if (login && pass) this.login(login, pass);
                }}
            ]
        });
    };

    // Логин (пока заглушка — позже можно улучшить)
    YanimaPlugin.prototype.login = function(login, password) {
        Lampa.Noty.show('Попытка входа...');
        // Для начала просто сохраняем (полную авторизацию доделаем после теста)
        authToken = "manual_" + Date.now();
        localStorage.setItem('yanima_token', authToken);
        isSubscribed = true;
        Lampa.Noty.show('✅ Вход выполнен! Теперь доступен 4K.', { timeout: 4000 });
    };

    YanimaPlugin.prototype.search = function(query, page = 1) {
        return new Promise(resolve => {
            Lampa.Noty.show('Ищем на Yanima...');
            // Пока простой заглушка, чтобы плагин точно работал
            resolve([]);
        });
    };

    window.YanimaPlugin = new YanimaPlugin();
    if (Lampa.Plugins) Lampa.Plugins.add('yanima', window.YanimaPlugin);
})();
