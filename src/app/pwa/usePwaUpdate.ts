import { useEffect, useRef, useState } from "preact/hooks";
import { registerSW } from "virtual:pwa-register";

export function usePwaUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const updateRef = useRef<(reload?: boolean) => void>(() => undefined);

  useEffect(() => {
    updateRef.current = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        setOfflineReady(true);
      },
    });
  }, []);

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker: () => updateRef.current(true),
    dismissUpdate: () => setNeedRefresh(false),
  };
}
