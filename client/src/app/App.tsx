import { AppProvider } from "./providers";
import { Routes, Route } from "react-router-dom";
import { MainPage } from "@pages/main";
import { NotFoundPage } from "@pages/404";
import { TestPage } from "@pages/test";
import { AboutPage } from "@pages/about/AboutPage.tsx";
import { ContactsPage } from "@pages/contacts/ContactsPage.tsx";
import { Navigation } from "@widgets/navigation";
import { AnalyzesPage } from "@pages/analyzes/AnalyzesPage.tsx";

function App() {
  return (
    <AppProvider>
      <div className="app">
        <Navigation />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/analyzes" element={<AnalyzesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </AppProvider>
  );
}

export default App;
