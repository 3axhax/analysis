import { render, screen } from '@testing-library/react';
import { it, expect } from 'vitest';
import { AnalysisPointsPage } from '../src/pages/Admin/analysisPoints/AnalysisPointsPage';
import { DescriptionsPage } from '../src/pages/Admin/descriptions/DescriptionsPage';

it('explains that the interval editors are being developed', () => {
  render(<><AnalysisPointsPage /><DescriptionsPage /></>);
  expect(screen.getByText('Редактор показателей и интервалов находится в разработке.')).toBeTruthy();
  expect(screen.getByText('Редактор описаний и условий интервалов находится в разработке.')).toBeTruthy();
});
