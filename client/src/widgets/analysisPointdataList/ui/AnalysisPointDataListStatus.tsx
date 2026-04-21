import {PointData} from "@entities/analysisResult";
import cn from "classnames";
import {StatusValue} from "@entities/analysisResult/model/types.ts";
import {useTranslation} from "react-i18next";
import {CheckIcon, ArrowUpIcon, ArrowDownIcon} from "@heroicons/react/24/outline";

export const AnalysisPointDataListStatus = ({row}: { row: PointData }) => {
    const {t} = useTranslation("common");

    return (
        <span
            className={cn({
                'text-green-600': row.pointDataStatus === StatusValue.NORMAL,
                'text-red-600': row.pointDataStatus === StatusValue.HIGH || row.pointDataStatus === StatusValue.LOW
            })}
        >
      {row.pointDataStatus === StatusValue.NORMAL
          ? <CheckIcon className="size-4 inline-flex mx-1 color-green-600" />

          : row.pointDataStatus === StatusValue.HIGH
              ? <ArrowUpIcon className={'size-4 inline-flex mx-1 color-green-600'} />
              : row.pointDataStatus === StatusValue.LOW
                  ? <ArrowDownIcon className={'size-4 inline-flex mx-1 color-green-600'} />
                  : ''}{t(`analysisDescriptionConditionStatus.${row.pointDataStatus}`)}
    </span>
    );
};
