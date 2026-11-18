import { lazy, Suspense } from "react";
import "./App.css";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
import { LoadingProvider } from "./context/LoadingProvider";
import { ExperienceProvider } from "./context/ExperienceProvider";
import OverlayRoot from "./components/overlays/OverlayRoot";
import ErrorBoundary from "./components/ErrorBoundary";
import SceneFallback from "./components/SceneFallback";

const App = () => {
  return (
    <ExperienceProvider>
      <LoadingProvider>
        <ErrorBoundary fallback={<SceneFallback />}>
          <Suspense>
            <MainContainer>
              <ErrorBoundary fallback={<SceneFallback />}>
                <Suspense>
                  <CharacterModel />
                </Suspense>
              </ErrorBoundary>
            </MainContainer>
          </Suspense>
        </ErrorBoundary>
      </LoadingProvider>
      <OverlayRoot />
    </ExperienceProvider>
  );
};

export default App;
