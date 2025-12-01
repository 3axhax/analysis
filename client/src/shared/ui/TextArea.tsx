import { ChangeEvent } from "react";

interface TextAreaProps<T = string> {
  name: string;
  value: T;
  onChange: (value: string) => void;
  className?: string;
}

export const TextArea = <T extends string | number = string>({
  name,
  value,
  onChange,
  className,
}: TextAreaProps<T>) => {
  return (
    <>
      <textarea
        className={`form-control${className ? ` ${className}` : ``}`}
        name={name}
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
      />
    </>
  );
};
