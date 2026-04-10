import React, { useEffect, useState } from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useTranslation } from "react-i18next";
import {
  selectDescriptionsError,
  selectEditDescriptionId,
  useDescriptionsWithTranslateLoad,
} from "@entities/descriptions";
import { DescriptionsList } from "@widgets/Admin/descriptionsList";
import { useAppSelector } from "@shared/store/hooks.ts";
import { DescriptionsListPagination } from "@features/Admin/descriptions/descriptionsListPagination";
import { AddButton } from "@shared/ui";
import { EditDescriptionModal } from "@features/Admin/descriptions/editDescription";
import { DescriptionsFilters } from "@features/Admin/descriptions/descriptionsFilters";

export const DescriptionsPage: React.FC = () => {
  const { t } = useTranslation("common");
  const { t: tFeatures } = useTranslation("features");
  const title = t("pageTitle.descriptions");
  useDocumentTitle(title);

  const error = useAppSelector(selectDescriptionsError);
  const editDescriptionId = useAppSelector(selectEditDescriptionId);

  const [openModal, setOpenModal] = useState<boolean>(false);

  useEffect(() => {
    if (editDescriptionId && editDescriptionId > 0) {
      setOpenModal(true);
    }
  }, [editDescriptionId]);

  useDescriptionsWithTranslateLoad();

  return (
    <div>
      <div className={"relative"}>
        <h1 className={"p-4 text-3xl"}>{title}</h1>
        <AddButton
          className={"my-4 xl:sticky xl:bottom-5 xl:mr-[5%] xl:ml-auto flex"}
          title={tFeatures("editDialog.add")}
          onClick={() => {
            setOpenModal(true);
          }}
        />
      </div>
      {error !== "" ? (
        <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
      ) : null}
      <DescriptionsFilters />
      <DescriptionsList />
      <DescriptionsListPagination />
      <AddButton
        className={"my-4 xl:sticky xl:bottom-5 xl:mr-[5%] xl:ml-auto flex"}
        title={tFeatures("editDialog.add")}
        onClick={() => {
          setOpenModal(true);
        }}
      />
      <EditDescriptionModal open={openModal} setOpen={setOpenModal} />
    </div>
  );
};
