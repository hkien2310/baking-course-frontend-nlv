import React from 'react';

const TikTokIcon = ({ className = '', size = 16 }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.236V2h-3.193v12.766c0 1.822-1.423 3.348-3.245 3.402a3.35 3.35 0 0 1-3.454-3.35 3.35 3.35 0 0 1 3.35-3.35c.298 0 .584.043.857.119V8.336a6.73 6.73 0 0 0-.857-.055A6.542 6.542 0 0 0 2.734 14.82a6.542 6.542 0 0 0 6.543 6.543 6.542 6.542 0 0 0 6.543-6.543V8.356a7.95 7.95 0 0 0 4.77 1.594V6.757a4.765 4.765 0 0 1-1.001-.071Z" />
    </svg>
  );
};

export default TikTokIcon;
