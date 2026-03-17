import { PlusCircleIcon } from "@heroicons/react/16/solid";

interface AddButtonProps {
  className?: string;
  onClick?: () => void;
  title?: string;
}

export const AddButton = ({
  className,
  onClick,
  title = "",
}: AddButtonProps) => {
  return (
    <button
      className={`btn bg-green-600 text-white rounded-lg px-4 py-2 cursor-pointer hover:bg-green-500${className ? " " + className : ""}`}
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      <PlusCircleIcon className="h-5 w-5 inline-flex mr-2" />
      {title}
    </button>
  );
};
