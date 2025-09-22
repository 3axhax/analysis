import React from "react";

export interface SelectUIOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SelectUIProps<T = string> {
  label: string;
  name: string;
  options: SelectUIOption<T>[];
  value: T;
  onChange: (value: T) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const SelectUI = <T = string,>({
  label,
  name,
  options,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "Выберите вариант",
  className = "",
}: SelectUIProps<T>) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as T);
  };

  return (
    <div className={`mb-4 flex justify-between ${className}`}>
      <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value as string}
        onChange={handleChange}
        disabled={disabled}
        id={name}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
          transition-colors
        `}
        aria-required={required}
      >
        <option value="" disabled className="text-gray-400">
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value as string}
            value={option.value as string}
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
