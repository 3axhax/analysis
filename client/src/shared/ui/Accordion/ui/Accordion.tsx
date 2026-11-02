import { useId, useState, ReactNode, FC, JSX } from "react";

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
  const groupName = useId();

  return (
    <ul className={` ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);

        return (
          <li key={item.id} className={itemClassName}>
            <details
              name={multiple ? undefined : groupName}
              open={defaultOpenIds.includes(item.id) || undefined}
              className={item.disabled ? "opacity-60" : ""}
              onToggle={(event) => {
                const open = event.currentTarget.open;
                setOpenIds((previous) => {
                  const others = previous.filter((id) => id !== item.id);
                  return open ? [...(multiple ? others : []), item.id] : others;
                });
                onToggle?.(item.id, open);
              }}
            >
              <summary
                onClick={(event) => {
                  if (item.disabled) event.preventDefault();
                }}
                aria-disabled={item.disabled || undefined}
                className={`w-full list-none [&::-webkit-details-marker]:hidden cursor-pointer flex justify-between items-center rounded-xl ${isOpen ? headerOpenedClassName : headerClosedClassName} ${headerClassName}`}
              >
                <span className="flex items-center gap-3">
                  {item.icon && <span className={"shrink-0"}>{item.icon}</span>}
                  {item.title}
                </span>
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
              </summary>
              <div className={`overflow-hidden ${contentClassName}`}>
                <div className={`px-5 pb-5 pt-3 text-left`}>{item.content}</div>
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
};
