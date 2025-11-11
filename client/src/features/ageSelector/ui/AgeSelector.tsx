import SelectUI from "@shared/ui/SelectUI.tsx";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { selectAgesListForSelect, useAgesLoad } from "@entities/ages";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { setPrepareDataAge } from "@entities/analysisResult";

export const AgeSelector = () => {
    const ageOptions = useAppSelector(selectAgesListForSelect);
    useAgesLoad();
    const { t } = useTranslation("entities");
    const dispatch = useAppDispatch();

    const [age, setAge] = useState<string>("");

    const handlerOnChange = (value: string) => {
        setAge(value);
        dispatch(setPrepareDataAge(value));
    };

    return (
        <SelectUI<string>
            name={"age"}
            options={ageOptions.map((item) => ({
                ...item,
                label: t(`ages.${item.label}`),
            }))}
            value={age}
            onChange={handlerOnChange}
            placeholder="Выберите возраст"
            className="w-full mb-4"
            classNames={{
                control: (state) =>
                    `!min-h-10 !border !rounded-lg !bg-white !shadow-sm transition-all duration-200 outline-none ${
                        state.isFocused
                            ? '!border-green-800 !ring-1 !ring-green-800 !ring-opacity-20'
                            : '!border-gray-300 hover:!border-green-800 hover:!shadow-green-800'
                    } ${
                        state.isDisabled ? '!bg-gray-50 !cursor-not-allowed !opacity-50' : ''
                    }`,
                menu: () => '!border !border-gray-200 !rounded-lg !shadow-lg !mt-1 !bg-white',
                menuList: () => '!py-1',
                option: (state) =>
                    `!px-3 !py-2 !cursor-pointer ${
                        state.isSelected
                            ? '!bg-green-800 !text-white'
                            : state.isFocused
                                ? '!bg-green-50 !text-gray-900'
                                : '!text-gray-700 hover:!bg-gray-50'
                    } ${state.isDisabled ? '!opacity-50 !cursor-not-allowed' : ''}`,
                placeholder: () => '!text-gray-400',
                singleValue: () => '!text-gray-900',
                valueContainer: () => '!px-3 !py-1',
                indicatorsContainer: () => '!pr-2',
                dropdownIndicator: (state) =>
                    `!text-gray-400 hover:!text-gray-600 transition-all duration-300 ease-in-out ${
                        state.selectProps.menuIsOpen
                            ? '!rotate-180 !text-green-800'
                            : ''
                    }`,
                clearIndicator: () => '!text-gray-400 hover:!text-gray-600',
                indicatorSeparator: () => '!bg-transparent',
                noOptionsMessage: () => '!text-gray-500 !py-4',
            }}
        />
    );
};