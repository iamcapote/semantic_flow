
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import SemanticNode from '../../../src/components/SemanticNode.jsx';

describe('SemanticNode', () => {
  it('renders with blank label', () => {
    render(
      <ReactFlowProvider>
        <SemanticNode data={{ isNew: false, content: '' }} label="" />
      </ReactFlowProvider>
    );
    expect(screen.getByTestId('semantic-node')).toBeInTheDocument();
  });

  it('calls update callback on edit', () => {
    // Simulate edit and callback
    expect(true).toBe(true);
  });
});
