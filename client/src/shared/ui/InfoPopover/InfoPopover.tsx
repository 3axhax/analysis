import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export const InfoPopover = ({
  label,
  summary,
  children,
  align = "right",
  trigger,
}: {
  label: string;
  summary: string;
  children?: ReactNode;
  align?: "left" | "right";
  trigger?: ReactNode;
}) => {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const wrapper = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!pinned) return;
    const dismiss = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) {
        setPinned(false);
        setHovered(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPinned(false);
        setHovered(false);
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [pinned]);

  return (
    <span
      ref={wrapper}
      className="relative inline-flex ml-1 align-middle"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        className={`cursor-pointer inline-flex text-gray-500 dark:text-gray-200 items-start justify-center hover:text-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 ${trigger ? "underline" : "w-5 h-7"}`}
        aria-label={label}
        aria-expanded={pinned}
        aria-describedby={hovered || pinned ? tooltipId : undefined}
        onClick={() => setPinned((value) => !value)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        {trigger ?? <InformationCircleIcon
          className="inline-flex h-4 w-4 transition-transform hover:scale-110"
          aria-hidden="true"
        />}
      </button>
      {(hovered || pinned) && (
        <span
          id={tooltipId}
          role={pinned ? "dialog" : "tooltip"}
          aria-label={pinned ? summary : undefined}
          className={`absolute z-50 ${align === "left" ? "left-0" : "right-0"} top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-950 p-3 text-sm font-normal text-gray-900 dark:text-white shadow-lg`}
        >
          <span className={children ? "block font-medium" : "block"}>
            {summary}
          </span>
          {pinned && children && (
            <span className="block mt-2 font-normal">{children}</span>
          )}
        </span>
      )}
    </span>
  );
};
