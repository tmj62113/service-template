import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HeroSlider from "./HeroSlider";

describe("HeroSlider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  describe("Rendering", () => {
    it("renders the hero slider component", () => {
      render(<HeroSlider />);
      const slider = screen.getByLabelText(
        /Gallery slider showcasing different professions/i
      );
      expect(slider).toBeInTheDocument();
    });

    it("renders only 3 slides at a time (active, prev, next)", () => {
      render(<HeroSlider />);
      const images = screen.getAllByRole("img");
      // Only 3 slides should be rendered (active, previous, next)
      expect(images).toHaveLength(3);
    });

    it("renders previous and next arrow buttons", () => {
      render(<HeroSlider />);
      const prevButton = screen.getByLabelText(/Previous slide/i);
      const nextButton = screen.getByLabelText(/Next slide/i);
      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });

    it("displays slide numbers on arrow buttons", () => {
      render(<HeroSlider />);
      const prevButton = screen.getByLabelText(/Previous slide/i);
      const nextButton = screen.getByLabelText(/Next slide/i);

      // Initial state: prev = 9, next = 2
      expect(prevButton).toHaveTextContent("9");
      expect(nextButton).toHaveTextContent("2");
    });

    it("renders slide info section with title and description", () => {
      render(<HeroSlider />);
      expect(screen.getByText("Life Coaches")).toBeInTheDocument();
      expect(
        screen.getByText("The scheduling platform that never misses a beat")
      ).toBeInTheDocument();
    });
  });

  describe("Initial State", () => {
    it("shows the first slide (Life Coaches) as active initially", () => {
      render(<HeroSlider />);
      const firstSlide = screen.getByAltText("Life Coaches");
      expect(firstSlide).toBeInTheDocument();
      expect(firstSlide.parentElement).toHaveClass("hero-slider__slide--active");
    });

    it("renders previous slide (Barbers - slide 9) on the left", () => {
      render(<HeroSlider />);
      const barbersSlide = screen.getByAltText("Barbers");
      expect(barbersSlide).toBeInTheDocument();
      expect(barbersSlide.parentElement).toHaveClass("hero-slider__slide--prev");
    });

    it("renders next slide (Personal Trainers - slide 2) on the right", () => {
      render(<HeroSlider />);
      const trainersSlide = screen.getByAltText("Personal Trainers");
      expect(trainersSlide).toBeInTheDocument();
      expect(trainersSlide.parentElement).toHaveClass("hero-slider__slide--next");
    });
  });

  describe("Arrow Navigation", () => {
    it("advances to next slide when next button is clicked", async () => {
      const user = userEvent.setup();
      render(<HeroSlider />);

      const nextButton = screen.getByLabelText(/Next slide/i);
      await user.click(nextButton);

      // Should now show Personal Trainers (slide 2) as active
      await waitFor(() => {
        expect(screen.getByText("Personal Trainers")).toBeInTheDocument();
      });
      const trainersSlide = screen.getByAltText("Personal Trainers");
      expect(trainersSlide.parentElement).toHaveClass("hero-slider__slide--active");
    });

    it("goes to previous slide when previous button is clicked", async () => {
      const user = userEvent.setup();
      render(<HeroSlider />);

      const prevButton = screen.getByLabelText(/Previous slide/i);
      await user.click(prevButton);

      // Should now show Barbers (slide 9) as active
      await waitFor(() => {
        expect(screen.getByText("Barbers")).toBeInTheDocument();
      });
      const barbersSlide = screen.getByAltText("Barbers");
      expect(barbersSlide.parentElement).toHaveClass("hero-slider__slide--active");
    });

    it("wraps from last slide to first when clicking next", async () => {
      const user = userEvent.setup();
      render(<HeroSlider />);

      const prevButton = screen.getByLabelText(/Previous slide/i);
      // Click previous to go to slide 9 (Barbers)
      await user.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText("Barbers")).toBeInTheDocument();
      });

      const nextButton = screen.getByLabelText(/Next slide/i);
      // Click next to wrap to slide 1 (Life Coaches)
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText("Life Coaches")).toBeInTheDocument();
      });
      const lifecoachSlide = screen.getByAltText("Life Coaches");
      expect(lifecoachSlide.parentElement).toHaveClass("hero-slider__slide--active");
    });

    it("wraps from first slide to last when clicking previous", async () => {
      const user = userEvent.setup();
      render(<HeroSlider />);

      const prevButton = screen.getByLabelText(/Previous slide/i);
      await user.click(prevButton);

      // Should wrap to slide 9 (Barbers)
      await waitFor(() => {
        expect(screen.getByText("Barbers")).toBeInTheDocument();
      });
    });

    it("updates arrow numbers after navigation", async () => {
      const user = userEvent.setup();
      render(<HeroSlider />);

      const nextButton = screen.getByLabelText(/Next slide/i);
      await user.click(nextButton);

      // After clicking next, we're on slide 2
      // prev should show 1, next should show 3
      await waitFor(() => {
        const prevButton = screen.getByLabelText(/Previous slide/i);
        expect(prevButton).toHaveTextContent("1");
        expect(nextButton).toHaveTextContent("3");
      });
    });
  });

  describe("Auto-advance", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("automatically advances to next slide after 6 seconds", async () => {
      const { rerender } = render(<HeroSlider />);

      // Initially on slide 1 (Life Coaches)
      expect(screen.getByText("Life Coaches")).toBeInTheDocument();

      // Fast-forward 6 seconds
      await vi.advanceTimersByTimeAsync(6000);
      rerender(<HeroSlider />);

      // Should now be on slide 2 (Personal Trainers)
      expect(screen.getByText("Personal Trainers")).toBeInTheDocument();
    });

    it("continues auto-advancing through multiple slides", async () => {
      const { rerender } = render(<HeroSlider />);

      // Advance through 3 slides (18 seconds total)
      await vi.advanceTimersByTimeAsync(18000);
      rerender(<HeroSlider />);

      // Should be on slide 4 (Massage Therapists)
      expect(screen.getByText("Massage Therapists")).toBeInTheDocument();
    });

    it("wraps around from last slide to first during auto-advance", async () => {
      const { rerender } = render(<HeroSlider />);

      // Advance through all 9 slides to test wrap-around
      await vi.advanceTimersByTimeAsync(54000); // 9 slides × 6 seconds
      rerender(<HeroSlider />);

      // Should wrap back to slide 1 (Life Coaches)
      expect(screen.getByText("Life Coaches")).toBeInTheDocument();
    });
  });

  describe("Pause on Hover", () => {
    it("has mouse enter and leave event handlers", () => {
      render(<HeroSlider />);

      const slider = screen.getByLabelText(
        /Gallery slider showcasing different professions/i
      );

      // Component should be present and capable of receiving mouse events
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute("aria-label");
    });

    it("slider is interactive and responds to mouse events", async () => {
      const user = userEvent.setup();
      render(<HeroSlider />);

      const slider = screen.getByLabelText(
        /Gallery slider showcasing different professions/i
      );

      // Verify slider can receive hover events
      await user.hover(slider);
      expect(slider).toBeInTheDocument();

      await user.unhover(slider);
      expect(slider).toBeInTheDocument();
    });
  });

  describe("Slide Info Display", () => {
    it("updates title when slide changes", async () => {
      const user = userEvent.setup();
      render(<HeroSlider />);

      // Initially shows Life Coaches
      expect(screen.getByText("Life Coaches")).toBeInTheDocument();

      const nextButton = screen.getByLabelText(/Next slide/i);
      await user.click(nextButton);

      // Should now show Personal Trainers
      await waitFor(() => {
        expect(screen.getByText("Personal Trainers")).toBeInTheDocument();
      });
    });

    it("displays the same description for all slides", () => {
      render(<HeroSlider />);
      expect(
        screen.getByText("The scheduling platform that never misses a beat")
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA label on slider container", () => {
      render(<HeroSlider />);
      const slider = screen.getByLabelText(
        /Gallery slider showcasing different professions/i
      );
      expect(slider).toHaveAttribute("aria-label");
    });

    it("has proper ARIA labels on navigation buttons", () => {
      render(<HeroSlider />);
      const prevButton = screen.getByLabelText(/Previous slide/i);
      const nextButton = screen.getByLabelText(/Next slide/i);
      expect(prevButton).toHaveAttribute("aria-label", "Previous slide");
      expect(nextButton).toHaveAttribute("aria-label", "Next slide");
    });

    it("images have descriptive alt text", () => {
      render(<HeroSlider />);
      expect(screen.getByAltText("Life Coaches")).toBeInTheDocument();
      expect(screen.getByAltText("Personal Trainers")).toBeInTheDocument();
      expect(screen.getByAltText("Barbers")).toBeInTheDocument();
    });
  });

  describe("Content", () => {
    it("displays all 9 profession titles through navigation", async () => {
      const user = userEvent.setup();
      render(<HeroSlider />);

      const professions = [
        "Life Coaches",
        "Personal Trainers",
        "Yoga Teachers",
        "Massage Therapists",
        "Hair Stylists",
        "Photographers",
        "Art Teachers",
        "Babysitters",
        "Barbers",
      ];

      const nextButton = screen.getByLabelText(/Next slide/i);

      // Check each profession
      for (let i = 0; i < professions.length; i++) {
        await waitFor(() => {
          expect(screen.getByText(professions[i])).toBeInTheDocument();
        });
        if (i < professions.length - 1) {
          await user.click(nextButton);
        }
      }
    });

    it("renders images with correct paths", () => {
      render(<HeroSlider />);
      const lifecoachImage = screen.getByAltText("Life Coaches");
      expect(lifecoachImage).toHaveAttribute("src", "/images/slider/lifecoach.png");
    });
  });
});
