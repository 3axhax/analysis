export interface RadioOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps<T = string> {
  label: string;
  name: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  required?: boolean;
}

const RadioGroup = <T = string,>({
  label,
  name,
  options,
  value,
  onChange,
  required = false,
}: RadioGroupProps<T>) => {
  return (
    <div className={`radio-group-container flex justify-between horizontal`}>
      <label className="group-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>

      <div
        className={`radio-options flex gap-[15px] horizontal-layout`}
        role="radiogroup"
        aria-labelledby={`${name}-label`}
      >
        {options.map((option) => (
          <label
            key={option.value as string}
            className={`radio-label cursor-pointer flex gap-[3px] ${option.disabled ? "disabled" : ""}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value as string}
              checked={value === option.value}
              onChange={() => {
                onChange(option.value);
              }}
              disabled={option.disabled}
              className="radio-input cursor-pointer"
              aria-checked={value === option.value}
            />
            <span className="radio-custom"></span>
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default RadioGroup;
