'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ConnectionStatus, DeviceInfo } from '@/lib/types/hband.types';

interface HbandConnectionState {
  status: ConnectionStatus;
  device: DeviceInfo | null;
  error: string | null;
}

interface HbandConnectionContextValue extends HbandConnectionState {
  setStatus: (status: ConnectionStatus) => void;
  setDevice: (device: DeviceInfo | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: HbandConnectionState = {
  status: 'disconnected',
  device: null,
  error: null,
};

const HbandConnectionContext = createContext<HbandConnectionContextValue | null>(null);

export function HbandConnectionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<HbandConnectionState>(initialState);

  const setStatus = useCallback((status: ConnectionStatus) => {
    setState((s) => ({ ...s, status, error: null }));
  }, []);

  const setDevice = useCallback((device: DeviceInfo | null) => {
    setState((s) => ({ ...s, device }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((s) => ({ ...s, error }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const value = useMemo<HbandConnectionContextValue>(
    () => ({ ...state, setStatus, setDevice, setError, reset }),
    [state, setStatus, setDevice, setError, reset]
  );

  return (
    <HbandConnectionContext.Provider value={value}>
      {children}
    </HbandConnectionContext.Provider>
  );
}

export function useHbandConnection() {
  const ctx = useContext(HbandConnectionContext);
  if (!ctx) {
    throw new Error('useHbandConnection must be used within HbandConnectionProvider');
  }
  return ctx;
}
