import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ServiceEditModal from '../components/ServiceEditModal';
import { getApiUrl } from '../config/api';

export default function AdminServices() {
  // State management for services and UI
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchServices();
  }, []);

  // Check for serviceId in URL params and open modal
  useEffect(() => {
    const serviceId = searchParams.get('serviceId');
    if (serviceId && services.length > 0) {
      const service = services.find(s => s._id === serviceId);
      if (service) {
        setSelectedService(service);
        setViewMode(true);
        setIsModalOpen(true);
        // Remove the serviceId from URL after opening modal
        setSearchParams({});
      }
    }
  }, [services, searchParams, setSearchParams]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/services'), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      setServices(data.services || data);
    } catch (err) {
      console.error('Failed to load services:', err);
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

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return <div className="loading">Loading services...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  const handleAddService = () => {
    setSelectedService(null);
    setViewMode(false);
    setIsModalOpen(true);
  };

  const handleViewService = (service) => {
    setSelectedService(service);
    setViewMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
    setViewMode(false);
  };

  const handleSaveService = (savedService) => {
    if (selectedService) {
      // Update existing service
      setServices(services.map(s =>
        s._id === savedService._id ? savedService : s
      ));
    } else {
      // Add new service
      setServices([savedService, ...services]);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/services/${serviceId}`), {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      // Remove service from state
      setServices(services.filter(s => s._id !== serviceId));
    } catch (err) {
      console.error('Failed to delete service:', err);
      alert('Failed to delete service. Please try again.');
    }
  };

  const handleExportData = () => {
    // Create CSV content
    const headers = ['ID', 'Name', 'Category', 'Duration', 'Price', 'Status', 'Date'];
    const rows = services.map(service => [
      `SVC-${service._id.slice(-8).toUpperCase()}`,
      service.name,
      service.category,
      service.duration,
      service.price,
      service.isActive ? 'Active' : 'Inactive',
      formatDate(service.createdAt)
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
    link.setAttribute('download', `services-export-${new Date().toISOString().split('T')[0]}.csv`);
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

  const getSortedServices = () => {
    const sorted = [...services].sort((a, b) => {
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
        case 'duration':
          aVal = a.duration;
          bVal = b.duration;
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
      duration: 'Duration',
      date: 'Date',
      id: 'ID'
    };
    return labels[sortBy] || 'Date';
  };

  return (
    <div className="admin-products">
      <div className="products-header">
        <h2>Services</h2>
      </div>

      <div className="products-controls">
        <button className="add-product-btn" onClick={handleAddService}>
          <span className="material-symbols-outlined">add</span>
          Add Service
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
              <button onClick={() => handleSort('duration')}>Duration</button>
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
              <th>Category</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Status</th>
              <th>Date</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {getSortedServices().map((service) => (
              <tr
                key={service._id}
                onClick={() => handleViewService(service)}
                style={{ cursor: 'pointer' }}
              >
                <td className="product-name" data-label="Name">{service.name}</td>
                <td data-label="Category">{service.category}</td>
                <td data-label="Duration">{formatDuration(service.duration)}</td>
                <td className="product-price" data-label="Price">{formatCurrency(service.price)}</td>
                <td data-label="Status">
                  <span className={`status-badge ${service.isActive ? 'status-active' : 'status-inactive'}`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td data-label="Date">{formatDate(service.createdAt)}</td>
                <td className="product-id" data-label="ID">SVC-{service._id.slice(-8).toUpperCase()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && (
          <div className="no-data">No services found. Create your first service to get started!</div>
        )}
      </div>

      {isModalOpen && (
        <ServiceEditModal
          service={selectedService}
          onClose={handleCloseModal}
          onSave={handleSaveService}
          onDelete={handleDeleteService}
          viewMode={viewMode}
        />
      )}
    </div>
  );
}
