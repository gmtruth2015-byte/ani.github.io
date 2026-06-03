// =============================================
// Yanima.space FULL PLUGIN для Lampa
// Версия: 2.0 • С авторизацией + 4K + категории
// =============================================

(function() {
    'use strict';

    const BASE_URL = 'https://yanima.space';
    let authToken = null;
    let isSubscribed = false;
    const CACHE_KEY = 'yanima_cache';

    function YanimaPlugin() {
        this.name = "Yanima Anime 4K";
        this.version = "2.0";
        this.author = "Grok";
    }

    YanimaPlugin.prototype.init = function() {
        // Добавляем источник поиска
        Lampa.Listener.send('add_source', {
            title: 'Yanima Anime 4K',
            type: 'anime',
            source: 'yanima',
            method: this.search.bind(this)
        });

        // Добавляем в меню категории
        this.addMenu();

        Lampa.Plugins.add('yanima', this);
        this.checkAuth();
    };

    // Авторизация
    YanimaPlugin.prototype.login = function(login, password) {
        return fetch(`${BASE_URL}/api/auth/login`, {  // предположительный эндпоинт, подправь если другой
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, password })
        })
        .then(r => r.json())
        .then(data => {
            if (data.token) {
                authToken = data.token;
                localStorage.setItem('yanima_token', data.token);
                this.checkSubscription();
                Lampa.Noty.show('Успешный вход в Yanima!');
                return true;
            }
            return false;
        })
        .catch(() => false);
    };

    YanimaPlugin.prototype.checkAuth = function() {
        authToken = localStorage.getItem('yanima_token');
        if (authToken) this.checkSubscription();
    };

    YanimaPlugin.prototype.checkSubscription = function() {
        // Проверка подписки (адаптируй под реальный запрос)
        fetch(`${BASE_URL}/api/user/subscription`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(r => r.json())
        .then(data => { isSubscribed = data.active || false; });
    };

    // Меню категорий
    YanimaPlugin.prototype.addMenu = function() {
        Lampa.Listener.send('add_menu', {
            title: 'Yanima',
            items: [
                { title: 'Поиск', search: true },
                { title: 'Новинки', action: () => this.browse('new') },
                { title: 'Топ', action: () => this.browse('top') },
                { title: 'Жанры', action: () => this.genres() },
                { title: 'Мой аккаунт', action: () => this.showLogin() }
            ]
        });
    };

    // Поиск
    YanimaPlugin.prototype.search = function(query, page = 1) {
        return this.browse('search', query, page);
    };

    // Общий браузер (новинки, топ, поиск)
    YanimaPlugin.prototype.browse = function(type, query = '', page = 1) {
        return new Promise(resolve => {
            let url = `${BASE_URL}/`;
            if (type === 'search') url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&page=${page}`;
            else if (type === 'new') url = `${BASE_URL}/new`;
            else if (type === 'top') url = `${BASE_URL}/top`;

            fetch(url, { headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} })
                .then(r => r.text())
                .then(html => {
                    const results = this.parseCards(html);
                    resolve(results);
                })
                .catch(() => resolve([]));
        });
    };

    // Парсинг карточек (самое важное место — обнови селекторы по необходимости)
    YanimaPlugin.prototype.parseCards = function(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const cards = doc.querySelectorAll('.card, .anime-card, .item, .poster-card, [class*="card"]');

        return Array.from(cards).map(card => {
            const link = card.querySelector('a');
            const img = card.querySelector('img');
            const title = card.querySelector('h3, h4, .title, .name, .anime-title');

            return {
                title: title ? title.textContent.trim() : 'Без названия',
                image: img ? (img.src || img.dataset.src || '') : '',
                url: link ? (link.href.startsWith('http') ? link.href : BASE_URL + link.href) : '',
                info: isSubscribed ? '4K • Подписка' : 'HD',
                quality: isSubscribed ? '2160p' : '1080p'
            };
        });
    };

    // Получение серий
    YanimaPlugin.prototype.getInfo = function(url) {
        return new Promise(resolve => {
            fetch(url, { headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} })
                .then(r => r.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');

                    const episodes = [];
                    doc.querySelectorAll('a.episode-link, .episode, [class*="episode"]').forEach((el, i) => {
                        episodes.push({
                            title: `Серия ${i+1}`,
                            url: el.href,
                            quality: isSubscribed ? '4K' : 'HD'
                        });
                    });

                    resolve({
                        title: doc.querySelector('h1')?.textContent.trim() || '',
                        image: doc.querySelector('.poster img')?.src || '',
                        description: doc.querySelector('.description')?.textContent.trim() || '',
                        episodes: episodes.length ? episodes : [{title: 'Смотреть', url: url}]
                    });
                })
                .catch(() => resolve({}));
        });
    };

    // Форма логина
    YanimaPlugin.prototype.showLogin = function() {
        Lampa.Dialog.show({
            title: 'Вход в Yanima',
            html: `
                <input type="text" id="yanima_login" placeholder="Логин / Email" style="width:100%;margin:10px 0;padding:10px;">
                <input type="password" id="yanima_pass" placeholder="Пароль" style="width:100%;margin:10px 0;padding:10px;">
            `,
            buttons: [
                { name: 'Войти', callback: () => {
                    const login = document.getElementById('yanima_login').value;
                    const pass = document.getElementById('yanima_pass').value;
                    this.login(login, pass);
                }}
            ]
        });
    };

    window.YanimaPlugin = new YanimaPlugin();
    if (Lampa.Plugins) Lampa.Plugins.add('yanima', window.YanimaPlugin);
})();