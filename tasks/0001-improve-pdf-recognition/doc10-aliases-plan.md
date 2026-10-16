# Дополнение parsing aliases для пропусков doc-10

Дата: 2026-10-14. Пользователь явно запросил необходимые правки БД после диагностики nine missing names и memory-only эксперимента 33/33.

Изменить только translationParsing девяти существующих записей, сохранив старые фразы:

- basophil-count: «Базофилы»; eosinophil-count: «Эозинофилы»; lymphocyte-count: «Лимфоциты». Это общий корень; generic resolver сам по себе не считает его абсолютным, требует form marker или exact code.
- albumin_fraction: полное двуязычное «Альбумин Albumin», не отдельное «Альбумин». В БД отдельной концентрации альбумина нет; соответствие в исследованном документе подтверждено независимым DB-эталоном. Такое имя может встречаться и для концентрации в новом документе: это ограничение словаря, не универсальный гарантирующий фракцию признак. Users проверяют findings/units.
- alpha-1_globulin_fraction: «Alpha 1 Альфа-1-глобулин»; alpha-2_globulins: «Alpha 2 Альфа-2-глобулин»; gamma_globulins: «Gamma Гамма-глобулин».
- antibodies-to-thyroglobulin: Tg-Ab, ATG, «Антитела к тиреоглобулину».
- antibody-to-thyroid-peroxidase (существующее имя имеет trailing space, не исправлять): TPOAb, «Антитела к пероксидазе тиреоцитов».

Read-only подтверждены 9 записей и их текущие фразы. Backup создан, читаемость и Git-ignore проверены. Explicit transactional data migration с exact id/name/old-string preconditions, dry-run по умолчанию, проверкой остальных полей/записей каталога до/после. Пользовательский запрос подтверждает перечисленную область. Apply после успешного dry-run; rollback восстановлением точного прежнего списка через reverse migration. Нормативы, units, имя записи/ID, результаты и схема не меняются.

Проверка: новый ignored snapshot каталога с теми же девятью additions, expected и fingerprints не менять; полный corpus плюс separate diagnostics changed inputs, контроль wrong/extra, документ10 exact 33/33; checksums остальных полей/записей, Git diff check. Parser/Python/JSON gold не менять. Ограничения и отсутствие гарантии на новые формы альбумина зафиксировать в implementation/report.
