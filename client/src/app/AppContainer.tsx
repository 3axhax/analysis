import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { InfoModal } from "@features/infoModal";
import { Navigation } from "@widgets/navigation";
import { NotFoundPage } from "@pages/404";
import { TestPage } from "@pages/test";
import { AboutPage } from "@pages/about";
import { ContactsPage } from "@pages/contacts";
import { AnalysisPage } from "@pages/analysis";
import { AnalysisResultPage } from "@pages/analysisResult";
import { LogoutPage } from "@pages/logout";
import { checkLSUser, selectIsUserAdmin } from "@entities/user";
import { TranslationsPage } from "@pages/Admin/translations";
import { UnitsPage } from "@pages/Admin/units";
import { AgesPage } from "@pages/Admin/ages";
import { AnalysisPointsPage } from "@pages/Admin/analysisPoints";
import { DescriptionsPage } from "@pages/Admin/descriptions";
import { AnalysisTypePage } from "@pages/Admin/analysisType";
import { PoliticsAgreementBlock } from "@features/politicsAgreementBlock";
import { ConsentPersonalData } from "@pages/consentPersonalData";
import { PolicyPersonalData } from "@pages/policyPersonalData";
import { Basement } from "@pages/basement";

function AppContainer() {
  const dispatch = useAppDispatch();
  const isUserAdmin = useAppSelector(selectIsUserAdmin);
  const acceptYm = localStorage.getItem("accept_ym");

  useEffect(() => {
    dispatch(checkLSUser());
  }, [dispatch]);

  return (
    <div className="page">
      <Navigation />
      <Routes>
        <Route path="/" element={<AnalysisPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/result/:resultId" element={<AnalysisResultPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route
          path="/consent-personal-data"
          element={<ConsentPersonalData />}
        />
        <Route path="/privacy-policy" element={<PolicyPersonalData />} />
        {isUserAdmin && (
          <>
            <Route path="/admin/translations" element={<TranslationsPage />} />
            <Route path="/admin/units" element={<UnitsPage />} />
            <Route path="/admin/ages" element={<AgesPage />} />
            <Route path="/admin/descriptions" element={<DescriptionsPage />} />
            <Route
              path="/admin/analysisPoints"
              element={<AnalysisPointsPage />}
            />
            <Route path="/admin/analysisType" element={<AnalysisTypePage />} />
          </>
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Basement />
      <InfoModal />
      {!acceptYm && <PoliticsAgreementBlock />}
    </div>
  );
}

export default AppContainer;
