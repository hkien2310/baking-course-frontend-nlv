import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { useTemplateRuntime } from '../hooks/useTemplateRuntime';
import { useSiteConfig } from '../context/SiteConfigContext';

const PublicLayout = () => {
  const location = useLocation();
  const { ready } = useSiteConfig();
  const isAuthRoute = location.pathname === '/auth';
  const isAdminPath = location.pathname.startsWith('/admin');
  const shouldRunTemplateRuntime = !isAuthRoute && !isAdminPath;

  useTemplateRuntime(shouldRunTemplateRuntime);

  const shouldHoldForConfig = !ready && !isAuthRoute;

  if (shouldHoldForConfig) {
    return null;
  }

  return (
    <div id="canvas">
      <div id="box_wrapper">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </div>
  );
};

export default PublicLayout;
