import { SourceContext } from "@features/Admin/sourceAdmin/SourceAdmin";
import React, { useEffect } from "react";
import {
  selectDescriptionsError,
  selectEditDescriptionId,
  useDescriptionsWithTranslateLoad,
} from "@entities/descriptions";
import { DescriptionsList } from "@widgets/Admin/descriptionsList";
import { useAppSelector } from "@shared/store/hooks.ts";
import { DescriptionsListPagination } from "@features/Admin/descriptions/descriptionsListPagination";
import { EditDescriptionModal } from "@features/Admin/descriptions/editDescription";

const CommonDescriptionsPage: React.FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ open, setOpen }) => {
  const error = useAppSelector(selectDescriptionsError);
  const editDescriptionId = useAppSelector(selectEditDescriptionId);

  useEffect(() => {
    if (editDescriptionId && editDescriptionId > 0) {
      setOpen(true);
    }
  }, [editDescriptionId, setOpen]);

  useDescriptionsWithTranslateLoad();

  return (
    <div>
      {error !== "" ? (
        <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
      ) : null}
      <DescriptionsList />
      <DescriptionsListPagination />
      <EditDescriptionModal open={open} setOpen={setOpen} />
    </div>
  );
};

export const DescriptionsPage: React.FC = () => (
  <SourceContext kind="descriptions">
    {(open, setOpen) => (
      <CommonDescriptionsPage open={open} setOpen={setOpen} />
    )}
  </SourceContext>
);
