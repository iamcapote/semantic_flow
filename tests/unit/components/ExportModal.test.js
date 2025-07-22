
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExportModal from '../../../src/components/ExportModal.jsx';
import TestTRPCProvider from '../../setup/TestTRPCProvider.jsx';

describe('ExportModal', () => {
  it('renders ExportModal UI', () => {
    render(
      <TestTRPCProvider>
        <ExportModal workflow={{ nodes: [], edges: [] }} trigger={<button>Export</button>} />
      </TestTRPCProvider>
    );
    expect(screen.getByText(/Export/i)).toBeInTheDocument();
  });
});
