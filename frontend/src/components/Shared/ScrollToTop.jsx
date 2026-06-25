import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Basic native scroll to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto' // 'auto' ensures immediate scroll, bypassing smooth scroll which can conflict with legacy jQuery
    });

    // Also dispatch a custom event or trigger jQuery doc ready if the theme requires layout recalculation
    // The YumSaigon theme calculates header height natively on load. If it's broken, firing a fake resize event helps.
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
