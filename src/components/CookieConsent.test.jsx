import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import CookieConsent, { hasConsentFor, resetCookieConsent } from './CookieConsent';

const COOKIE_CONSENT_KEY = 'mjp_cookie_consent';

const renderCookieConsent = () => {
  return render(
    <BrowserRouter>
      <CookieConsent />
    </BrowserRouter>
  );
};

describe('CookieConsent', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Initial Display', () => {
    it('does not display immediately on mount', () => {
      renderCookieConsent();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('displays after 1 second delay when no consent is saved', async () => {
      renderCookieConsent();

      // Fast-forward time
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('does not display when consent is already saved', async () => {
      localStorage.setItem(
        COOKIE_CONSENT_KEY,
        JSON.stringify({
          essential: true,
          analytics: false,
          marketing: false,
          timestamp: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        })
      );

      renderCookieConsent();
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Content and Accessibility', () => {
    beforeEach(async () => {
      renderCookieConsent();
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('renders with proper ARIA attributes', () => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'cookie-consent-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'cookie-consent-description');
    });

    it('displays the title', () => {
      expect(screen.getByText('Cookie Settings')).toBeInTheDocument();
    });

    it('displays the description with privacy policy link', () => {
      expect(
        screen.getByText(/We use cookies to enhance your browsing experience/i)
      ).toBeInTheDocument();

      const privacyLink = screen.getByRole('link', { name: /Learn more in our Privacy Policy/i });
      expect(privacyLink).toBeInTheDocument();
      expect(privacyLink).toHaveAttribute('href', '/privacy-policy');
    });

    it('displays all action buttons', () => {
      expect(screen.getByRole('button', { name: /Accept all cookies/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Reject non-essential cookies/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Customize cookie settings/i })
      ).toBeInTheDocument();
    });

    it('displays backdrop', () => {
      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Accept All Functionality', () => {
    it('saves all consents when "Accept All" is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      renderCookieConsent();
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const acceptButton = screen.getByRole('button', { name: /Accept all cookies/i });
      await user.click(acceptButton);

      const savedConsent = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY));
      expect(savedConsent.essential).toBe(true);
      expect(savedConsent.analytics).toBe(true);
      expect(savedConsent.marketing).toBe(true);
      expect(savedConsent.timestamp).toBeDefined();
      expect(savedConsent.expiresAt).toBeDefined();
    });

    it('hides the banner after accepting all', async () => {
      const user = userEvent.setup({ delay: null });
      renderCookieConsent();
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const acceptButton = screen.getByRole('button', { name: /Accept all cookies/i });
      await user.click(acceptButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Reject Non-Essential Functionality', () => {
    it('saves only essential consent when "Reject Non-Essential" is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      renderCookieConsent();
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /Reject non-essential cookies/i });
      await user.click(rejectButton);

      const savedConsent = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY));
      expect(savedConsent.essential).toBe(true);
      expect(savedConsent.analytics).toBe(false);
      expect(savedConsent.marketing).toBe(false);
    });

    it('hides the banner after rejecting non-essential', async () => {
      const user = userEvent.setup({ delay: null });
      renderCookieConsent();
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /Reject non-essential cookies/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Customize Functionality', () => {
    it('shows customization view when "Customize" is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      renderCookieConsent();
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const customizeButton = screen.getByRole('button', { name: /Customize cookie settings/i });
      await user.click(customizeButton);

      expect(screen.getByText('Essential Cookies')).toBeInTheDocument();
      expect(screen.getByText('Analytics Cookies')).toBeInTheDocument();
      expect(screen.getByText('Marketing Cookies')).toBeInTheDocument();
    });

    it('displays essential cookies as always enabled', async () => {
      const user = userEvent.setup({ delay: null });
      renderCookieConsent();
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const customizeButton = screen.getByRole('button', { name: /Customize cookie settings/i });
      await user.click(customizeButton);

      const essentialCheckbox = screen.getByRole('checkbox', {
        name: /Essential cookies \(always enabled\)/i,
      });
      expect(essentialCheckbox).toBeChecked();
      expect(essentialCheckbox).toBeDisabled();
      expect(screen.getByText('Always Enabled')).toBeInTheDocument();
    });

    it('allows toggling analytics cookies', async () => {
      const user = userEvent.setup({ delay: null });
      renderCookieConsent();
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const customizeButton = screen.getByRole('button', { name: /Customize cookie settings/i });
      await user.click(customizeButton);

      const analyticsCheckbox = screen.getByRole('checkbox', { name: /Toggle analytics cookies/i });
      expect(analyticsCheckbox).not.toBeChecked();

      await user.click(analyticsCheckbox);
      expect(analyticsCheckbox).toBeChecked();

      await user.click(analyticsCheckbox);
      expect(analyticsCheckbox).not.toBeChecked();
    });

    it('allows toggling marketing cookies', async () => {
      const user = userEvent.setup({ delay: null });
      renderCookieConsent();
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const customizeButton = screen.getByRole('button', { name: /Customize cookie settings/i });
      await user.click(customizeButton);

      const marketingCheckbox = screen.getByRole('checkbox', { name: /Toggle marketing cookies/i });
      expect(marketingCheckbox).not.toBeChecked();

      await user.click(marketingCheckbox);
      expect(marketingCheckbox).toBeChecked();

      await user.click(marketingCheckbox);
      expect(marketingCheckbox).not.toBeChecked();
    });

    it('saves custom preferences when "Save Preferences" is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      renderCookieConsent();
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const customizeButton = screen.getByRole('button', { name: /Customize cookie settings/i });
      await user.click(customizeButton);

      // Enable analytics, keep marketing disabled
      const analyticsCheckbox = screen.getByRole('checkbox', { name: /Toggle analytics cookies/i });
      await user.click(analyticsCheckbox);

      const saveButton = screen.getByRole('button', { name: /Save custom cookie preferences/i });
      await user.click(saveButton);

      const savedConsent = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY));
      expect(savedConsent.essential).toBe(true);
      expect(savedConsent.analytics).toBe(true);
      expect(savedConsent.marketing).toBe(false);
    });

    it('returns to simple view when "Back" is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      renderCookieConsent();
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const customizeButton = screen.getByRole('button', { name: /Customize cookie settings/i });
      await user.click(customizeButton);

      expect(screen.getByText('Essential Cookies')).toBeInTheDocument();

      const backButton = screen.getByRole('button', { name: /Go back to simple choice/i });
      await user.click(backButton);

      expect(screen.queryByText('Essential Cookies')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Accept all cookies/i })).toBeInTheDocument();
    });
  });

  describe('Cookie Type Descriptions', () => {
    it('displays descriptions for all cookie types', async () => {
      const user = userEvent.setup({ delay: null });
      renderCookieConsent();
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const customizeButton = screen.getByRole('button', { name: /Customize cookie settings/i });
      await user.click(customizeButton);

      expect(
        screen.getByText(/Required for the website to function properly/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Help us understand how visitors interact/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Used to track visitors across websites/i)
      ).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation through buttons', async () => {
      const user = userEvent.setup({ delay: null });
      renderCookieConsent();
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Tab through buttons
      await user.tab();
      expect(screen.getByRole('link', { name: /Learn more in our Privacy Policy/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /Accept all cookies/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /Reject non-essential cookies/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /Customize cookie settings/i })).toHaveFocus();
    });

    it('can activate buttons with keyboard', async () => {
      const user = userEvent.setup({ delay: null });
      renderCookieConsent();
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const acceptButton = screen.getByRole('button', { name: /Accept all cookies/i });
      acceptButton.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      const savedConsent = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY));
      expect(savedConsent.essential).toBe(true);
      expect(savedConsent.analytics).toBe(true);
      expect(savedConsent.marketing).toBe(true);
    });
  });
});

