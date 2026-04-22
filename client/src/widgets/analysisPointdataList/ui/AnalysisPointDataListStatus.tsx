import cn from "classnames";
import { StatusValue } from "@entities/analysisResult/model/types.ts";
import { useTranslation } from "react-i18next";
import {
  CheckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

export const AnalysisPointDataListStatus = ({
  status,
}: {
  status: StatusValue;
}) => {
  const { t } = useTranslation("common");

  return (
    <span
      className={cn({
        "text-green-600 whitespace-nowrap": status === StatusValue.NORMAL,
        "text-red-600 whitespace-nowrap font-normal":
          status === StatusValue.HIGH || status === StatusValue.LOW,
      })}
    >
      {status === StatusValue.NORMAL ? (
        <CheckIcon className="size-4 inline-flex mr-1 color-green-600" />
      ) : status === StatusValue.HIGH ? (
        <ArrowUpIcon className={"size-4 inline-flex mr-1 color-green-600"} />
      ) : status === StatusValue.LOW ? (
        <ArrowDownIcon className={"size-4 inline-flex mr-1 color-green-600"} />
      ) : (
        ""
      )}
      {t(`analysisDescriptionConditionStatus.${status}`)}
    </span>
  );
};
