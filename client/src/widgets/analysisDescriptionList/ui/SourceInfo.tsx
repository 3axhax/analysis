import type { SourceDescriptionGroup } from "@entities/analysisResult/model/types.ts";
import { InfoPopover } from "@shared/ui";

const safeUrl = (value: unknown): string | null =>
  typeof value === "string" && /^https?:\/\//i.test(value) ? value : null;

export const SourceInfo = ({
  source,
  textTrigger = false,
}: {
  source: SourceDescriptionGroup["source"];
  textTrigger?: boolean;
}) => {
  const url = safeUrl(source.metadata.url);
  const licenseUrl = safeUrl(source.metadata.licenseUrl);
  const underlyingSourceUrl = safeUrl(source.metadata.underlyingSourceUrl);
  return (
    <InfoPopover
      label={textTrigger ? `Источник описания: ${source.name}` : `Информация об источнике: ${source.name}`}
      summary={`Источник: ${source.name}`}
      trigger={textTrigger ? "Источник" : undefined}
    >
      {typeof source.metadata.title === "string" && (
        <span className="block">{source.metadata.title}</span>
      )}
      {typeof source.metadata.authors === "string" && (
        <span className="block">
          {source.metadata.authors}
          {typeof source.metadata.year === "number"
            ? `, ${source.metadata.year}`
            : ""}
        </span>
      )}
      {typeof source.metadata.translation === "string" && (
        <span className="block">{source.metadata.translation}</span>
      )}
      {typeof source.metadata.underlyingSource === "string" && (
        <span className="block">
          Основа:{" "}
          {underlyingSourceUrl ? (
            <a
              className="underline text-cyan-800 dark:text-cyan-300"
              href={underlyingSourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              {source.metadata.underlyingSource}
            </a>
          ) : (
            source.metadata.underlyingSource
          )}
        </span>
      )}
      {url && (
        <a
          className="block underline text-cyan-800 dark:text-cyan-300"
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          Открыть источник
        </a>
      )}
      {typeof source.metadata.license === "string" &&
        (licenseUrl ? (
          <a
            className="block underline text-cyan-800 dark:text-cyan-300"
            href={licenseUrl}
            target="_blank"
            rel="noreferrer"
          >
            {source.metadata.license}
          </a>
        ) : (
          <span className="block">{source.metadata.license}</span>
        ))}
    </InfoPopover>
  );
};
