import SEO from "../components/SEO";
import "./Gallery.css";

export default function Gallery() {
  // Artwork grid - masonry layout
  const artworkGrid = [
    { image: "/images/homepage/artwork/IMG_1712.PNG", size: "tall" },
    { image: "/images/homepage/artwork/IMG_1714.JPG", size: "tall" },
    { image: "/images/homepage/artwork/IMG_1716.PNG", size: "medium" },
    { image: "/images/homepage/artwork/IMG_1720.PNG", size: "small" },
    { image: "/images/homepage/artwork/IMG_1722.PNG", size: "small" },
    { image: "/images/homepage/artwork/IMG_1725.PNG", size: "medium" },
    { image: "/images/homepage/artwork/IMG_1730.PNG", size: "tall" },
    { image: "/images/homepage/artwork/IMG_1732.JPG", size: "medium" },
    { image: "/images/homepage/artwork/IMG_1733.PNG", size: "tall" },
    { image: "/images/homepage/artwork/IMG_1735.PNG", size: "medium" },
    { image: "/images/homepage/artwork/IMG_1736.JPG", size: "small" },
    { image: "/images/homepage/artwork/IMG_1738.PNG", size: "tall" },
    { image: "/images/homepage/artwork/IMG_1740.PNG", size: "small" },
    { image: "/images/homepage/artwork/IMG_1742.PNG", size: "medium" },
    { image: "/images/homepage/artwork/IMG_1746.PNG", size: "tall" },
    { image: "/images/homepage/artwork/IMG_1748.JPG", size: "medium" },
    { image: "/images/homepage/artwork/IMG_1749.PNG", size: "tall" },
  ];

  return (
    <div className="gallery-container">
      <SEO
        title="Gallery"
        description="Explore the complete collection of steampunk and Victorian-inspired artwork by Mark J Peterson. Browse original pieces, limited edition prints, and unique brass and copper artwork."
        keywords={[
          "art gallery",
          "steampunk gallery",
          "Victorian art collection",
          "brass artwork gallery",
          "copper art",
          "fine art prints",
          "Mark J Peterson gallery",
          "industrial art collection",
        ]}
      />

      {/* Artwork Grid Section */}
      <section className="artwork-section">
        <div className="container">
          <div className="section-header">
            <h2>Gallery</h2>
            <p>
              Each image may be purchased as a canvas print, framed print, metal
              print, and more! Every purchase comes with a 30-day money-back
              guarantee.
            </p>
          </div>

          <div className="masonry-grid">
            {artworkGrid.map((item, index) => (
              <div
                key={index}
                className={`masonry-item masonry-item--${item.size}`}
              >
                <img src={item.image} alt={`Artwork ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
