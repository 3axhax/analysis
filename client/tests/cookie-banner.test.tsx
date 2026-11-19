// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PoliticsAgreementBlock } from '../src/features/politicsAgreementBlock/ui/PoliticsAgreementBlock';

afterEach(() => { cleanup(); localStorage.clear(); });
const mount = () => render(<MemoryRouter><PoliticsAgreementBlock /></MemoryRouter>);

it('shows the banner on first visit with the requested original text', () => {
  mount();
  expect(screen.getByText(/Мы используем файлы cookie и сервис «Яндекс.Метрика»/)).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Политикой обработки ПДн' }).getAttribute('href')).toBe('/privacy-policy');
});

for (const [label, value] of [['Принять', '1'], ['Отказаться', '0']]) {
  it(`persists ${label} and hides the banner on subsequent visits`, () => {
    const view = mount();
    fireEvent.click(screen.getByRole('button', { name: label }));
    expect(localStorage.getItem('accept_ym')).toBe(value);
    expect(screen.queryByRole('button', { name: label })).toBeNull();
    view.unmount();
    mount();
    expect(screen.queryByRole('button', { name: label })).toBeNull();
  });
}
