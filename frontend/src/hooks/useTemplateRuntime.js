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
}

export function useTemplateRuntime(enabled = true) {
  const location = useLocation();

  useEffect(() => {
    if (!enabled) return;

    const $ = window.jQuery;
    if (!$) return;

    const timer = window.setTimeout(() => {
      initHeaderAffix($);
      initTemplateAnimations($);

      if (typeof window.windowLoadInit === 'function') {
        window.windowLoadInit();
      }
      if (typeof window.documentReadyInit === 'function') {
        window.documentReadyInit();
      }
    }, 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, [enabled, location.pathname]);
}
