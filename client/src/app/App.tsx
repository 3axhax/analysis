import { AppProvider } from "./providers";
import { Routes, Route } from "react-router-dom";
import { MainPage } from "@pages/main";
import { NotFoundPage } from "@pages/404";
import { TestPage } from "@pages/test";
import { AboutPage } from "@pages/about/AboutPage.tsx";
import { ContactsPage } from "@pages/contacts/ContactsPage.tsx";
import { Navigation } from "@widgets/navigation";
import { AnalysisPage } from "@pages/analysis";
import { AnalysisResultPage } from "@pages/analysisResult";

function App() {
  return (
    <AppProvider>
      <div className="app">
        <Navigation />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/result/:resultId" element={<AnalysisResultPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </AppProvider>
  );
}

export default App;
