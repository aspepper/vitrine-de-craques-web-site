import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AlbumCard from '@/components/AlbumCard';

describe('AlbumCard', () => {
  it('renders athlete information correctly', () => {
    const props = {
      href: '/athletes/test-slug',
      imageUrl: 'https://placehold.co/400x500',
      name: 'João Silva',
      details: ['Atacante', 'São Paulo, SP'],
    };

    render(<AlbumCard {...props} />);

    // Check if the name is displayed
    expect(screen.getByText('João Silva')).toBeInTheDocument();

    // Check if details are displayed
    expect(screen.getByText('Atacante')).toBeInTheDocument();
    expect(screen.getByText('São Paulo, SP')).toBeInTheDocument();

    // Check if the link is correct
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/athletes/test-slug');
    
    // Check if the image alt text is correct
    const imageElement = screen.getByRole('img');
    expect(imageElement).toHaveAttribute('alt', 'Foto de João Silva');
  });
});
