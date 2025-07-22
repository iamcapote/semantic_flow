
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Accordion } from '../../../src/components/ui/accordion.jsx';
import { AlertDialog } from '../../../src/components/ui/alert-dialog.jsx';
import { Card } from '../../../src/components/ui/card.jsx';
import { Calendar } from '../../../src/components/ui/calendar.jsx';
import { Table } from '../../../src/components/ui/table.jsx';
import { Tabs } from '../../../src/components/ui/tabs.jsx';
import { Progress } from '../../../src/components/ui/progress.jsx';
import { Skeleton } from '../../../src/components/ui/skeleton.jsx';

describe('UI Components', () => {
  it('renders Accordion', () => {
    render(<Accordion />);
  });
  it('renders AlertDialog', () => {
    render(<AlertDialog />);
  });
  it('renders Card', () => {
    render(<Card />);
  });
  it('renders Calendar', () => {
    render(<Calendar />);
  });
  it('renders Table', () => {
    render(<Table />);
  });
  it('renders Tabs', () => {
    render(<Tabs />);
  });
  it('renders Progress', () => {
    render(<Progress value={50} />);
  });
  it('renders Skeleton', () => {
    render(<Skeleton />);
  });
});
