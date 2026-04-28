import React from 'react';
import TikTokIcon from './TikTokIcon';
import { getSocialIconClass, getSocialLinkClass } from '../../utils/socialIcon';

const SocialIconLink = ({ platform, href, title, className = '' }) => {
  if (!href || href === '#') return null;

  const classes = `bg-icon border-icon mr-2 social-link ${getSocialLinkClass(platform)} ${className}`.trim();

  return (
    <a href={href} className={classes} title={title || platform} target="_blank" rel="noopener noreferrer">
      <span className="social-icon-inner" aria-hidden="true">
        {platform === 'tiktok' ? (
          <TikTokIcon className="social-icon-svg social-icon-tiktok" size={14} />
        ) : (
          <i className={`fa ${getSocialIconClass(platform)}`}></i>
        )}
      </span>
    </a>
  );
};

export default SocialIconLink;
