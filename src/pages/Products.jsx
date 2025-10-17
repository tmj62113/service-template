import ProductGallery from '../components/products/ProductGallery';
import SEO from '../components/SEO';

export default function Products() {
  return (
    <>
      <SEO
        title="Shop"
        description="Browse and purchase original artwork and fine art prints by Mark J Peterson. Featuring steampunk, Victorian, and industrial-inspired pieces available as canvas prints, framed prints, and more."
        keywords={['buy art', 'art prints', 'steampunk prints', 'Victorian art prints', 'limited edition art', 'canvas prints', 'framed prints', 'metal prints']}
      />
      <ProductGallery />
    </>
  );
}