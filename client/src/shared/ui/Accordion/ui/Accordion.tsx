import {useState, ReactNode, FC, JSX} from 'react';

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
  contentClassName?: string;
  openedContentClassName?: string;
  defaultOpenIds?: (string | number)[];
  onToggle?: (id: string | number, isOpen: boolean) => void;
}

export const Accordion: FC<AccordionContainerProps> = ({
                                                               items,
                                                               multiple = false,
                                                               className = '',
                                                               itemClassName = '',
                                                               headerClassName = '',
                                                               contentClassName = '',
                                                               openedContentClassName='',
                                                               defaultOpenIds = [],
                                                               onToggle,
                                                             }) => {
  const [openIds, setOpenIds] = useState<(string | number)[]>(defaultOpenIds);

  const toggle = (id: string | number): void => {
    const isOpen = openIds.includes(id);

    if (multiple) {
      setOpenIds(prev => isOpen ? prev.filter(i => i !== id) : [...prev, id]);
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
                  className={`${itemClassName} ${
                      item.disabled ? 'opacity-60' : ''
                  }`}
              >
                <button
                    onClick={() => !item.disabled && toggle(item.id)}
                    disabled={item.disabled}
                    className={`border-1 border-cyan-600 rounded-xl hover:shadow-md w-full px-4 py-3 h-full text-left flex justify-between items-center transition-colors transition-border duration-300 ease-in-out hover:bg-cyan-50 ${
                        isOpen ? 'bg-cyan-50 rounded-b-none' : 'bg-white'
                    } ${headerClassName}`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon && <span className="text-gray-500">{item.icon}</span>}
                    <span className="font-semibold text-gray-800">{item.title}</span>
                  </div>
                  <svg
                      className={`w-5 h-5 text-gray-400 transition-all duration-300 ${
                          isOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-[2000px]' : 'max-h-0'
                    } ${contentClassName}  ${isOpen ? openedContentClassName : ''}`}
                >
                  <div className={`px-5 pb-5 pt-3 text-gray-800`}>
                    {item.content}
                  </div>
                </div>
              </li>
          );
        })}
      </ul>
  );
};