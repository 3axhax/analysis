import { ChangeEvent } from "react";

interface InputWithLabelProps {
  name: string;
  label: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  value?: string;
}

export const InputWithLabel = ({
  label,
  name,
  placeholder = "",
  onChange,
  className,
  value,
}: InputWithLabelProps) => {
  const handlerOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  return (
    <label className={`flex items-center${className ? ` ${className}` : ``}`}>
      <span>{label}: </span>
      <input
        type={"text"}
        name={name}
        value={value}
        className={
          "px-4 py-2 ml-[10px] border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        }
        placeholder={placeholder}
        onChange={handlerOnChange}
      />
    </label>
  );
};
