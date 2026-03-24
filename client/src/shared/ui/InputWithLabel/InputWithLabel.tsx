import { ChangeEvent, HTMLInputTypeAttribute } from "react";

interface InputWithLabelProps {
  name: string;
  label: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  value?: string | number;
  type?: HTMLInputTypeAttribute;
  hint?: string;
}

export const InputWithLabel = ({
  label,
  name,
  placeholder = "",
  onChange,
  className,
  value,
  type = "text",
  hint = "",
}: InputWithLabelProps) => {
  const handlerOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  return (
    <div className={`relative${className ? ` ${className}` : ``}`}>
      <input
        autoComplete={"on"}
        type={type}
        placeholder={placeholder}
        name={name}
        id={name}
        className={"form-control"}
        value={value}
        onChange={handlerOnChange}
      />
      <label className={"form-label"} htmlFor={name}>
        {label}
      </label>
      {hint && hint !== "" && (
        <span className={"text-sm text-gray-400 self-start ml-5"}>{hint}</span>
      )}
    </div>
  );
};
