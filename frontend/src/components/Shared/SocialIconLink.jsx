import React from 'react';
import TikTokIcon from './TikTokIcon';
import { getSocialIconClass, getSocialLinkClass } from '../../utils/socialIcon';

const SocialIconLink = ({ platform, href, title, className = '' }) => {
  if (!href || href === '#') return null;

  const classes = `bg-icon border-icon mr-2 social-link ${getSocialLinkClass(platform)} ${className}`.trim();

  return (
    <a href={href} className={classes} title={title || platform} target="_blank" rel="noopener noreferrer">
      {platform === 'tiktok' ? (
        <TikTokIcon className="social-icon-svg social-icon-tiktok" size={16} />
      ) : (
        <i className={`fa ${getSocialIconClass(platform)}`}></i>
      )}
    </a>
  );
};

export default SocialIconLink;
