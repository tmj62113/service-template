import { useState, useEffect } from "react";
import "../../styles/components/HeroSlider.css";

const slides = [
  {
    id: 1,
    image: "/images/slider/lifecoach.png",
    title: "Life Coaches",
    description: "The scheduling platform that never misses a beat",
  },
  {
    id: 2,
    image: "/images/slider/personal_trainer.png",
    title: "Personal Trainers",
    description: "The scheduling platform that never misses a beat",
  },
  {
    id: 3,
    image: "/images/slider/yoga_teacher.png",
    title: "Yoga Teachers",
    description: "The scheduling platform that never misses a beat",
  },
  {
    id: 4,
    image: "/images/slider/massage_therapist.png",
    title: "Massage Therapists",
    description: "The scheduling platform that never misses a beat",
  },
  {
    id: 5,
    image: "/images/slider/hair_stylist.png",
    title: "Hair Stylists",
    description: "The scheduling platform that never misses a beat",
  },
  {
    id: 6,
    image: "/images/slider/photographer.png",
    title: "Photographers",
    description: "The scheduling platform that never misses a beat",
  },
  {
    id: 7,
    image: "/images/slider/artist_teaching.png",
    title: "Art Teachers",
    description: "The scheduling platform that never misses a beat",
  },
  {
    id: 8,
    image: "/images/slider/babysitter.png",
    title: "Babysitters",
    description: "The scheduling platform that never misses a beat",
  },
  {
    id: 9,
    image: "/images/slider/barber.png",
    title: "Barbers",
    description: "The scheduling platform that never misses a beat",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance slides
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // 6 seconds per slide

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const getPreviousIndex = () => {
    return currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
  };

  const getNextIndex = () => {
    return (currentSlide + 1) % slides.length;
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div
      className="hero-slider"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Gallery slider showcasing different professions"
    >
      {/* Previous Arrow */}
      <button
        className="hero-slider__arrow hero-slider__arrow--prev"
        onClick={goToPrevious}
        aria-label="Previous slide"
      >
        <span className="hero-slider__arrow-number">{getPreviousIndex() + 1}</span>
      </button>

      {/* Slider Track */}
      <div className="hero-slider__track">
        {slides.map((slide, index) => {
          let className = "hero-slider__slide";
          let shouldRender = false;

          if (index === currentSlide) {
            className += " hero-slider__slide--active";
            shouldRender = true;
          } else if (index === getPreviousIndex()) {
            className += " hero-slider__slide--prev";
            shouldRender = true;
          } else if (index === getNextIndex()) {
            className += " hero-slider__slide--next";
            shouldRender = true;
          }

          // Only render visible slides (active, prev, next)
          if (!shouldRender) {
            return null;
          }

          return (
            <div
              key={slide.id}
              className={className}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="hero-slider__image"
              />
              {index === currentSlide && (
                <h3 className="hero-slider__title">{slide.title}</h3>
              )}
            </div>
          );
        })}
      </div>

      {/* Next Arrow */}
      <button
        className="hero-slider__arrow hero-slider__arrow--next"
        onClick={goToNext}
        aria-label="Next slide"
      >
        <span className="hero-slider__arrow-number">{getNextIndex() + 1}</span>
      </button>
    </div>
  );
}
