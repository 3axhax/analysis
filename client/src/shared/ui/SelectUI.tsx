import React from "react";

export interface SelectUIOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SelectUIProps<T = string> {
  label?: string;
  name: string;
  options: SelectUIOption<T>[];
  value: T;
  onChange: (value: T) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const SelectUI = <T extends string | number = string>({
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
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    const value = (
      typeof options[0]?.value === "number"
        ? Number(selectedValue)
        : selectedValue
    ) as T;
    onChange(value);
  };

  return (
    <div className={`flex justify-between ${className}`}>
      {label ? (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      ) : null}
      <select
        value={value}
        onChange={handleChange}
        id={name}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
          transition-colors
        `}
        aria-required={required}
        {...other}
      >
        <option
          value={typeof value === "string" ? "" : 0}
          disabled
          className="text-gray-400"
        >
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={option.disabled ? "text-gray-400" : ""}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectUI;
