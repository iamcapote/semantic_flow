import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LabCanvas from '../../../src/components/LabCanvas.jsx';
import { ReactFlowProvider } from 'reactflow';
import TestTRPCProvider from '../../setup/TestTRPCProvider.jsx';

describe('LabCanvas', () => {
  it('renders LabCanvas UI', () => {
    render(
      <ReactFlowProvider>
        <TestTRPCProvider>
          <LabCanvas workflow={{ nodes: [], edges: [] }} onWorkflowChange={() => {}} onExecuteWorkflow={() => {}} />
        </TestTRPCProvider>
      </ReactFlowProvider>
    );
    expect(screen.getByTestId('rf__wrapper')).toBeInTheDocument();
  });
});
