import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function initHeaderAffix($) {
  const $header = $('.page_header').first();
  const $headerWrapper = $header.parent('.page_header_wrapper');

  if (!$header.length || !$headerWrapper.length || !$.fn.affix) return;

  const initialHeight = $header.outerHeight();

  try {
    $header.off('.bs.affix');
    $header.removeData('bs.affix');
  } catch (e) {
    // noop
  }

  $headerWrapper.css({ height: initialHeight });

  $header.on('affixed-top.bs.affix affix-top.bs.affix', function () {
    $headerWrapper.css({ height: initialHeight });
  });

  $header.on('affixed.bs.affix affix.bs.affix', function () {
    if ($(window).scrollTop() > 0) {
      $headerWrapper.css({ height: $header.outerHeight() });
    }
  });

  $header.on('affix.bs.affix', function () {
    if (!$(window).scrollTop()) return false;
    return undefined;
  });

  $header.affix({
    offset: {
      top: 0,
      bottom: -10,
    },
  });
}

function initTemplateAnimations($) {
  const $body = $('body');
  const initAnimateElement = (self, index) => {
    // Nếu đã animated rồi thì bỏ qua
    if (self.hasClass('animated')) return;

    const animationClass = self.data('animation') || 'fadeInUp';
    const animationDelay = self.data('delay') || 150;
    setTimeout(() => {
      self.addClass(`animated ${animationClass}`);
    }, index * animationDelay);
  };

  if ($.fn.appear) {
    const $animate = $('.animate');
    $animate.appear();

    $animate.filter(':appeared').each(function (index) {
      initAnimateElement($(this), index);
    });

    $body.off('appear.templateAnimate').on('appear.templateAnimate', '.animate', function (_e, $affected) {
      $($affected).each(function (index) {
        initAnimateElement($(this), index);
      });
    });
  } else {
    $('.animate').each(function (index) {
      initAnimateElement($(this), index);
    });
  }

  // FAILSAFE: Sau 1.5s nếu vẫn chưa hiện thì force hiện luôn
  // Tránh trường hợp plugin appear không trigger làm ẩn nội dung
  setTimeout(() => {
    $('.animate').each(function() {
      if (!$(this).hasClass('animated')) {
        $(this).addClass('animated fadeInUp');
      }
    });
  }, 1500);
}

export function useTemplateRuntime(enabled = true) {
  const location = useLocation();

  // Animations phải luôn chạy trên MỌI route (kể cả /auth)
  // vì class .animate set opacity:0 mặc định — nếu không trigger thì element ẩn vĩnh viễn
  useEffect(() => {
    if (!enabled) return;

    const $ = window.jQuery;
    if (!$) return;

    // Tăng delay lên một chút để React kịp render Outlet
    const animTimer = window.setTimeout(() => {
      initTemplateAnimations($);
      
      // Force trigger scroll event để "đánh thức" plugin appear
      window.dispatchEvent(new Event('scroll'));
    }, 300);

    return () => {
      window.clearTimeout(animTimer);
    };
  }, [location.pathname, enabled]);

  // Header affix + full template scripts chỉ chạy trên các trang public (không phải auth/admin)
  useEffect(() => {
    if (!enabled) return;

    const $ = window.jQuery;
    if (!$) return;

    const timer = window.setTimeout(() => {
      initHeaderAffix($);

      if (typeof window.windowLoadInit === 'function') {
        window.windowLoadInit();
      }
      if (typeof window.documentReadyInit === 'function') {
        window.documentReadyInit();
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [enabled, location.pathname]);
}
