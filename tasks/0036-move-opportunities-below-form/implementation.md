# Реализация

Блок OpportunityList перенесён из AnalysisIntroduction в AnalysisPage: после всей AnalysisForm и перед списком анализов. Содержание, интерактивность и адаптивная ширина сохранены. Предыдущие пользовательские изменения сохранены.

API, конфигурация, схема и данные БД не менялись. Для отката вернуть компонент на прежнее место; миграции не нужны.

Проверки: npm run build (включая prerender) и npm run lint успешно выполнены локально в client. Сборка сообщает предупреждения существующих CSS-переменных, размера bundle и инициализации i18next при prerender. Визуальный smoke test в браузере не выполнялся. Порядок компонентов проверен по JSX.

## Поставка 2026-11-19

Все текущие изменения включены в c7e40e6; актуальный origin/main слит без конфликтов, код поставки — 13b1bf2. После слияния build/postbuild, lint и 27 tests / 11 suites успешны.

Checkout сервера: /var/analysis/analysis, main, git pull --ff-only origin main. Клиент собран ограниченным builder из client этого checkout, образ analysis-client_analysis:13b1bf2. Действующий клиентский manifest: docker-compose.yaml + runtime/compose.production.yaml + runtime/compose.client-13b1bf2.yaml, project analysis. Старые образы и конфигурация сохранены. Лимит builder временно увеличен с 512 до 768 MiB из-за нехватки памяти и возвращён к 512 MiB после сборки.

Пересоздан только clientAnalysis, Nginx прошёл nginx -t и reload. StartedAt backend/PostgreSQL/PDF/Nginx не изменились. Публичные HTTPS / и /api/health вернули 200; три подключённых assets доступны с 200; порядок формы, преимуществ и списка подтверждён в HTML. Визуальная проверка браузером не выполнялась.

Откат клиента: использовать прежний compose release-5fdcc8c override с --no-deps --no-build для client_analysis и перечитать Nginx; backend не пересоздавать.
