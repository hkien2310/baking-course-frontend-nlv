export const getSocialIconClass = (platform) => {
  switch (platform) {
    case 'facebook':
      return 'fa-facebook';
    case 'instagram':
      return 'fa-instagram';
    case 'tiktok':
      return 'fa-music';
    case 'youtube':
      return 'fa-youtube-play';
    default:
      return 'fa-link';
  }
};

export const getSocialLinkClass = (platform) => `social-link social-link-${platform}`;
