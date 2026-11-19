# Реализация
Счётчик 109419092 подключён через ClientOnly-компонент Metrica и createMetricaTracker. Только production origin, accept_ym=1 и точный allowlist canonical-pages без query/hash. Используются defer/init и ручной hit с каноническим URL, фиксированным заголовком и пустым referer. Вебвизор, clickmap, trackLinks, trackHash, ecommerce, accurateTrackBounce, YTM и автоматические заголовки отключены.

На запрещённом маршруте либо при отзыве согласия — destruct. Загрузка скрипта отменяется до инициализации при смене маршрута; onload перепроверяет согласие и текущий адрес. Ошибка загрузки не блокирует сайт, повторная попытка возможна при следующем update. Согласие применяется сразу через отдельное событие, также учитываются storage events. На localhost аналитика не грузится. Прежний текст cookie сохранён, политика/согласие актуализированы.

15 tests / 2 suites проверяют отсутствие загрузки без согласия, исключённые адреса, отсутствие query/hash и синтетических адресов результатов в вызовах, загрузку один раз, ручные просмотры, остановку и гонку загрузки. Build/postbuild, lint, privacy build check успешны; прежние CSS/chunk/i18next/React Router warnings сохранены. Проверки используют mock SDK, сетевые payload реального SDK и кабинет Метрики не проверены. API/БД/медицинская логика не меняются, миграций нет.

Официальные источники: https://yandex.ru/support/metrica/ru/code/counter-initialize и https://yandex.ru/support/metrica/ru/code/counter-spa-setup .

Автоматическая проверка отклонила commit/push/публикацию с формулировкой: общий запрос включить Метрику не авторизует конкретный payload и destination потенциально персональных данных. Команда не выполнялась, Git и сервер не изменены. У пользователя запрошено явное подтверждение публикации и передачи Яндексу публичных URL без query/hash, IP и технических данных браузера после согласия посетителя.

Незавершённые пользовательские правки AnalysisIntroduction/AnalysisPage сохранены. Для отката локальной реализации удалить компонент Metrica и вернуть прежние информационные абзацы/проверку сборки; данных БД не затрагивать.

## Подтверждение и поставка 2026-11-19
После отказа auto-review пользователь явно подтвердил публикацию и передачу Яндексу указанного состава данных. Публикация выполнена: код 30ba814, checkout /var/analysis/analysis на main после git pull --ff-only. Project analysis; manifests docker-compose.yaml + runtime/compose.production.yaml + runtime/compose.client-30ba814.yaml. Образ analysis-client_analysis:30ba814 собран из client этого checkout. Только клиент пересоздан; nginx -t/reload успешны. StartedAt backend/БД/PDF/Nginx не изменились. Лимит builder возвращён с временных 768 MiB на 512 MiB.

HTTPS /, assets, страницы политики/согласия и /api/health — 200. Проверено наличие нового tracker в публичном JS и отсутствие безусловного collector в HTML. В браузере рабочего сайта подтверждено добавление https://mc.yandex.ru/metrika/tag.js с referrerPolicy=no-referrer; SDK также добавил tag_phono.js. Реальный состав сетевых payload и приём просмотров в кабинете не проверены. Незавершённые пользовательские изменения двух компонентов главной не вошли в поставку.

Откат клиента — runtime/compose.client-df6f56b.yaml с --no-deps --no-build, reload Nginx. Прежние образы сохранены.
