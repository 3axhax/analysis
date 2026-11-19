# Реализация
Cookie-блок возвращён в AppContainer внутри ClientOnly. При отсутствии accept_ym видны текст, ссылки и кнопки Принять/Отказаться. Выбор сохраняется как прежде: 1/0; после любого ответа блок скрыт, в том числе при повторном открытии. Ранее сохранённый выбор учитывается.

Текст отражает отключённую Метрику и хранение настроек в LocalStorage. Внешний collector не подключался. Исправлен пропущенный пробел перед dark-классом. Privacy build regression продолжает запрещать legacy collector, но разрешает интерфейс выбора.

Проверки: 3 теста баннера прошли, build/postbuild, lint и verify-analytics-privacy успешны. Существующие предупреждения CSS, bundle size, i18next и React Router сохранены. API/БД/медицинская логика не менялись, миграций нет. Браузерный smoke test не выполнялся. На production не опубликовано.

Откат: убрать PoliticsAgreementBlock из AppContainer и восстановить прежнюю проверку отсутствия баннера.

## Поставка 2026-11-19
Код a5291b2 опубликован через main / git pull --ff-only из /var/analysis/analysis. Образ analysis-client_analysis:a5291b2 собран из client этого checkout. Project analysis, manifests docker-compose.yaml + runtime/compose.production.yaml + runtime/compose.client-a5291b2.yaml. Обновлён только clientAnalysis, nginx -t/reload успешны; StartedAt backend/БД/PDF/Nginx неизменны. Лимит builder временно 768 MiB, после сборки возвращён 512 MiB.

HTTPS /, assets и /api/health вернули 200. Публичный JS содержит баннер и кнопки; внешний collector отсутствует. В браузере загружен новый JS; баннер в используемом профиле не отображался (сохранённый выбор учитывается), визуальное появление первого визита на production не проверено. Три локальных теста покрывают первое открытие и оба ответа. Ранее записанное «на production не опубликовано» отражает состояние до этой поставки.

Откат: предыдущий runtime/compose.client-13b1bf2.yaml, up --no-deps --no-build только client_analysis, затем reload Nginx; старый образ сохранён.
