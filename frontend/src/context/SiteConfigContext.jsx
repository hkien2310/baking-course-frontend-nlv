import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSiteConfig } from '../services/api';

const DEFAULT_SITE_CONFIG = {
  name: '',
  logoText: '',
  logoDot: '.',
  description: '',
  contact: {},
  socials: {},
  footer: {},
  about: { historyParagraphs: [], historyFeatures: [], achievements: [] }
};

const SiteConfigContext = createContext();

export const useSiteConfig = () => {
  return useContext(SiteConfigContext);
};

export const SiteConfigProvider = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState(DEFAULT_SITE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getSiteConfig();
        setSiteConfig(config);
      } catch (error) {
        console.error('Failed to load site config:', error);
      } finally {
        setLoading(false);
        setReady(true);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-site-config-ready', ready ? 'true' : 'false');
  }, [ready]);

  const updateConfig = (newConfig) => {
    setSiteConfig(newConfig);
  };

  return (
    <SiteConfigContext.Provider value={{ siteConfig, updateConfig, loading, ready }}>
      {children}
    </SiteConfigContext.Provider>
  );
};
