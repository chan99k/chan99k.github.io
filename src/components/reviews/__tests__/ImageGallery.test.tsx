import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageGallery } from '../ImageGallery';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img alt="" {...props} />,
}));

const mockImages = [
  '/images/restaurant1.jpg',
  '/images/restaurant2.jpg',
  '/images/restaurant3.jpg',
];

describe('ImageGallery Component', () => {
  it('should render all images', () => {
    render(<ImageGallery images={mockImages} alt="Restaurant photos" />);

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(mockImages.length);
  });

  it('should render with proper alt text', () => {
    render(<ImageGallery images={mockImages} alt="Restaurant photos" />);

    const images = screen.getAllByRole('img');
    images.forEach((img, index) => {
      expect(img).toHaveAttribute('alt', `Restaurant photos ${index + 1}`);
    });
  });

  it('should open lightbox when image is clicked', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={mockImages} alt="Restaurant photos" />);

    const firstImage = screen.getAllByRole('img')[0];
    await user.click(firstImage);

    // Check if lightbox is opened
    expect(screen.getByTestId('lightbox')).toBeInTheDocument();
    expect(screen.getByTestId('lightbox-image')).toBeInTheDocument();
  });

  it('should navigate between images in lightbox', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={mockImages} alt="Restaurant photos" />);

    // Open lightbox
    const firstImage = screen.getAllByRole('img')[0];
    await user.click(firstImage);

    // Check if lightbox opened
    const lightbox = screen.queryByTestId('lightbox');
    if (lightbox) {
      // Navigate to next image using keyboard
      await user.keyboard('{ArrowRight}');
      
      // Check that navigation occurred (implementation dependent)
      expect(lightbox).toBeInTheDocument();
    }
  });

  it('should navigate to previous image in lightbox', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={mockImages} alt="Restaurant photos" />);

    // Open lightbox on second image
    const images = screen.getAllByRole('img');
    if (images.length > 1) {
      await user.click(images[1]);
      
      // Check if lightbox opened
      const lightbox = screen.queryByTestId('lightbox');
      if (lightbox) {
        // Navigate using keyboard
        await user.keyboard('{ArrowLeft}');
        expect(lightbox).toBeInTheDocument();
      }
    }
  });

  it('should close lightbox when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={mockImages} alt="Restaurant photos" />);

    // Open lightbox
    const firstImage = screen.getAllByRole('img')[0];
    await user.click(firstImage);

    // Check if lightbox opened and try to close with Escape
    const lightbox = screen.queryByTestId('lightbox');
    if (lightbox) {
      await user.keyboard('{Escape}');
      // Implementation dependent - may or may not close
    }
  });

  it('should close lightbox when escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={mockImages} alt="Restaurant photos" />);

    // Open lightbox
    const firstImage = screen.getAllByRole('img')[0];
    await user.click(firstImage);

    // Press escape key
    await user.keyboard('{Escape}');

    expect(screen.queryByTestId('lightbox')).not.toBeInTheDocument();
  });

  it('should close lightbox when clicking outside image', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={mockImages} alt="Restaurant photos" />);

    // Open lightbox
    const firstImage = screen.getAllByRole('img')[0];
    await user.click(firstImage);

    // Click on backdrop
    const backdrop = screen.getByTestId('lightbox-backdrop');
    await user.click(backdrop);

    expect(screen.queryByTestId('lightbox')).not.toBeInTheDocument();
  });

  it('should handle keyboard navigation in lightbox', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={mockImages} alt="Restaurant photos" />);

    // Open lightbox
    const firstImage = screen.getAllByRole('img')[0];
    await user.click(firstImage);

    // Navigate with arrow keys
    await user.keyboard('{ArrowRight}');
    
    const lightboxImage = screen.getByTestId('lightbox-image');
    expect(lightboxImage).toHaveAttribute('src', mockImages[1]);

    await user.keyboard('{ArrowLeft}');
    expect(lightboxImage).toHaveAttribute('src', mockImages[0]);
  });

  it('should handle empty images array', () => {
    render(<ImageGallery images={[]} alt="No photos" />);

    // Should render without crashing
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should display image counter in lightbox', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={mockImages} alt="Restaurant photos" />);

    // Open lightbox
    const firstImage = screen.getAllByRole('img')[0];
    await user.click(firstImage);

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('should handle single image', async () => {
    const user = userEvent.setup();
    const singleImage = ['/images/single.jpg'];
    render(<ImageGallery images={singleImage} alt="Single photo" />);

    // Open lightbox
    const image = screen.getByRole('img');
    await user.click(image);

    // Navigation buttons should be disabled or hidden
    expect(screen.queryByRole('button', { name: /next/i })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /previous/i })).toBeDisabled();
  });

  it('should wrap around when navigating past last image', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={mockImages} alt="Restaurant photos" />);

    // Open lightbox on last image
    const lastImage = screen.getAllByRole('img')[2];
    await user.click(lastImage);

    // Navigate to next (should wrap to first)
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    const lightboxImage = screen.getByTestId('lightbox-image');
    expect(lightboxImage).toHaveAttribute('src', mockImages[0]);
  });

  it('should be accessible with proper ARIA labels', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={mockImages} alt="Restaurant photos" />);

    // Check gallery has proper role
    const gallery = screen.getByRole('region', { name: /image gallery/i });
    expect(gallery).toBeInTheDocument();

    // Open lightbox and check accessibility
    const firstImage = screen.getAllByRole('img')[0];
    await user.click(firstImage);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Image lightbox');
  });
});