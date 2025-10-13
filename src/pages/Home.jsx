import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { theme } from '../config/theme';
import './Home.css';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slideshowImages = [
    '/images/homepage/slideshow/IMG_1719.JPG',
    '/images/homepage/slideshow/IMG_1724.JPG',
    '/images/homepage/slideshow/IMG_1727.JPG',
    '/images/homepage/slideshow/IMG_1731.JPG',
    '/images/homepage/slideshow/IMG_1751.JPG',
  ];

  const featuredArtwork = [
    {
      id: 1,
      title: 'Featured Artwork 1',
      image: '/images/homepage/featured/IMG_1712.PNG',
      price: '$299',
    },
    {
      id: 2,
      title: 'Featured Artwork 2',
      image: '/images/homepage/featured/IMG_1725.PNG',
      price: '$349',
    },
    {
      id: 3,
      title: 'Featured Artwork 3',
      image: '/images/homepage/featured/IMG_1742.PNG',
      price: '$399',
    },
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideshowImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length
    );
  };

  return (
    <div className="home-container">
      {/* Hero Slideshow */}
      <section className="hero-slideshow">
        <div className="slideshow-container">
          {slideshowImages.map((image, index) => (
            <div
              key={index}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{
                backgroundImage: `url(${image})`,
              }}
            >
              <div className="hero-overlay">
                <div className="hero-content">
                  <h1 className="hero-title">Original Artwork by Mark J Peterson</h1>
                  <p className="hero-subtitle">
                    Discover unique paintings and fine art prints
                  </p>
                  <Link to="/products" className="btn btn--primary hero-cta">
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Slideshow Controls */}
          <button
            className="slideshow-control prev"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            className="slideshow-control next"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          {/* Dot Indicators */}
          <div className="slideshow-dots">
            {slideshowImages.map((_, index) => (
              <button
                key={index}
                className={`dot-indicator ${
                  index === currentSlide ? 'active' : ''
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artwork Section */}
      <section className="featured-section container">
        <div className="section-header">
          <h4 className="section-label">Featured Works</h4>
          <h2 className="section-title">Explore Our Collection</h2>
          <p className="section-subtitle">
            Handpicked original artwork and fine art prints
          </p>
        </div>

        <div className="featured-grid">
          {featuredArtwork.map((artwork) => (
            <Link
              key={artwork.id}
              to="/products"
              className="featured-card card"
            >
              <div className="featured-image">
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  loading="lazy"
                />
              </div>
              <div className="featured-info">
                <h3 className="featured-title">{artwork.title}</h3>
                <p className="featured-price">{artwork.price}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="section-cta">
          <Link to="/products" className="btn btn--outline">
            View All Artwork
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container about-content">
          <div className="about-text">
            <h4 className="section-label">About the Artist</h4>
            <h2 className="section-title">Mark J Peterson</h2>
            <p className="about-description">
              Mark J Peterson creates contemporary artwork that blends traditional
              techniques with modern aesthetics. Each piece is crafted with
              attention to detail and a passion for artistic expression.
            </p>
            <p className="about-description">
              From original paintings to limited edition prints, explore a diverse
              collection that brings art into your everyday life.
            </p>
            <Link to="/about" className="btn btn--secondary">
              Learn More
            </Link>
          </div>
          <div className="about-image">
            <img
              src="/images/homepage/artwork/IMG_1712.PNG"
              alt="Mark J Peterson Artwork"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section container">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">palette</span>
            </div>
            <h3>Original Artwork</h3>
            <p>One-of-a-kind pieces created by the artist</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">print</span>
            </div>
            <h3>Fine Art Prints</h3>
            <p>High-quality reproductions on premium paper</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">local_shipping</span>
            </div>
            <h3>Secure Shipping</h3>
            <p>Carefully packaged and insured delivery</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <h3>Authenticity</h3>
            <p>Certificate of authenticity with every purchase</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section container">
        <h2>Ready to start your collection?</h2>
        <p>Browse our gallery and find the perfect piece for your space</p>
        <Link to="/products" className="btn btn--primary">
          Shop All Artwork
        </Link>
      </section>
    </div>
  );
}
