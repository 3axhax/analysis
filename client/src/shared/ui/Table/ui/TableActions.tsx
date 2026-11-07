import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";

export const TableActions = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div className="flex justify-center">
    <button
      type="button"
      aria-label="Изменить"
      className="w-6 h-6 text-cyan-600 cursor-pointer ml-[10px] hover:text-cyan-800 transition-colors"
      onClick={onEdit}
    >
      <PencilSquareIcon className="w-5 h-5" />
    </button>
    <button
      type="button"
      aria-label="Удалить"
      className="w-6 h-6 text-red-600 cursor-pointer ml-[10px] hover:text-red-700 transition-colors"
      onClick={onDelete}
    >
      <TrashIcon className="w-5 h-5" />
    </button>
  </div>
);
