import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClearSessionButton from '../../src/components/ClearSessionButton.jsx';
import NodePalette from '../../src/components/NodePalette.jsx';
import SemanticNode from '../../src/components/SemanticNode.jsx';

// Mock NodeEnhancementModal to avoid async useEffect state updates during simple render tests
jest.mock('../../src/components/NodeEnhancementModal.jsx', () => () => null);

// ClearSessionButton
describe('ClearSessionButton', () => {
  it('renders and clears sessionStorage on click', () => {
    sessionStorage.setItem('api_key_openai', 'test-key');
    render(<ClearSessionButton onSessionCleared={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    expect(sessionStorage.getItem('api_key_openai')).toBeNull();
  });
});

// NodePalette
describe('NodePalette', () => {
  it('renders search input and clusters', () => {
    const { ReactFlowProvider } = require('reactflow');
    render(
      <ReactFlowProvider>
        <NodePalette onNodeDragStart={() => {}} />
      </ReactFlowProvider>
    );
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });
});

// SemanticNode
describe('SemanticNode', () => {
    it('renders with edit state for new node', () => {
      const { ReactFlowProvider } = require('reactflow');
      render(
        <ReactFlowProvider>
          <SemanticNode
            id="blank-1"
            data={{
              isNew: true,
              label: 'Blank Node',
              type: 'UTIL-BLANK',
              content: '',
              metadata: {},
              ports: {},
              config: {}
            }}
            isConnectable={true}
            selected={false}
            onNodeUpdate={() => {}}
          />
        </ReactFlowProvider>
      );
      expect(screen.getByTestId('semantic-node')).toBeInTheDocument();
    });
});
