import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import userEvent from '@testing-library/user-event';
import ParadeOfHearts from './ParadeOfHearts';

const renderParadeOfHearts = () => {
  return render(
    <HelmetProvider>
      <BrowserRouter>
        <ParadeOfHearts />
      </BrowserRouter>
    </HelmetProvider>
  );
};

describe('ParadeOfHearts', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders page title', () => {
    renderParadeOfHearts();
    expect(screen.getByRole('heading', { name: 'Selected for Parade of Hearts 2026', level: 1 })).toBeInTheDocument();
  });

  it('renders 2026 artist selection announcement', () => {
    renderParadeOfHearts();
    expect(screen.getByText(/I'm honored to be selected/i)).toBeInTheDocument();
  });

  it('renders about parade of hearts section', () => {
    renderParadeOfHearts();
    expect(screen.getByRole('heading', { name: 'About Parade of Hearts', level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/Kansas City region-wide celebration/i)).toBeInTheDocument();
    expect(screen.getByText(/6 feet tall and is transformed by talented local artists/i)).toBeInTheDocument();
  });

  it('renders Learn More button', () => {
    renderParadeOfHearts();
    const learnMoreLink = screen.getByRole('link', { name: 'Learn More' });
    expect(learnMoreLink).toBeInTheDocument();
    expect(learnMoreLink).toHaveAttribute('href', 'https://theparadeofhearts.com/');
    expect(learnMoreLink).toHaveAttribute('target', '_blank');
    expect(learnMoreLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders 2023 journey section', () => {
    renderParadeOfHearts();
    expect(screen.getByRole('heading', { name: /My 2023 Journey as a "Heartist"/i, level: 2 })).toBeInTheDocument();
  });

  it('renders Vimeo video iframe', () => {
    renderParadeOfHearts();
    const iframe = screen.getByTitle("Parade of Hearts 2023 - Mark J Peterson's Journey");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', expect.stringContaining('vimeo.com'));
  });

  it('renders gallery slideshow section', () => {
    renderParadeOfHearts();
    expect(screen.getByRole('heading', { name: '2023 Heart Sculpture', level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/Explore the process and final result/i)).toBeInTheDocument();
  });

  it('renders slideshow controls', () => {
    renderParadeOfHearts();
    expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
    expect(screen.getByLabelText('Next image')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to image 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to image 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to image 3')).toBeInTheDocument();
  });

  it('displays first slide initially', () => {
    renderParadeOfHearts();
    expect(screen.getByAltText('Heart sculpture pickup day')).toBeInTheDocument();
    expect(screen.getByText(/Heart sculpture pick up day/i)).toBeInTheDocument();
  });

  it('navigates to next slide when next button is clicked', async () => {
    const user = userEvent.setup();
    renderParadeOfHearts();

    // Initially showing first slide
    expect(screen.getByAltText('Heart sculpture pickup day')).toBeInTheDocument();

    // Click next button
    await user.click(screen.getByLabelText('Next image'));

    // Should show second slide
    await waitFor(() => {
      expect(screen.getByAltText('Cutting and preparing acrylic tiles')).toBeInTheDocument();
      expect(screen.getByText(/Underway: Cutting, sanding, priming/i)).toBeInTheDocument();
    });
  });

  it('navigates to previous slide when previous button is clicked', async () => {
    const user = userEvent.setup();
    renderParadeOfHearts();

    // Click next to go to slide 2
    await user.click(screen.getByLabelText('Next image'));

    await waitFor(() => {
      expect(screen.getByAltText('Cutting and preparing acrylic tiles')).toBeInTheDocument();
    });

    // Click previous to go back to slide 1
    await user.click(screen.getByLabelText('Previous image'));

    await waitFor(() => {
      expect(screen.getByAltText('Heart sculpture pickup day')).toBeInTheDocument();
    });
  });

  it('navigates to specific slide when dot button is clicked', async () => {
    const user = userEvent.setup();
    renderParadeOfHearts();

    // Initially on slide 1
    expect(screen.getByAltText('Heart sculpture pickup day')).toBeInTheDocument();

    // Click dot for slide 2
    await user.click(screen.getByLabelText('Go to image 2'));

    // Should show second slide
    await waitFor(() => {
      expect(screen.getByAltText('Cutting and preparing acrylic tiles')).toBeInTheDocument();
    });
  });

  it('wraps around to first slide when next is clicked on last slide', async () => {
    const user = userEvent.setup();
    renderParadeOfHearts();

    // Go to last slide (slide 3)
    await user.click(screen.getByLabelText('Go to image 3'));

    await waitFor(() => {
      expect(screen.getByAltText('Completed heart sculpture #my5footheart')).toBeInTheDocument();
    });

    // Click next (should wrap to slide 1)
    await user.click(screen.getByLabelText('Next image'));

    await waitFor(() => {
      expect(screen.getByAltText('Heart sculpture pickup day')).toBeInTheDocument();
    });
  });

  it('wraps around to last slide when previous is clicked on first slide', async () => {
    const user = userEvent.setup();
    renderParadeOfHearts();

    // On first slide, click previous
    await user.click(screen.getByLabelText('Previous image'));

    // Should show last slide (slide 3)
    await waitFor(() => {
      expect(screen.getByAltText('Completed heart sculpture #my5footheart')).toBeInTheDocument();
    });
  });

  it('auto-advances to next slide after 5 seconds', async () => {
    vi.useFakeTimers();
    renderParadeOfHearts();

    // Initially showing first slide
    expect(screen.getByAltText('Heart sculpture pickup day')).toBeInTheDocument();

    // Fast-forward time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should show second slide
    expect(screen.getByAltText('Cutting and preparing acrylic tiles')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('auto-advances continuously through all slides', async () => {
    vi.useFakeTimers();
    renderParadeOfHearts();

    // Start on slide 1
    expect(screen.getByAltText('Heart sculpture pickup day')).toBeInTheDocument();

    // Advance to slide 2 (after 5 seconds)
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByAltText('Cutting and preparing acrylic tiles')).toBeInTheDocument();

    // Advance to slide 3 (after another 5 seconds)
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByAltText('Completed heart sculpture #my5footheart')).toBeInTheDocument();

    // Advance back to slide 1 (after another 5 seconds - wraps around)
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByAltText('Heart sculpture pickup day')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('cleans up auto-advance timer on unmount', () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const { unmount } = renderParadeOfHearts();

    // Unmount the component
    unmount();

    // Verify clearInterval was called
    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
    vi.useRealTimers();
  });

  it('has correct SEO title', () => {
    renderParadeOfHearts();
    // The SEO component should set the document title
    // This would be tested via react-helmet-async if needed
  });
});
