import { createContext, useContext } from "react";

const ConfigContext = createContext();

export const ConfigProvider = ({ env, config, children }) => {
  return (
    <ConfigContext.Provider value={{ env, config }}>
      {children}
    </ConfigContext.Provider>
  );
};

// 👇 Hook to access config anywhere
export const useConfig = () => useContext(ConfigContext);
