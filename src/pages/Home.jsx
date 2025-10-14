import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Home.css';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero slideshow images
  const slideshowImages = [
    { id: 1, src: '/images/homepage/slideshow/IMG_1719.JPG', alt: 'Steampunk Dreams' },
    { id: 2, src: '/images/homepage/slideshow/IMG_1724.JPG', alt: 'Industrial Elegance' },
    { id: 3, src: '/images/homepage/slideshow/IMG_1727.JPG', alt: 'Victorian Automatons' },
    { id: 4, src: '/images/homepage/slideshow/IMG_1731.JPG', alt: 'Artistic Machinery' },
    { id: 5, src: '/images/homepage/slideshow/IMG_1751.JPG', alt: 'Creative Visions' },
  ];

  // Auto-advance slideshow every 5 seconds
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
    setCurrentSlide((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);
  };

  // Collections - 3 collections with 3x2 grids
  const collections = [
    {
      name: 'Steampunk Art',
      count: '24 pieces',
      images: [
        '/images/homepage/collections/grid-1/00tv_bowlingpin.JPG',
        '/images/homepage/collections/grid-1/02AA6A1994-BAF2-48F8-A901-F77C84B379DC.png',
        '/images/homepage/collections/grid-1/03shapes_1.png',
        '/images/homepage/collections/grid-1/04shapes_2.png',
        '/images/homepage/collections/grid-1/05shapes_3.png',
        '/images/homepage/collections/grid-1/meditate.png',
      ],
    },
    {
      name: 'Brass & Copper',
      count: '32 pieces',
      images: [
        '/images/homepage/collections/grid 2/airplane.JPG',
        '/images/homepage/collections/grid 2/computer_man.JPG',
        '/images/homepage/collections/grid 2/memory.PNG',
        '/images/homepage/collections/grid 2/relic_1.PNG',
        '/images/homepage/collections/grid 2/relic_3.jpeg',
        '/images/homepage/collections/grid 2/robot.PNG',
      ],
    },
    {
      name: 'Victorian Dreams',
      count: '15 pieces',
      images: [
        '/images/homepage/collections/ink/IMG_1165.JPG',
        '/images/homepage/collections/ink/IMG_1166.JPG',
        '/images/homepage/collections/ink/IMG_1167.JPG',
        '/images/homepage/collections/ink/IMG_2202.JPG',
        '/images/homepage/collections/ink/ink_1.JPG',
        '/images/homepage/collections/ink/ink_2.png',
      ],
    },
  ];

  // Artwork grid - masonry layout
  const artworkGrid = [
    { image: '/images/homepage/artwork/IMG_1712.PNG', size: 'tall' },
    { image: '/images/homepage/artwork/IMG_1714.JPG', size: 'tall' },
    { image: '/images/homepage/artwork/IMG_1716.PNG', size: 'medium' },
    { image: '/images/homepage/artwork/IMG_1720.PNG', size: 'small' },
    { image: '/images/homepage/artwork/IMG_1722.PNG', size: 'small' },
    { image: '/images/homepage/artwork/IMG_1725.PNG', size: 'medium' },
    { image: '/images/homepage/artwork/IMG_1730.PNG', size: 'tall' },
    { image: '/images/homepage/artwork/IMG_1732.JPG', size: 'medium' },
    { image: '/images/homepage/artwork/IMG_1733.PNG', size: 'tall' },
    { image: '/images/homepage/artwork/IMG_1735.PNG', size: 'medium' },
    { image: '/images/homepage/artwork/IMG_1736.JPG', size: 'small' },
    { image: '/images/homepage/artwork/IMG_1738.PNG', size: 'tall' },
    { image: '/images/homepage/artwork/IMG_1740.PNG', size: 'small' },
    { image: '/images/homepage/artwork/IMG_1742.PNG', size: 'medium' },
    { image: '/images/homepage/artwork/IMG_1746.PNG', size: 'tall' },
    { image: '/images/homepage/artwork/IMG_1748.JPG', size: 'medium' },
    { image: '/images/homepage/artwork/IMG_1749.PNG', size: 'tall' },
  ];

  // Featured artwork products
  const featuredArtwork = [
    {
      id: 0,
      title: 'Clockwork Heart',
      image: '/images/homepage/featured/IMG_1712.PNG',
      price: '$165',
    },
    {
      id: 1,
      title: 'Brass Butterfly',
      image: '/images/homepage/artwork/IMG_1714.JPG',
      price: '$145',
    },
    {
      id: 2,
      title: 'Steam Engine Dreams',
      image: '/images/homepage/artwork/IMG_1720.PNG',
      price: '$185',
    },
    {
      id: 3,
      title: 'Mechanical Rose',
      image: '/images/homepage/featured/IMG_1712.PNG',
      price: '$155',
    },
  ];

  return (
    <div className="home-container">
      {/* Hero Slideshow */}
      <section className="hero-slideshow">
        <div className="slideshow-container">
          {slideshowImages.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.src})` }}
            />
          ))}

          {/* Slideshow Controls */}
          <button className="slideshow-control prev" onClick={prevSlide} aria-label="Previous slide">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="slideshow-control next" onClick={nextSlide} aria-label="Next slide">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          {/* Dot Indicators */}
          <div className="slideshow-dots">
            {slideshowImages.map((_, index) => (
              <button
                key={index}
                className={`dot-indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="collections-section">
        <div className="container">
          <div className="section-header">
            <h2>MJ Peterson Art Collections</h2>
            <p>
              Shop for artwork from Gallery Owners and Dealers from all over the world. Through my partnership with Curated Art Source, these limited edition prints are available direct to you.
            </p>
          </div>

          <div className="collections-grid-container">
            {collections.map((collection, index) => (
              <div key={index} className="collection-card">
                <div className="collection-images">
                  {collection.images.map((image, idx) => (
                    <img key={idx} src={image} alt={`${collection.name} ${idx + 1}`} />
                  ))}
                </div>
                <div className="collection-info">
                  <button className="btn btn--primary">{collection.name}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Artwork Grid Section */}
      <section className="artwork-section">
        <div className="container">
          <div className="section-header">
            <h2>Artwork by MJ Peterson</h2>
            <p>
              Each image may be purchased as a canvas print, framed print, metal print, and more! Every purchase comes with a 30-day money-back guarantee.
            </p>
          </div>

          <div className="masonry-grid">
            {artworkGrid.map((item, index) => (
              <div key={index} className={`masonry-item masonry-item--${item.size}`}>
                <img src={item.image} alt={`Artwork ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <h2>About MJ Peterson</h2>
          <p>
            Capturing the intersection of Victorian elegance and industrial innovation, MJ Peterson's work explores the romance of machinery and the poetry of mechanical precision.
          </p>
          <p>
            Each piece is hand-crafted with archival materials, celebrating the beauty of brass, copper, and the intricate dance of gears and springs.
          </p>
        </div>
      </section>

      {/* Featured Artwork Section */}
      <section className="featured-section">
        <div className="container">
          <h2>Featured Artwork</h2>

          <div className="featured-grid">
            {featuredArtwork.map((artwork) => (
              <Link key={artwork.id} to={`#artwork-${artwork.id}`} className="featured-card">
                <img src={artwork.image} alt={artwork.title} />
                <div className="featured-info">
                  <h3>{artwork.title}</h3>
                  <p className="price">{artwork.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
