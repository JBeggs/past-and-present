/**
 * Component tests for FooterClient
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FooterClient from './FooterClient';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const defaultProps = {
  siteName: 'Past and Present',
  description: 'Vintage & modern treasures',
  contact: { address: '123 Main St', phone: '555-1234', email: 'hello@example.com' },
  social: { facebook: 'https://fb.com', twitter: '', instagram: 'https://ig.com' },
  menuItems: [
    { title: 'Products', href: '/products' },
    { title: 'Articles', href: '/articles' },
  ],
};

describe('FooterClient', () => {
  it('renders site name and description', () => {
    render(<FooterClient {...defaultProps} />);
    expect(screen.getByText('Past and Present')).toBeInTheDocument();
    expect(screen.getByText('Vintage & modern treasures')).toBeInTheDocument();
  });

  it('renders shop links', () => {
    render(<FooterClient {...defaultProps} />);
    expect(screen.getByText('All Products')).toHaveAttribute('href', '/products');
    expect(screen.getByText('Vintage Items')).toHaveAttribute('href', '/products?condition=vintage');
    expect(screen.getByText('New Arrivals')).toHaveAttribute('href', '/products?condition=new');
  });

  it('renders customer service links', () => {
    render(<FooterClient {...defaultProps} />);
    expect(screen.getByText('Contact Us')).toHaveAttribute('href', '/contact');
    expect(screen.getByText('About Us')).toHaveAttribute('href', '/about');
  });

  it('renders contact info when provided', () => {
    render(<FooterClient {...defaultProps} />);
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('555-1234')).toBeInTheDocument();
    expect(screen.getByText('hello@example.com')).toBeInTheDocument();
  });

  it('renders social links when provided', () => {
    render(<FooterClient {...defaultProps} />);
    const fbLink = document.querySelector('a[href="https://fb.com"]');
    const igLink = document.querySelector('a[href="https://ig.com"]');
    expect(fbLink).toBeInTheDocument();
    expect(igLink).toBeInTheDocument();
  });

  it('renders copyright with current year', () => {
    render(<FooterClient {...defaultProps} />);
    expect(screen.getByText(new RegExp(`${new Date().getFullYear()}`))).toBeInTheDocument();
  });
});
