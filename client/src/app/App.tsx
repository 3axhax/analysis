import { AppProvider } from "./providers";
import AppContainer from "@app/AppContainer.tsx";
import type { ArticleCatalog } from "@shared/catalog/article-catalog";

function App({ initialCatalog }: { initialCatalog?: ArticleCatalog }) {
  return (
    <AppProvider>
      <AppContainer initialCatalog={initialCatalog} />
    </AppProvider>
  );
}

export default App;
