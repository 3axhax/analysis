import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { createMetricaTracker, METRICA_CONSENT_EVENT } from '@shared/config/metrica';

export const Metrica = () => {
  const location = useLocation();
  const tracker = useRef<ReturnType<typeof createMetricaTracker> | null>(null);
  useEffect(() => {
    const instance = createMetricaTracker(window, document);
    tracker.current = instance;
    window.addEventListener(METRICA_CONSENT_EVENT, instance.update);
    window.addEventListener('storage', instance.update);
    instance.update();
    return () => {
      window.removeEventListener(METRICA_CONSENT_EVENT, instance.update);
      window.removeEventListener('storage', instance.update);
      instance.stop();
      tracker.current = null;
    };
  }, []);
  useEffect(() => { tracker.current?.update(); }, [location]);
  return null;
};
