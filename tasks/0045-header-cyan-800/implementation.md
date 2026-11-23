# Реализация
В общем NavigationUI заменены четыре bg-cyan-600 на bg-cyan-800: шапка, мобильное меню и собственные фоны пунктов. Публичный prerender и интерактивная навигация используют один компонент. Тёмная тема сохранена.

Client build/postbuild и lint успешны; класс шапки в сгенерированном HTML проверен. Прежние CSS/chunk/i18next warnings сохранены. API/БД/медицинская логика не менялись, миграций нет. Визуальный браузерный smoke test не выполнялся. На сервер не публиковалось. Откат — вернуть четыре класса bg-cyan-600.

2026-11-23: пользователь принял оформление и запросил поставку последних изменений. Дополнительно включены существующие правки отступов: mb-5/lg:mb-8 у вступления и формы, убран вложенный mb-8 заголовка. Цвет логотипа прежний text-orange-200.

## Поставка 2026-11-23
Код 81a67c4 опубликован через main/Git pull в /var/analysis/analysis. Клиентский образ analysis-client_analysis:81a67c4 собран из client этого checkout. Project analysis; manifests docker-compose.yaml + runtime/compose.production.yaml + runtime/compose.release-f9209ea.yaml + runtime/compose.client-81a67c4.yaml. Effective build context и сохранение backend image f9209ea проверены. Пересоздан только clientAnalysis, nginx -t/reload успешны, StartedAt backend/PostgreSQL/PDF/Nginx неизменны. Временный лимит builder 768 MiB возвращён к 512 MiB.

Проверки через Nginx во внутренней сети: HTML клиента, assets и API health отвечают 200. В опубликованном HTML подтверждены bg-cyan-800 шапки, прежний text-orange-200 логотипа, новые mb-5/lg:mb-8 отступы.

Публичная HTTPS-проверка завершилась CERTIFICATE_VERIFY_FAILED: сертификат GlobalSign истёк 2026-11-21 13:55:26 UTC. Подтверждено по серверному fullchain.pem; certbot/renewal-конфигурации не обнаружены. Сертификаты не менялись, проверка TLS не обходилась. Требуется отдельное обновление сертификата; успешная внешняя HTTPS-проверка этой поставки не подтверждена. Визуальная браузерная проверка не выполнялась.

Откат клиента — manifest runtime/compose.release-f9209ea.yaml без нового client override, up --no-deps --no-build только client_analysis, затем reload Nginx. Старый образ сохранён. Backend/БД не изменять.
