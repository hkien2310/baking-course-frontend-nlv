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
        <div className="admin-loading-page">
          <div className="admin-loading-block">
            <div className="admin-loading-block-header" aria-hidden="true">
              <div className="admin-loading-heading-shell shimmer"></div>
              <div className="admin-inline-spinner" aria-hidden="true"></div>
            </div>
            <div className="admin-loading-table-shell" aria-hidden="true">
              <div className="admin-loading-table-head shimmer"></div>
              <div className="admin-loading-table-row shimmer"></div>
              <div className="admin-loading-table-row shimmer"></div>
              <div className="admin-loading-table-row shimmer"></div>
            </div>
          </div>
        </div>
      ) : children}
    </SiteConfigContext.Provider>
  );
};
