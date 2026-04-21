import {PointData} from "@entities/analysisResult";
import cn from "classnames";
import {StatusValue} from "@entities/analysisResult/model/types.ts";
import {useTranslation} from "react-i18next";

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
          ? <svg className={'size-3 inline-flex mx-1 color-green-600'} fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12.2 8.8">
<path d="M4.2,8.8c-0.1,0-0.2,0-0.3,0c-0.1,0-0.2-0.1-0.3-0.2L0.2,5.2C0.1,5.1,0,4.9,0,4.7c0-0.2,0.1-0.4,0.2-0.6
	C0.4,4,0.6,3.9,0.8,3.9C1,3.9,1.2,4,1.3,4.1l2.8,2.8l6.7-6.7C11,0.1,11.2,0,11.4,0c0.2,0,0.4,0.1,0.6,0.2c0.1,0.1,0.2,0.3,0.2,0.6
	c0,0.2-0.1,0.4-0.2,0.6L4.7,8.6C4.6,8.7,4.6,8.8,4.5,8.8C4.4,8.8,4.3,8.8,4.2,8.8z"/>
</svg>
          : row.pointDataStatus === StatusValue.HIGH
              ? <svg className={'size-4 inline-flex mx-1 color-green-600'} fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
<path className="st0" d="M17,9.6l-5.5-5.5c-0.1-0.1-0.2-0.1-0.2-0.2c-0.1,0-0.1,0-0.2,0c0,0,0,0-0.1,0c0,0,0,0-0.1,0c-0.1,0-0.1,0-0.2,0
	c-0.1,0-0.2,0.1-0.2,0.2L5,9.6c-0.3,0.3-0.3,0.8,0,1.1s0.8,0.3,1.1,0l4.2-4.2v11c0,0.4,0.3,0.8,0.8,0.8s0.8-0.3,0.8-0.8v-11l4.2,4.2
	c0.1,0.1,0.3,0.2,0.5,0.2s0.4-0.1,0.5-0.2C17.3,10.3,17.3,9.8,17,9.6z"/>
</svg>
              : row.pointDataStatus === StatusValue.LOW
                  ? <svg className={'size-4 inline-flex mx-1 color-green-600'} fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
                      <path d="M17,11.4c-0.3-0.3-0.8-0.3-1.1,0l-4.2,4.2v-11c0-0.4-0.3-0.8-0.8-0.8s-0.8,0.3-0.8,0.8v11L6,11.4
	c-0.3-0.3-0.8-0.3-1.1,0s-0.3,0.8,0,1.1l5.5,5.5c0.1,0.1,0.2,0.1,0.2,0.2c0,0,0.1,0,0.2,0c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0
	c0.1,0,0.1,0,0.2,0c0.1,0,0.2-0.1,0.2-0.2l5.5-5.5C17.3,12.2,17.3,11.7,17,11.4z"/>
                  </svg>
                  : ''}{t(`analysisDescriptionConditionStatus.${row.pointDataStatus}`)}
    </span>
    );
};
