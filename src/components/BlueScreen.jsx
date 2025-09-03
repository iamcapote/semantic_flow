import React from 'react';

// Classic blue screen of desktop-only notice
// Renders full-screen, no interactivity, just guidance to use >=1024px
const BlueScreen = () => {
  return (
    <div
      data-testid="desktop-required-bsod"
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0000AA',
        color: '#FFFFFF',
        zIndex: 999999,
        fontFamily: "Consolas, 'Lucida Console','Courier New', monospace",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Subtle scanlines overlay */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.06,
          pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 1px, rgba(0,0,0,0) 1px)',
          backgroundSize: '2px 2px',
        }}
      />

      <div style={{ padding: '48px 32px', maxWidth: 1100 }}>
        <div style={{ fontSize: 160, lineHeight: 1, marginBottom: 24 }}>:(</div>

        <div style={{ fontSize: 32, marginBottom: 12 }}>
          Semantic Flow encountered a display constraint and stopped.
        </div>
        <div style={{ fontSize: 20 }}>
          React Flow requires a desktop-class viewport. Please use a screen width of ≥ 1024px.
        </div>

        <div style={{ height: 16 }} />

        <div style={{ fontSize: 20 }}>
          If you are on mobile, enable "Desktop site", rotate to landscape, or open on a desktop device.
        </div>
        <div style={{ fontSize: 20 }}>
          Semantic Flow is optimized for desktop use. You must use the desktop version.
        </div>

        <div style={{ height: 24 }} />

        <div style={{ fontSize: 20 }}>
          STOP CODE: VIEWPORT_TOO_SMALL &nbsp;&nbsp; ERR: WIDTH_LT_1024
        </div>
        <div style={{ fontSize: 16, opacity: 0.9 }}>
          Session: /app/semantic-flow · Engine: React-Flow (disabled)
        </div>

        <div style={{ height: 40 }} />

        <div style={{ fontSize: 20 }}>
          Try again after resizing the window to at least 1024px, or revisit on a desktop display.
        </div>
        <div style={{ fontSize: 20 }}>
          For assistance, refresh after resizing or contact your administrator.
        </div>

        {/* Blinking cursor line */}
        <div style={{ height: 48 }} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <div style={{ fontSize: 20 }}>Stand by</div>
          <div
            aria-hidden
            style={{
              width: 12,
              height: 24,
              background: '#FFFFFF',
              animation: 'blink 1s steps(1,end) infinite',
            }}
          />
        </div>
      </div>

      {/* Inline keyframes for blink */}
      <style>{`
        @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
      `}</style>
    </div>
  );
};

export default BlueScreen;
