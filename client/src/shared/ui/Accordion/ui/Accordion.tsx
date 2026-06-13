import { useState, ReactNode, FC, JSX } from "react";

export interface AccordionItemType {
  id: string | number;
  title: string;
  content: ReactNode;
  icon?: string | JSX.Element;
  disabled?: boolean;
}

interface AccordionContainerProps {
  items: AccordionItemType[];
  multiple?: boolean;
  className?: string;
  itemClassName?: string;
  headerClassName?: string;
  headerOpenedClassName?: string;
  headerClosedClassName?: string;
  contentClassName?: string;
  dropdownIconClassName?: string;
  defaultOpenIds?: (string | number)[];
  onToggle?: (id: string | number, isOpen: boolean) => void;
}

export const Accordion: FC<AccordionContainerProps> = ({
  items,
  multiple = false,
  className = "",
  itemClassName = "",
  headerClassName = "",
  headerOpenedClassName = "",
  headerClosedClassName = "",
  contentClassName = "",
  dropdownIconClassName = "",
  defaultOpenIds = [],
  onToggle,
}) => {
  const [openIds, setOpenIds] = useState<(string | number)[]>(defaultOpenIds);

  const toggle = (id: string | number): void => {
    const isOpen = openIds.includes(id);

    if (multiple) {
      setOpenIds((prev) =>
        isOpen ? prev.filter((i) => i !== id) : [...prev, id],
      );
    } else {
      setOpenIds(isOpen ? [] : [id]);
    }

    onToggle?.(id, !isOpen);
  };

  return (
    <ul className={` ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);

        return (
          <li
            key={item.id}
            className={`${itemClassName} ${item.disabled ? "opacity-60" : ""}`}
          >
            <button
              onClick={() => !item.disabled && toggle(item.id)}
              disabled={item.disabled}
              className={`size-full cursor-pointer flex justify-between items-center rounded-xl ${isOpen ? headerOpenedClassName : headerClosedClassName} ${headerClassName}`}
            >
              <div className="flex items-center gap-3">
                {item.icon && <span className={"shrink-0"}>{item.icon}</span>}
                {item.title}
              </div>
              <svg
                className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${dropdownIconClassName} ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${contentClassName} ${
                isOpen ? "max-h-[500px]" : "max-h-0"
              }`}
            >
              <div className={`px-5 pb-5 pt-3 text-left`}>{item.content}</div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
