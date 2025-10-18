import { useState, useEffect } from "react";
import SEO from "../components/SEO";
import "./ParadeOfHearts.css";

export default function ParadeOfHearts() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const AUTO_ADVANCE_INTERVAL = 5000; // 5 seconds

  const slides = [
    {
      image: "/images/poh 2023/poh_2023_pickup.jpg",
      alt: "Heart sculpture pickup day",
      caption:
        "Heart sculpture pick up day. My artist assistant, Miles, is ready to get started!",
    },
    {
      image: "/images/poh 2023/poh_process_2023.jpg",
      alt: "Cutting and preparing acrylic tiles",
      caption:
        'Underway: Cutting, sanding, priming 2" x 2" acrylic tiles for the outer rim of #my5footheart. New bedtime activity for Miles the next 3 weeks.',
    },
    {
      image: "/images/poh 2023/poh_2023.jpg",
      alt: "Completed heart sculpture #my5footheart",
      caption:
        "#my5footheart is finished and was dropped off last week. 3 months of dedicated work. Miles was a great help!",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, AUTO_ADVANCE_INTERVAL);

    return () => clearInterval(timer);
  }, [slides.length, AUTO_ADVANCE_INTERVAL]);

  return (
    <div className="parade-container">
      <SEO
        title="Parade of Hearts"
        description="Follow Mark J Peterson's journey as a Parade of Hearts artist in 2023 and 2026, transforming 6-foot heart sculptures into one-of-a-kind works of art for the Kansas City region."
        keywords={[
          "parade of hearts",
          "Kansas City art",
          "Mark J Peterson",
          "heart sculpture",
          "public art",
          "2026 artist",
        ]}
      />

      {/* 2026 Announcement Section */}
      <section className="announcement-section">
        <div className="container">
          <div className="announcement-content">
            <div className="announcement-image">
              <img
                src="/images/poh 2023/poh_artist_reveal.jpg"
                alt="Parade of Hearts 2026 Artist Selection"
              />
            </div>
            <div className="announcement-text">
              <h2>Parade of Hearts 2026</h2>
              <p>
                I'm honored to be selected as one of the artists creating the
                150 heart sculptures that will be placed around the Kansas City
                region in 2026. This incredible opportunity allows me to
                contribute to a region-wide celebration of art, culture, and
                community.
              </p>
              <p>
                Follow along as I document the creative process, from initial
                concepts to the final sculpture, sharing insights, challenges,
                and inspiration along the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2023 Experience Section */}
      <section className="experience-section">
        <div className="container">
          <h2>My 2023 Journey as a "Heartist"</h2>
          <p className="section-intro">
            In 2023, I had the incredible opportunity to participate in the
            Parade of Hearts as a selected artist—or as we were lovingly called,
            a "Heartist." This video captures the journey of bringing my vision
            to life on a 6-foot heart sculpture.
          </p>
        </div>
      </section>

      {/* Video Section */}
      <section className="video-section">
        <div className="video-container">
          <iframe
            src="https://player.vimeo.com/video/809873588?h=650e8d00b1&badge=0&autopause=0&player_id=0&app_id=58479"
            style={{ border: 0 }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Parade of Hearts 2023 - Mark J Peterson's Journey"
          ></iframe>
        </div>
      </section>

      {/* About Parade of Hearts */}
      <section className="about-parade">
        <div className="container">
          <h2>About Parade of Hearts</h2>
          <div className="about-parade-content">
            <div>
              <p>
                Parade of Hearts is a Kansas City region-wide celebration brought to
                life through a magical, free public art experience featuring
                one-of-a-kind heart sculptures by local artists. The initiative
                brings together artists, businesses, and the community to create an
                unforgettable display of creativity and generosity.
              </p>
              <p>
                Each heart sculpture stands 6 feet tall and is transformed by
                talented local artists into unique works of art that reflect the
                diversity, spirit, and creativity of the Kansas City region.
              </p>
              <a
                href="https://theparadeofhearts.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary"
              >
                Learn More
              </a>
            </div>
            <div>
            </div>
          </div>
        </div>
      </section>

      {/* 2023 Gallery Section */}
      <section className="gallery-section">
        <div className="gallery-slideshow">
          {slides.map((slide, index) => {
            const isPrev =
              index === (currentSlide - 1 + slides.length) % slides.length;
            const isNext = index === (currentSlide + 1) % slides.length;
            const isActive = index === currentSlide;

            return (
              <div
                key={index}
                className={`gallery-slide ${
                  isActive ? "active" : ""
                } ${isPrev ? "prev" : ""} ${isNext ? "next" : ""}`}
              >
                <div className="slide-image">
                  <img src={slide.image} alt={slide.alt} />
                </div>
                <div className="slide-caption">
                  <p>{slide.caption}</p>
                </div>
              </div>
            );
          })}

          <button
            className="gallery-control prev"
            onClick={prevSlide}
            aria-label="Previous image"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <button
            className="gallery-control next"
            onClick={nextSlide}
            aria-label="Next image"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          <div className="gallery-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`gallery-dot ${
                  index === currentSlide ? "active" : ""
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to image ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
