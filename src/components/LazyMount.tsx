import { PropsWithChildren, ReactNode, useEffect, useRef, useState } from "react";

/**
 * Mounts children only once the placeholder nears the viewport, so heavy chunks
 * (3D + physics) are never downloaded by visitors who do not scroll that far.
 * Skipped entirely on Save-Data connections.
 */
const LazyMount = ({
  fallback,
  margin = "900px",
  children,
}: PropsWithChildren<{ fallback: ReactNode; margin?: string }>) => {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;

  useEffect(() => {
    if (saveData || show || !ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: `${margin} 0px` }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [show, saveData, margin]);

  if (show) return <>{children}</>;
  return <div ref={ref}>{fallback}</div>;
};

export default LazyMount;
