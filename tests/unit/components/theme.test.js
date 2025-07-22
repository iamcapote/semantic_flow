
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '../../../src/components/theme-provider.tsx';
import ThemeToggle from '../../../src/components/ThemeToggle.jsx';

describe('Theme Components', () => {
  it('renders ThemeProvider and ThemeToggle', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
  });
});
