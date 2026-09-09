import React, { createContext, useContext, useState, useEffect } from 'react';

interface DataSaverContextType {
  dataSaverMode: boolean;
  setDataSaverMode: (enabled: boolean) => void;
  networkType: string;
  isSlowConnection: boolean;
}

const DataSaverContext = createContext<DataSaverContextType | undefined>(undefined);

export const DataSaverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataSaverMode, setDataSaverModeState] = useState(false);
  const [networkType, setNetworkType] = useState('unknown');
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dataSaverMode');
    if (saved !== null) {
      setDataSaverModeState(JSON.parse(saved));
    }
  }, []);

  // Monitor network conditions
  useEffect(() => {
    const updateNetworkInfo = () => {
      // @ts-ignore - navigator.connection is experimental
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        setNetworkType(effectiveType);
        
        // Auto-enable data saver on slow connections (2G, slow-2g)
        const slowTypes = ['slow-2g', '2g'];
        const isSlow = slowTypes.includes(effectiveType);
        setIsSlowConnection(isSlow);
        
        // Auto-enable data saver on very slow connections
        if (isSlow && !localStorage.getItem('dataSaverMode')) {
          setDataSaverModeState(true);
        }
      }
    };

    updateNetworkInfo();

    // Listen for connection changes
    // @ts-ignore
    const connection = navigator.connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
      return () => connection.removeEventListener('change', updateNetworkInfo);
    }
  }, []);

  const setDataSaverMode = (enabled: boolean) => {
    setDataSaverModeState(enabled);
    localStorage.setItem('dataSaverMode', JSON.stringify(enabled));
  };

  return (
    <DataSaverContext.Provider value={{
      dataSaverMode,
      setDataSaverMode,
      networkType,
      isSlowConnection
    }}>
      {children}
    </DataSaverContext.Provider>
  );
};

export const useDataSaver = () => {
  const context = useContext(DataSaverContext);
  if (context === undefined) {
    // Provide fallback values instead of throwing error to prevent app crashes
    console.warn('useDataSaver called outside DataSaverProvider, using fallback values');
    return {
      dataSaverMode: false,
      setDataSaverMode: () => {},
      networkType: 'unknown',
      isSlowConnection: false
    };
  }
  return context;
};