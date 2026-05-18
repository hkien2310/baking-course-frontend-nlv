import React from 'react';
import parse from 'html-react-parser';
import UniversalVideoPlayer from '../components/Shared/Video/UniversalVideoPlayer';

export const parseHtmlWithVideos = (html) => {
  if (!html) return null;
  
  // Clean up non-breaking spaces that prevent natural word wrapping
  const cleanHtml = html.replace(/&nbsp;/g, ' ');
  
  const mediaRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch|embed)|youtube-nocookie\.com\/(?:watch|embed)|youtu\.be|vimeo\.com|drive\.google\.com\/(?:file\/d\/|open\?id=))[\w\-?=&#%./]+)/gi;

  const options = {
    replace: (domNode) => {
      // 0. Fix Hydration Error: <p> cannot contain <div>
      // If a <p> tag contains a video, we mutate it to a <div> so UniversalVideoPlayer (which renders a div) is valid.
      if (domNode.name === 'p' && domNode.children) {
        const hasVideo = domNode.children.some(child => {
          if (child.name === 'a' && child.attribs && child.attribs.href && /(?:youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|drive\.google\.com)/i.test(child.attribs.href)) return true;
          if (child.name === 'iframe' && child.attribs && child.attribs.src && /(?:youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|drive\.google\.com)/i.test(child.attribs.src)) return true;
          if (child.type === 'text' && child.data) {
            const hasMatch = mediaRegex.test(child.data);
            mediaRegex.lastIndex = 0; // Reset regex state
            return hasMatch;
          }
          return false;
        });
        
        if (hasVideo) {
          domNode.name = 'div';
          domNode.attribs = { ...domNode.attribs, className: (domNode.attribs.className || '') + ' video-paragraph-wrapper' };
          // Do not return here. Mutating domNode.name allows the parser to render it as <div> while still processing its children!
        }
      }

      // 1. Process <a> tags
      if (domNode.name === 'a') {
        // If the href itself is a youtube link
        if (domNode.attribs && domNode.attribs.href && /(?:youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|drive\.google\.com)/i.test(domNode.attribs.href)) {
          return <UniversalVideoPlayer url={domNode.attribs.href} />;
        }
        // If it wraps an iframe deeply
        const findVideoUrl = (node) => {
          if (node.name === 'iframe' && node.attribs && node.attribs.src && /(?:youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|drive\.google\.com)/i.test(node.attribs.src)) {
            return node.attribs.src;
          }
          if (node.children) {
            for (let i = 0; i < node.children.length; i++) {
              const url = findVideoUrl(node.children[i]);
              if (url) return url;
            }
          }
          return null;
        };

        const videoUrl = findVideoUrl(domNode);
        if (videoUrl) {
          return <UniversalVideoPlayer url={videoUrl} />;
        }
      }

      // 2. Process existing <iframe class="ql-video">
      if (domNode.name === 'iframe' && domNode.attribs && domNode.attribs.src) {
        return <UniversalVideoPlayer url={domNode.attribs.src} />;
      }

      // 3. Process plain text URLs inside TextNodes
      if (domNode.type === 'text' && domNode.data) {
        const parent = domNode.parent;
        if (parent && ['a', 'iframe', 'script', 'style'].includes(parent.name)) return;

        if (mediaRegex.test(domNode.data)) {
          mediaRegex.lastIndex = 0;
          const parts = [];
          let lastIndex = 0;
          let match;
          while ((match = mediaRegex.exec(domNode.data)) !== null) {
            if (match.index > lastIndex) {
              parts.push(domNode.data.substring(lastIndex, match.index));
            }
            parts.push(<UniversalVideoPlayer key={match.index} url={match[0]} />);
            lastIndex = mediaRegex.lastIndex;
          }
          if (lastIndex < domNode.data.length) {
            parts.push(domNode.data.substring(lastIndex));
          }
          return <>{parts}</>;
        }
      }
    }
  };

  return parse(cleanHtml, options);
};
