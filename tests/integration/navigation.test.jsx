import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TopNav95Plus from '../../src/components/TopNav95Plus';

const mockSections = [
  { id: 'builder', label: 'Builder', href: '/builder' },
  { id: 'ide', label: 'IDE', href: '/ide' },
  { id: 'console', label: 'Console', href: '/console' },
  { id: 'api', label: 'Router', href: '/api' },
  { id: 'chat', label: 'Chat', href: '/chat' },
];

function renderNavigation(props = {}) {
  const defaultProps = {
    appTitle: 'Semantic Flow — The Core Layer for Composable Inference',
    iconSrc: '/logo.svg',
    sections: mockSections,
    activeId: 'builder',
    onSelect: jest.fn(),
    ...props,
  };

  return render(
    <BrowserRouter>
      <TopNav95Plus {...defaultProps} />
    </BrowserRouter>
  );
}

describe('TopNav95Plus Navigation', () => {
  test('renders title and all navigation tabs', () => {
    renderNavigation();
    
    // Check title
  expect(screen.getByText('Semantic Flow — The Core Layer for Composable Inference')).toBeInTheDocument();
    
    // Check all tabs are rendered
    expect(screen.getByRole('tab', { name: 'Builder' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'IDE' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Console' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'Router' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Chat' })).toBeInTheDocument();
  });

  test('marks active tab correctly', () => {
    renderNavigation({ activeId: 'ide' });
    
    const ideTab = screen.getByRole('tab', { name: 'IDE' });
    const builderTab = screen.getByRole('tab', { name: 'Builder' });
    
    expect(ideTab).toHaveAttribute('aria-selected', 'true');
    expect(builderTab).toHaveAttribute('aria-selected', 'false');
  });

  test('calls onSelect when tab is clicked', () => {
    const mockOnSelect = jest.fn();
    renderNavigation({ onSelect: mockOnSelect });
    
    const consoleTab = screen.getByRole('tab', { name: 'Console' });
    fireEvent.click(consoleTab);
    
    expect(mockOnSelect).toHaveBeenCalledWith('console');
  });

  test('has proper ARIA structure', () => {
    renderNavigation();
    
    // Check tablist
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-label', 'Primary');
    
    // Check all tabs have proper ARIA attributes
    const tabs = screen.getAllByRole('tab');
  expect(tabs).toHaveLength(5);
    
    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('aria-selected');
      expect(tab).toHaveAttribute('aria-disabled', 'false');
    });
  });

  test('navigation has correct CSS classes and structure', () => {
    renderNavigation();
    
    // Check navigation container
    const navContainer = screen.getByRole('navigation');
    expect(navContainer).toHaveClass('nav-container');
    
    // Check tablist has correct class
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveClass('w95-tabs');
    
    // Check tabs have correct classes
    const activeTab = screen.getByRole('tab', { name: 'Builder' });
    expect(activeTab).toHaveClass('tab', 'is-active');
    
    const inactiveTab = screen.getByRole('tab', { name: 'IDE' });
    expect(inactiveTab).toHaveClass('tab');
    expect(inactiveTab).not.toHaveClass('is-active');
  });
});
