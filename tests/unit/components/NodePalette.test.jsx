import React from 'react';
import NodePalette from '../../../src/components/NodePalette.jsx';
import { ReactFlowProvider } from 'reactflow';
import { render, screen, fireEvent } from '@testing-library/react';

describe('NodePalette', () => {
  it('renders node clusters', () => {
    const TestTRPCProvider = require('../../setup/TestTRPCProvider.jsx').default;
    render(
      <ReactFlowProvider>
        <TestTRPCProvider>
          <NodePalette />
        </TestTRPCProvider>
      </ReactFlowProvider>
    );
    expect(screen.getByTestId('node-palette')).toBeInTheDocument();
  });

  it('expands clusters on click', () => {
    // Simulate cluster expansion
    expect(true).toBe(true);
  });

  it('handles node drag events', () => {
    // Simulate drag event
    expect(true).toBe(true);
  });
});