describe('hasConsentFor utility function', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns false when no consent is saved', () => {
    expect(hasConsentFor('analytics')).toBe(false);
  });

  it('returns true when consent is granted for specific cookie type', () => {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({
        essential: true,
        analytics: true,
        marketing: false,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      })
    );

    expect(hasConsentFor('analytics')).toBe(true);
    expect(hasConsentFor('marketing')).toBe(false);
    expect(hasConsentFor('essential')).toBe(true);
  });

  it('returns false when consent has expired', () => {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({
        essential: true,
        analytics: true,
        marketing: true,
        timestamp: new Date('2020-01-01').toISOString(),
        expiresAt: new Date('2021-01-01').toISOString(), // Expired
      })
    );

    expect(hasConsentFor('analytics')).toBe(false);
    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBeNull(); // Should be removed
  });

  it('handles invalid JSON gracefully', () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'invalid json');
    expect(hasConsentFor('analytics')).toBe(false);
  });
});

describe('resetCookieConsent utility function', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('removes consent from localStorage', () => {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({
        essential: true,
        analytics: true,
        marketing: true,
      })
    );

    // Mock window.location.reload
    delete window.location;
    window.location = { reload: vi.fn() };

    resetCookieConsent();

    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBeNull();
    expect(window.location.reload).toHaveBeenCalled();
  });
});
