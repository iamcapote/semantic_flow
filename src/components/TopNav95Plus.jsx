import React from 'react';
import { Link } from 'react-router-dom';

// Simplified Win95-style navigation that actually works
// Props:
// - appTitle: string
// - iconSrc: string
// - sections: Array<{ id: string, label: string, href: string }>
// - activeId: string
// - onSelect: (id: string) => void
export default function TopNav95Plus({ appTitle = 'Semantic Flow', iconSrc = '/logo.svg', sections = [], activeId, onSelect }) {
	return (
		<div className="w95-font nav-container" role="navigation" aria-label="Application top bar" style={{ position: 'relative', zIndex: 1000 }}>
			{/* Title bar */}
			<header className="w95-title">
				<div className="left">
					<img src={iconSrc} alt="" className="w95-icon" width={16} height={16} />
					<span>{appTitle}</span>
				</div>
				<div className="caps">
					<button className="cap min" aria-label="Minimize"></button>
					<button className="cap max" aria-label="Maximize"></button>
					<button className="cap close" aria-label="Close"></button>
				</div>
			</header>

			{/* Navigation tabs */}
			<nav 
				className="w95-tabs" 
				role="tablist" 
				aria-label="Primary" 
				style={{ 
					position: 'relative', 
					pointerEvents: 'auto', 
					zIndex: 1000 
				}}
			>
				{sections.map(section => (
					<Link
						key={section.id}
						data-sec-id={section.id}
						className={`tab ${activeId === section.id ? 'is-active' : ''}`}
						role="tab"
						aria-selected={activeId === section.id ? 'true' : 'false'}
						aria-disabled="false"
						href={section.href}
						to={section.href}
						style={{ 
							pointerEvents: 'auto', 
							position: 'relative', 
							cursor: 'pointer' 
						}}
						onClick={(e) => {
							e.preventDefault(); // Prevent default link navigation
							onSelect && onSelect(section.id);
						}}
					>
						{section.label}
					</Link>
				))}
			</nav>
		</div>
	);
}
