import React from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useTranslation } from "react-i18next";
import {
  selectDescriptionsError,
  useDescriptionsWithTranslateLoad,
} from "@entities/descriptions";
import { DescriptionsList } from "@widgets/Admin/descriptionsList";
//import { EditDescription } from "@features/Admin/descriptions/editDescriptions";
import { useAppSelector } from "@shared/store/hooks.ts";
import { DescriptionsListPagination } from "@features/Admin/descriptions/descriptionsListPagination";

export const DescriptionsPage: React.FC = () => {
  const { t } = useTranslation("common");
  const title = t("pageTitle.descriptions");
  useDocumentTitle(title);

  const error = useAppSelector(selectDescriptionsError);

  useDescriptionsWithTranslateLoad();

  return (
    <div>
      <div className={"relative"}>
        <h1 className={"p-4 text-3xl"}>{title}</h1>
        {/*<EditDescription
          className={"absolute right-[5%] top-[calc(50%-20px)]"}
          editDescriptionId={editDescriptionId}
          resetEdit={() => setEditDescriptionId(0)}
        />*/}
      </div>
      {error !== "" ? (
        <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
      ) : null}
      <DescriptionsList />
      <DescriptionsListPagination />
    </div>
  );
};
