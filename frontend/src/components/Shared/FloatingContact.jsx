import React from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';

const FloatingContact = () => {
  const { siteConfig } = useSiteConfig();

  // Define contact links based on site config
  const phone = siteConfig?.contact?.phone?.replace(/\s+/g, '') || '0938561989';
  const zaloUrl = siteConfig?.socials?.zalo || `https://zalo.me/${phone}`;
  const messengerUrl = siteConfig?.socials?.messenger || 'https://m.me/hoclambanhonline';

  return (
    <div className="floating-contact-widget" style={{
      position: 'fixed',
      bottom: '100px',
      right: '25px',
      zIndex: 1045,
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }}>
      {/* Phone Button */}
      <a href={`tel:${phone}`} 
         className="contact-btn phone-btn"
         title="Gọi Hotline"
         style={{
           width: '50px', height: '50px',
           borderRadius: '50%', backgroundColor: '#00a651',
           display: 'flex', alignItems: 'center', justifyContent: 'center',
           color: 'white', fontSize: '24px',
           boxShadow: '0 4px 10px rgba(0, 166, 81, 0.4)',
           transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
         }}
         onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
         onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <i className="fa fa-phone" style={{ animation: 'ring 2s infinite ease-in-out' }}></i>
      </a>

      {/* Zalo Button */}
      <a href={zaloUrl} target="_blank" rel="noopener noreferrer"
         className="contact-btn zalo-btn"
         title="Chat Zalo"
         style={{
           width: '50px', height: '50px',
           borderRadius: '50%', backgroundColor: '#0068ff',
           display: 'flex', alignItems: 'center', justifyContent: 'center',
           color: 'white', fontSize: '14px', fontWeight: 'bold',
           boxShadow: '0 4px 10px rgba(0, 104, 255, 0.4)',
           transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
         }}
         onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
         onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {/* Simple text 'Zalo' if no icon available, but typically Zalo is text or custom image */}
        <span style={{ letterSpacing: '0.5px' }}>Zalo</span>
      </a>

      {/* Messenger Button */}
      <a href={messengerUrl} target="_blank" rel="noopener noreferrer"
         className="contact-btn messenger-btn"
         title="Chat Messenger"
         style={{
           width: '50px', height: '50px',
           borderRadius: '50%', backgroundColor: '#0084ff',
           display: 'flex', alignItems: 'center', justifyContent: 'center',
           color: 'white', fontSize: '26px',
           boxShadow: '0 4px 10px rgba(0, 132, 255, 0.4)',
           transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
         }}
         onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
         onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.923 1.488 5.518 3.824 7.21v3.532h-.006a.375.375 0 00.562.336l3.528-1.95a10.978 10.978 0 002.092.203c5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.096 12.58l-2.825-3.003-5.502 3.003 6.04-6.42 2.87 3.003 5.456-3.003-6.04 6.42z" />
        </svg>
      </a>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ring {
          0% { transform: rotate(0); }
          10% { transform: rotate(15deg); }
          20% { transform: rotate(-15deg); }
          30% { transform: rotate(15deg); }
          40% { transform: rotate(-15deg); }
          50% { transform: rotate(0); }
          100% { transform: rotate(0); }
        }
        @media (max-width: 768px) {
          .floating-contact-widget {
            bottom: 80px !important;
            right: 15px !important;
            gap: 12px !important;
          }
          .contact-btn {
            width: 45px !important;
            height: 45px !important;
          }
          .contact-btn i, .contact-btn svg { width: 20px !important; height: 20px !important; }
          .zalo-btn span { font-size: 12px !important; }
        }
      `}} />
    </div>
  );
};

export default FloatingContact;
