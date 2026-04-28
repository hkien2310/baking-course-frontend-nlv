import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { useTemplateRuntime } from '../hooks/useTemplateRuntime';
import { useSiteConfig } from '../context/SiteConfigContext';

const PublicLayout = () => {
  useTemplateRuntime();
  const location = useLocation();
  const { ready } = useSiteConfig();
  const isAuthRoute = location.pathname === '/auth';
  const shouldHoldForConfig = !ready && !isAuthRoute;

  if (shouldHoldForConfig) {
    return (
      <div id="canvas">
        <div id="box_wrapper">
          <div className="preloader">
            <div className="preloader_image"></div>
          </div>
        </div>
      </div>
    );
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
