
import React from 'react';
import { render, screen } from '@testing-library/react';
// Removed deprecated MockTRPCProvider import
import { NodeTestingPanel } from '../../../src/components/NodeTestingPanel.jsx';

describe('NodeTestingPanel', () => {
  it('renders node testing panel UI', () => {
    const TestTRPCProvider = require('../../setup/TestTRPCProvider.jsx').default;
    render(
      <TestTRPCProvider>
        <NodeTestingPanel node={{ id: '1', type: 'PROP-STM' }} onTestResult={() => {}} />
      </TestTRPCProvider>
    );
    // There are multiple elements with 'Test Node', so use getAllByText and check at least one exists
    const testNodeElements = screen.getAllByText(/Test Node/i);
    expect(testNodeElements.length).toBeGreaterThan(0);
  });
});
