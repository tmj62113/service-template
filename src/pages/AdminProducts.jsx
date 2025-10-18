import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductEditModal from '../components/ProductEditModal';
import { getApiUrl } from '../config/api';

export default function AdminProducts() {
  // State management for products and UI
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchProducts();
  }, []);

  // Check for productId in URL params and open modal
  useEffect(() => {
    const productId = searchParams.get('productId');
    if (productId && products.length > 0) {
      const product = products.find(p => p._id === productId);
      if (product) {
        setSelectedProduct(product);
        setViewMode(true);
        setIsModalOpen(true);
        // Remove the productId from URL after opening modal
        setSearchParams({});
      }
    }
  }, [products, searchParams, setSearchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/products'), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setViewMode(false);
    setIsModalOpen(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setViewMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setViewMode(false);
  };

  const handleSaveProduct = (savedProduct) => {
    if (selectedProduct) {
      // Update existing product
      setProducts(products.map(p =>
        p._id === savedProduct._id ? savedProduct : p
      ));
    } else {
      // Add new product
      setProducts([savedProduct, ...products]);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/products/${productId}`), {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Remove product from state
      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleExportData = () => {
    // Create CSV content
    const headers = ['ID', 'Name', 'Status', 'Category', 'Price', 'Stock', 'Date'];
    const rows = products.map(product => [
      `PRD-${product._id.slice(-8).toUpperCase()}`,
      product.name,
      product.status,
      product.category,
      product.price,
      product.stock,
      formatDate(product.createdAt)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `products-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortedProducts = () => {
    const sorted = [...products].sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'stock':
          aVal = a.stock;
          bVal = b.stock;
          break;
        case 'date':
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        case 'id':
          aVal = a._id;
          bVal = b._id;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const getSortLabel = () => {
    const labels = {
      name: 'Name',
      price: 'Price',
      stock: 'Stock',
      date: 'Date',
      id: 'ID'
    };
    return labels[sortBy] || 'Date';
  };

  return (
    <div className="admin-products">
      <div className="products-header">
        <h2>Products</h2>
      </div>

      <div className="products-controls">
        <button className="add-product-btn" onClick={handleAddProduct}>
          <span className="material-symbols-outlined">add</span>
          Add Product
        </button>
        <div className="products-actions">
          <button className="control-btn" onClick={handleExportData}>
            <span className="material-symbols-outlined">download</span>
            Export data
          </button>
          <div className="sort-dropdown">
            <button className="control-btn">
              Sort by: {getSortLabel()}
              <span className="material-symbols-outlined">
                {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
              </span>
            </button>
            <div className="sort-menu">
              <button onClick={() => handleSort('name')}>Name</button>
              <button onClick={() => handleSort('price')}>Price</button>
              <button onClick={() => handleSort('stock')}>Stock</button>
              <button onClick={() => handleSort('date')}>Date</button>
              <button onClick={() => handleSort('id')}>ID</button>
            </div>
          </div>
        </div>
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Date</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {getSortedProducts().map((product) => (
              <tr
                key={product._id}
                onClick={() => handleViewProduct(product)}
                style={{ cursor: 'pointer' }}
              >
                <td className="product-name" data-label="Name">{product.name}</td>
                <td data-label="Status">
                  <span className={`status-badge status-${product.status.toLowerCase().replace(' ', '-')}`}>
                    {product.status}
                  </span>
                </td>
                <td data-label="Category">{product.category}</td>
                <td className="product-price" data-label="Price">{formatCurrency(product.price)}</td>
                <td data-label="Stock">
                  <span className={`stock-indicator ${product.stock <= 10 ? 'low-stock' : ''}`}>
                    {product.stock}
                  </span>
                </td>
                <td data-label="Date">{formatDate(product.createdAt)}</td>
                <td className="product-id" data-label="ID">PRD-{product._id.slice(-8).toUpperCase()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="no-data">No products found</div>
        )}
      </div>

      <ProductEditModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        viewMode={viewMode}
        onEditToggle={() => setViewMode(false)}
      />
    </div>
  );
}
