/**
 * Debug utility to detect and highlight elements that might be 
 * obstructing navigation click events
 */
export function detectOverlappingElements() {
  console.log('Scanning for elements overlapping the navigation...');
  
  // Get nav container (TopNav only)
  const navElement = document.querySelector('.w95-tabs');
  
  if (!navElement) {
    console.warn('Navigation element not found');
    return;
  }
  
  const navRect = navElement.getBoundingClientRect();
  console.log('Navigation bounds:', navRect);
  
  // Find all elements that might be overlapping
  const allElements = document.querySelectorAll('*');
  const overlapping = [];
  
  allElements.forEach(el => {
    if (el === navElement || navElement.contains(el)) return;
    
    const rect = el.getBoundingClientRect();
    
    // Check if element overlaps with nav
    if (!(rect.right < navRect.left || 
          rect.left > navRect.right || 
          rect.bottom < navRect.top || 
          rect.top > navRect.bottom)) {
      
      // Get computed style
      const style = window.getComputedStyle(el);
      
      // Check if element might be blocking events
      if (style.position === 'absolute' || 
          style.position === 'fixed' ||
          style.zIndex >= 999 ||
          style.pointerEvents !== 'none') {
        
        overlapping.push({
          element: el,
          tag: el.tagName,
          id: el.id,
          className: el.className,
          position: style.position,
          zIndex: style.zIndex,
          pointerEvents: style.pointerEvents
        });
        
        // Temporarily highlight the element
        const originalOutline = el.style.outline;
        el.style.outline = '2px solid red';
        
        setTimeout(() => {
          el.style.outline = originalOutline;
        }, 5000);
      }
    }
  });
  
  console.log('Potentially overlapping elements:', overlapping);
  return overlapping;
}

// Call this function in the browser console to debug:
// import { detectOverlappingElements } from './utils/debugNav';
// detectOverlappingElements();
