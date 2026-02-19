/**
 * Component tests for PaginationNav
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PaginationNav from './PaginationNav';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('PaginationNav', () => {
  it('returns null when totalPages <= 1', () => {
    const { container } = render(
      <PaginationNav page={1} totalPages={1} basePath="/products" searchParams={{}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when totalPages > 1', () => {
    render(
      <PaginationNav page={2} totalPages={5} basePath="/products" searchParams={{}} />
    );
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
  });

  it('shows page info when total is provided', () => {
    render(
      <PaginationNav page={2} totalPages={5} basePath="/products" searchParams={{}} total={50} />
    );
    expect(screen.getByText(/Page 2 of 5/)).toBeInTheDocument();
    expect(screen.getByText(/50 items/)).toBeInTheDocument();
  });

  it('marks current page with aria-current', () => {
    render(
      <PaginationNav page={3} totalPages={5} basePath="/products" searchParams={{}} />
    );
    const currentLink = screen.getByLabelText('Page 3');
    expect(currentLink).toHaveAttribute('aria-current', 'page');
  });

  it('builds correct href with search params', () => {
    render(
      <PaginationNav page={2} totalPages={3} basePath="/products" searchParams={{ sort: 'price' }} />
    );
    const prevLink = screen.getByLabelText('Previous page');
    expect(prevLink).toHaveAttribute('href', '/products?sort=price&page=1');
  });
});
