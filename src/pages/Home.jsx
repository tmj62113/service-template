import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Home.css';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

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

  // Contact form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
    mailingList: false,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Submit contact form message
      const response = await fetch('http://localhost:3001/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          subject: 'Contact Form Submission',
          message: formData.message,
          mailingList: formData.mailingList,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // If user opted in to mailing list, subscribe them to newsletter
      if (formData.mailingList) {
        try {
          await fetch('http://localhost:3001/api/newsletter/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              source: 'contact-form',
              metadata: {
                name: `${formData.firstName} ${formData.lastName}`,
                submittedAt: new Date().toISOString(),
              },
            }),
          });
        } catch (newsletterError) {
          console.error('Error subscribing to newsletter:', newsletterError);
          // Don't fail the contact form submission if newsletter signup fails
        }
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ firstName: '', lastName: '', email: '', message: '', mailingList: false });
      }, 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

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
                  <button className="btn btn--primary" onClick={() => navigate('/products')}>
                    {collection.name}
                  </button>
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

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2>CONTACT</h2>

          <div className="contact-intro">
            <p>
              Contact me directly at <a href="mailto:mark@mjpetersonart.com">mark@mjpetersonart.com</a> or leave a message below.
            </p>
          </div>

          <div className="contact-layout">
            {/* Contact Form */}
            {submitted ? (
              <div className="success-message">
                <h3>Thank you for your message!</h3>
                <p>We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">FIRST NAME</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">LAST NAME</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">EMAIL *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">MESSAGE</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id="mailingList"
                    name="mailingList"
                    checked={formData.mailingList}
                    onChange={handleChange}
                  />
                  <label htmlFor="mailingList">SIGN UP FOR MY MAILING LIST</label>
                </div>

                <button type="submit" className="submit-btn">
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
