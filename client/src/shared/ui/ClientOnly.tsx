import { type ReactNode, Suspense, useSyncExternalStore } from "react";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

// The first hydration pass uses the same fallback as the static build.
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  return ready ? <Suspense fallback={fallback}>{children}</Suspense> : fallback;
}
