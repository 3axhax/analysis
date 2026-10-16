# Исправление возврата на главную

AnalysisPointGroupSelect хранил выбор в useState и Redux одновременно. Дочерние эффекты записывали локальный выбор в Redux, а затем восстанавливали локальный выбор из Redux. При возврате с заполненной формы родительский resetSelectedPoints вступал с ними в конфликт. Проверка только длины списков также не замечала замену ID при прежнем количестве элементов.

Теперь Redux selectedList — единственный источник выбранных ID. Опции вычисляются при render, включая позднее появление справочника. Dispatch выполняется только при выборе пользователем; групповой выбор сохраняет существующие ID и исключает дубли. Анализ, сохранение и медицинская интерпретация не менялись; БД не изменялась.

Добавлены dev-only Vitest, Testing Library и jsdom; запуск из client: `npm test`. Тесты используют реальные React/Redux/MemoryRouter, синтетический каталог, упрощённый mock react-select и переводов. API и реальные результаты не запрашиваются. Ограничитель dispatch предотвращает зависание теста на исходном дефекте.

На исходном коде все три теста падали; после исправления все проходят. Проверены TypeScript, production build и ESLint современным bundled Node, поскольку системный Node 18 ниже требований существующего Vite 7. Сборка имеет прежние CSS/chunk warnings. npm install сообщил audit warnings; массовое обновление зависимостей и audit fix не выполнялись.

Миграции не нужны. Для отмены достаточно вернуть изменение компонента. Пользователь согласовал commit/push/merge и production-поставку только frontend; старый образ сохраняется для отката. Документация предыдущей поставки 0008 сохранена.

## Поставка 2026-10-16

Исправление 73683f2 отправлено в ветку 0009-home-navigation, merge b94f386 отправлен в origin/main. На сервере создан отдельный release `/var/analysis/releases/b94f38614ee2` с сохранением действующей production-конфигурации и путей данных. Собран и переключён только client_analysis; Nginx configuration test и reload успешны.

Проверено: работающий client image совпадает с тегом b94f38614ee2, HTML и `/assets/index-CkxzcMfY.js` через HTTPS побайтово совпадают с новым образом, API health отвечает 200. ID, image ID и StartedAt serverAnalysis, pythonPDFParser, postgresAnalysis и nginxProxy не изменились. Backend и Python остаются на предыдущей проверенной версии; startup-миграции не запускались.

Предыдущий frontend сохранён тегом `analysis-client_analysis:before-b94f38614ee2`. Для отката frontend вернуть этот образ в latest, выполнить `docker compose -p analysis -f /var/analysis/releases/b94f38614ee2/docker-compose.yaml up -d --no-deps --no-build client_analysis`, проверить конфигурацию Nginx и выполнить reload. Schema rollback не нужен. Приватная production-конфигурация не попадала в Git или вывод команд.
