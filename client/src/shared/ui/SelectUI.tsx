import Select from "react-select";
import { JSX } from "react";

export interface SelectUIOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectMultiUIOption<T = string> {
  label: string;
  options: SelectUIOption<T>[];
}

interface SelectUIProps<T = string> {
  label?: string | JSX.Element;
  name: string;
  options: SelectUIOption<T>[];
  value: T;
  onChange: (value: T) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export const SelectUI = <T extends string | number = string>({
  label,
  name,
  options,
  value,
  onChange,
  required = false,
  placeholder = "Выберите вариант",
  className = "",
  ...other
}: SelectUIProps<T>) => {
  const handleChange = (selectedOption: SelectUIOption<T> | null) => {
    if (selectedOption) {
      onChange(selectedOption.value);
    }
  };

  const selectedValue =
    options.find((option) => option.value === value) || null;

  return (
    <div className={`${className}`}>
      {label ? (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-100"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      ) : null}
      <Select<SelectUIOption<T>>
        menuPortalTarget={document.body}
        menuPosition="fixed"
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        value={selectedValue}
        onChange={handleChange}
        options={options}
        inputId={name}
        placeholder={placeholder}
        aria-required={required}
        classNames={{
          control: (state) =>
            `!min-h-10 !border !rounded-lg !bg-white dark:!bg-gray-950 !shadow-sm transition-all duration-200 outline-none text-left ${
              state.isFocused
                ? "!border-cyan-800 !ring-1 !ring-cyan-800 !ring-opacity-20"
                : "!border-gray-300 hover:!border-cyan-800 hover:!shadow-cyan-800"
            } ${
              state.isDisabled
                ? "!bg-gray-50 !cursor-not-allowed !opacity-50"
                : ""
            }`,
          menu: () =>
            "!border !border-gray-200 !rounded-lg !shadow-lg !mt-1 !bg-white !overflow-hidden dark:!bg-gray-950 dark:!border-gray-600",
          menuList: () => "!py-1",
          option: (state) =>
            `!px-3 !py-2 !cursor-pointer ${
              state.isSelected
                ? "!bg-cyan-800 !text-white"
                : state.isFocused
                  ? "!bg-cyan-50 !text-gray-900 dark:!text-white dark:!bg-cyan-800"
                  : "!text-gray-700 dark:!text-gray-200 dark:!bg-gray-950 hover:!bg-gray-50"
            } ${state.isDisabled ? "!opacity-50 !cursor-not-allowed" : ""}`,
          placeholder: () => "!text-gray-400",
          singleValue: () => "!text-gray-900 dark:!text-white",
          valueContainer: () => "!px-3 !py-1",
          indicatorsContainer: () => "!pr-2",
          dropdownIndicator: (state) =>
            `!text-gray-400 hover:!text-gray-600 dark:!text-white hover:dark:!text-gray-300 transition-all duration-300 ease-in-out ${
              state.selectProps.menuIsOpen ? "!rotate-180 !text-green-800" : ""
            }`,
          clearIndicator: () =>
            "!text-gray-400 hover:!text-gray-600 dark:!text-white hover:dark:!text-gray-300",
          indicatorSeparator: () => "!bg-transparent",
          noOptionsMessage: () => "!text-gray-500 dark:!text-gray-300 !py-4",
        }}
        {...other}
      />
    </div>
  );
};
