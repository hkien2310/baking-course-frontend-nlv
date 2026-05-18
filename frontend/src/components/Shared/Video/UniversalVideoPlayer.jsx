import React, { useState, useEffect } from 'react';
import './UniversalVideoPlayer.css';

const UniversalVideoPlayer = ({ url, fallbackThumb = '', className = '', style = {} }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoData, setVideoData] = useState(null);

  useEffect(() => {
    if (!url) return;

    // 1. Check YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtube-nocookie\.com\/embed\/|youtu\.be\/)([\w-]+)/);
    if (ytMatch) {
      setVideoData({
        type: 'youtube',
        id: ytMatch[1],
        thumb: `https://i.ytimg.com/vi/${ytMatch[1]}/maxresdefault.jpg`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1&showinfo=0&disablekb=1`
      });
      return;
    }

    // 2. Check Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      setVideoData({
        type: 'vimeo',
        id: vimeoMatch[1],
        thumb: fallbackThumb || '', // Will fetch below or use fallback
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&title=0&byline=0&portrait=0`
      });
      
      // Try to fetch vimeo thumbnail asynchronously
      fetch(`https://vimeo.com/api/v2/video/${vimeoMatch[1]}.json`)
        .then(res => res.json())
        .then(data => {
          if (data && data[0] && data[0].thumbnail_large) {
            setVideoData(prev => ({ ...prev, thumb: data[0].thumbnail_large }));
          }
        })
        .catch(err => console.log('Vimeo thumb fetch error:', err));
      return;
    }

    // 3. Google Drive / Others
    // Fallback embed URL mapping
    let embedUrl = url;
    let driveId = null;
    
    const gDriveFolderMatch = url.match(/drive\.google\.com\/drive\/folders\/([\w-]+)/);
    if (gDriveFolderMatch) {
      driveId = gDriveFolderMatch[1];
      embedUrl = `https://drive.google.com/embeddedfolderview?id=${driveId}#grid`;
    }

    const gDriveFileMatch = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    if (gDriveFileMatch) {
      driveId = gDriveFileMatch[1];
      embedUrl = `https://drive.google.com/file/d/${driveId}/preview`;
    }

    const gDriveOpenMatch = url.match(/drive\.google\.com\/open\?id=([\w-]+)/);
    if (gDriveOpenMatch) {
      driveId = gDriveOpenMatch[1];
      embedUrl = `https://drive.google.com/file/d/${driveId}/preview`;
    }

    setVideoData({
      type: 'other',
      embedUrl: embedUrl,
      thumb: driveId ? `https://drive.google.com/thumbnail?id=${driveId}&sz=w1280-h720` : (fallbackThumb || null)
    });

  }, [url, fallbackThumb]);

  if (!url || !videoData) return null;

  const hasFacade = videoData.thumb || videoData.type === 'other' || fallbackThumb;

  // Render Facade UI if not playing and we support a facade
  if (!isPlaying && hasFacade) {
    return (
      <div
        className={`uvp-container uvp-facade ${className}`}
        style={style}
        onClick={() => setIsPlaying(true)}
      >
        {videoData.thumb ? (
          <img
            src={videoData.thumb}
            alt="Video thumbnail"
            className="uvp-thumb"
            style={{ display: 'block', margin: 0, padding: 0 }}
            onError={(e) => {
              if (videoData.type === 'youtube' && !e.target.dataset.fallback) {
                e.target.dataset.fallback = 'true';
                e.target.src = `https://i.ytimg.com/vi/${videoData.id}/hqdefault.jpg`;
              } else {
                // If drive or fallback fails, hide image and show background
                e.target.style.display = 'none';
                e.target.parentElement.classList.add('uvp-placeholder-active');
              }
            }}
          />
        ) : (
          <div className="uvp-placeholder"></div>
        )}
        {/* Placeholder gradient will show under the image if it breaks, or standalone */}
        <div className="uvp-placeholder" style={{ zIndex: -1 }}></div>

        <div className="uvp-play-button">
          <svg viewBox="0 0 68 48" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path className="uvp-play-bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"></path>
            <path className="uvp-play-icon" d="M 45,24 27,14 27,34"></path>
          </svg>
        </div>
      </div>
    );
  }

  // Render the actual iframe once playing (or immediately if no thumbnail supported)
  return (
    <div className={`uvp-container ${className}`} style={style}>
      <iframe
        src={videoData.embedUrl}
        className="uvp-iframe"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        frameBorder="0"
        title="Video player"
      ></iframe>
    </div>
  );
};

export default UniversalVideoPlayer;
