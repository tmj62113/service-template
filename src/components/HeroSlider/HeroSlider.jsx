import { useState, useEffect } from "react";
import "../../styles/components/HeroSlider.css";

const slides = [
  {
    id: 1,
    image: "/images/slider/lifecoach.png",
    title: "The scheduling platform that never misses a beat for life coaches",
    profession: "Life Coaches",
  },
  {
    id: 2,
    image: "/images/slider/personal_trainer.png",
    title: "The scheduling platform that never misses a beat for personal trainers",
    profession: "Personal Trainers",
  },
  {
    id: 3,
    image: "/images/slider/yoga_teacher.png",
    title: "The scheduling platform that never misses a beat for yoga teachers",
    profession: "Yoga Teachers",
  },
  {
    id: 4,
    image: "/images/slider/massage_therapist.png",
    title: "The scheduling platform that never misses a beat for massage therapists",
    profession: "Massage Therapists",
  },
  {
    id: 5,
    image: "/images/slider/hair_stylist.png",
    title: "The scheduling platform that never misses a beat for hair stylists",
    profession: "Hair Stylists",
  },
  {
    id: 6,
    image: "/images/slider/photographer.png",
    title: "The scheduling platform that never misses a beat for photographers",
    profession: "Photographers",
  },
  {
    id: 7,
    image: "/images/slider/artist_teaching.png",
    title: "The scheduling platform that never misses a beat for art teachers",
    profession: "Art Teachers",
  },
  {
    id: 8,
    image: "/images/slider/babysitter.png",
    title: "The scheduling platform that never misses a beat for babysitters",
    profession: "Babysitters",
  },
  {
    id: 9,
    image: "/images/slider/barber.png",
    title: "The scheduling platform that never misses a beat for barbers",
    profession: "Barbers",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // 4 seconds per slide

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div
      className="hero-slider"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Hero slider showcasing different professions"
      aria-live="polite"
    >
      <div className="hero-slider__track">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-slider__slide ${
              index === currentSlide ? "hero-slider__slide--active" : ""
            }`}
            aria-hidden={index !== currentSlide}
          >
            <div className="hero-slider__image-container">
              <img
                src={slide.image}
                alt={`${slide.profession} using Clockwork scheduling platform`}
                className="hero-slider__image"
              />
            </div>
            <div className="hero-slider__content">
              <h2 className="hero-slider__title">
                The scheduling platform that never misses a beat for{" "}
                <span className="hero-slider__highlight">
                  {slide.profession.toLowerCase()}
                </span>
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="hero-slider__dots" role="tablist" aria-label="Slide navigation">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`hero-slider__dot ${
              index === currentSlide ? "hero-slider__dot--active" : ""
            }`}
            onClick={() => goToSlide(index)}
            role="tab"
            aria-selected={index === currentSlide}
            aria-label={`Go to slide ${index + 1}: ${slide.profession}`}
          />
        ))}
      </div>
    </div>
  );
}
