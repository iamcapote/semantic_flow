
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfigurationModal from '../../../src/components/ConfigurationModal.jsx';
import TestTRPCProvider from '../../setup/TestTRPCProvider.jsx';

describe('ConfigurationModal', () => {
  it('renders configuration modal UI', () => {
    render(
      <TestTRPCProvider>
        <ConfigurationModal onSave={() => {}} currentConfig={{}} />
      </TestTRPCProvider>
    );
    expect(screen.getByText(/Configure/i)).toBeInTheDocument();
  });
});
