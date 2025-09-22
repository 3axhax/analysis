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
  orientation?: "horizontal" | "vertical";
  required?: boolean;
}

const RadioGroup = <T = string,>({
  label,
  name,
  options,
  value,
  onChange,
  orientation = "horizontal",
  required = false,
}: RadioGroupProps<T>) => {
  return (
    <div
      className={`radio-group-container flex justify-between ${orientation === "vertical" ? "vertical" : "horizontal"}`}
    >
      <label className="group-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>

      <div
        className={`radio-options flex gap-[10px] ${orientation === "vertical" ? "vertical-layout" : "horizontal-layout"}`}
        role="radiogroup"
        aria-labelledby={`${name}-label`}
      >
        {options.map((option) => (
          <label
            key={option.value as string}
            className={`radio-label cursor-pointer ${option.disabled ? "disabled" : ""}`}
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
