import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSiteConfig } from '../services/api';

const SiteConfigContext = createContext();

export const useSiteConfig = () => {
  return useContext(SiteConfigContext);
};

export const SiteConfigProvider = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getSiteConfig();
        setSiteConfig(config);
      } catch (error) {
        console.error("Failed to load site config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Update context dynamically if admin updates it
  const updateConfig = (newConfig) => {
    setSiteConfig(newConfig);
  };

  return (
    <SiteConfigContext.Provider value={{ siteConfig, updateConfig }}>
      {loading ? (
        <div className="text-center" style={{ padding: '150px 0' }}>
          <h2>Đang tải dữ liệu...</h2>
          <div className="spinner-border" role="status"></div>
        </div>
      ) : children}
    </SiteConfigContext.Provider>
  );
};
