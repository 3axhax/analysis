# Реализация
Восстановлены дословно три прежних абзаца cookie-блока по запросу пользователя. Ссылки оставлены абсолютными; кнопки, сохранение accept_ym и ClientOnly не менялись. Метрика остаётся отключённой, хотя возвращённый по запросу текст описывает её использование.

API, БД, медицинская логика и зависимости не менялись, миграций нет. Незавершённая правка отступов AnalysisIntroduction исключена из commit и поставки.

Проверки: существующие три сценария баннера, build/postbuild, lint, privacy build check. Первоначальное ожидание названия ссылки исправлено под дословное «Политикой обработки ПДн». Откат — клиентский образ a5291b2.

## Поставка 2026-11-19
Код df6f56b опубликован из /var/analysis/analysis, main после git pull --ff-only. Project analysis, manifests docker-compose.yaml + runtime/compose.production.yaml + runtime/compose.client-df6f56b.yaml; build context — client согласованного checkout, образ analysis-client_analysis:df6f56b. Только clientAnalysis пересоздан, nginx -t/reload успешны. StartedAt backend/PostgreSQL/PDF/Nginx неизменны. Ограничение builder возвращено с временных 768 на 512 MiB.

Публичные HTTPS /, assets и /api/health — 200. В публичном JS проверены восстановленные абзацы, отсутствие заменённого текста и внешнего collector. Визуальный smoke test не выполнялся. Откат клиента — runtime/compose.client-a5291b2.yaml с --no-deps --no-build, reload Nginx; прежний образ сохранён.
