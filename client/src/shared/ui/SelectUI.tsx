import Select, { ClassNamesConfig } from 'react-select';

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
  isDisabled?: boolean;
  error?: string;
  classNames?: ClassNamesConfig<SelectUIOption<T>>;
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
  isDisabled = false,
  error,
  classNames,
  ...other
}: SelectUIProps<T>) => {
  const handleChange = (selectedOption: SelectUIOption<T> | null) => {
    if (selectedOption) {
      onChange(selectedOption.value);
    }
  };

  // Находим текущее значение в формате react-select
  const selectedValue = options.find(option => option.value === value) || null;

  return (
    <div className={`${className}`}>
      {label ? (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      ) : null}
      <Select<SelectUIOption<T>>
          value={selectedValue}
          onChange={handleChange}
          options={options}
          inputId={name}
          placeholder={placeholder}
          className={``}
          aria-required={required}
          classNames={classNames}
          {...other}
      />
    </div>
  );
};

export default SelectUI;
