import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import StaffEditModal from '../components/StaffEditModal';
import { getApiUrl } from '../config/api';

export default function AdminStaff() {
  // State management for staff and UI
  const [searchParams, setSearchParams] = useSearchParams();
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchStaff();
    fetchServices();
  }, []);

  // Check for staffId in URL params and open modal
  useEffect(() => {
    const staffId = searchParams.get('staffId');
    if (staffId && staff.length > 0) {
      const staffMember = staff.find(s => s._id === staffId);
      if (staffMember) {
        setSelectedStaff(staffMember);
        setViewMode(true);
        setIsModalOpen(true);
        // Remove the staffId from URL after opening modal
        setSearchParams({});
      }
    }
  }, [staff, searchParams, setSearchParams]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/staff'), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }

      const data = await response.json();
      setStaff(data.staff || data);
    } catch (err) {
      console.error('Failed to load staff:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
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
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getServiceNames = (serviceIds) => {
    if (!serviceIds || serviceIds.length === 0) return 'None';
    const names = serviceIds
      .map(id => {
        const service = services.find(s => s._id === id.toString());
        return service ? service.name : null;
      })
      .filter(Boolean);
    return names.length > 0 ? names.join(', ') : 'None';
  };

  if (loading) {
    return <div className="loading">Loading staff...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  const handleAddStaff = () => {
    setSelectedStaff(null);
    setViewMode(false);
    setIsModalOpen(true);
  };

  const handleViewStaff = (staffMember) => {
    setSelectedStaff(staffMember);
    setViewMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStaff(null);
    setViewMode(false);
  };

  const handleSaveStaff = (savedStaff) => {
    if (selectedStaff) {
      // Update existing staff member
      setStaff(staff.map(s =>
        s._id === savedStaff._id ? savedStaff : s
      ));
    } else {
      // Add new staff member
      setStaff([savedStaff, ...staff]);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Are you sure you want to deactivate this staff member? This action will set them as inactive.')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/staff/${staffId}`), {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate staff member');
      }

      // Update staff member in state to reflect deactivated status
      setStaff(staff.map(s =>
        s._id === staffId ? { ...s, isActive: false, acceptingBookings: false } : s
      ));
    } catch (err) {
      console.error('Failed to deactivate staff member:', err);
      alert('Failed to deactivate staff member. Please try again.');
    }
  };

  const handleExportData = () => {
    // Create CSV content
    const headers = ['ID', 'Name', 'Email', 'Title', 'Services', 'Status', 'Accepting Bookings', 'Date'];
    const rows = staff.map(staffMember => [
      `STF-${staffMember._id.slice(-8).toUpperCase()}`,
      staffMember.name,
      staffMember.email,
      staffMember.title || 'N/A',
      getServiceNames(staffMember.serviceIds),
      staffMember.isActive ? 'Active' : 'Inactive',
      staffMember.acceptingBookings ? 'Yes' : 'No',
      formatDate(staffMember.createdAt)
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
    link.setAttribute('download', `staff-export-${new Date().toISOString().split('T')[0]}.csv`);
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

  const getSortedStaff = () => {
    const sorted = [...staff].sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'email':
          aVal = a.email.toLowerCase();
          bVal = b.email.toLowerCase();
          break;
        case 'title':
          aVal = (a.title || '').toLowerCase();
          bVal = (b.title || '').toLowerCase();
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
      email: 'Email',
      title: 'Title',
      date: 'Date',
      id: 'ID'
    };
    return labels[sortBy] || 'Date';
  };

  return (
    <div className="admin-products">
      <div className="products-header">
        <h2>Staff</h2>
      </div>

      <div className="products-controls">
        <button className="add-product-btn" onClick={handleAddStaff}>
          <span className="material-symbols-outlined">add</span>
          Add Staff Member
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
              <button onClick={() => handleSort('email')}>Email</button>
              <button onClick={() => handleSort('title')}>Title</button>
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
              <th>Email</th>
              <th>Title</th>
              <th>Services</th>
              <th>Status</th>
              <th>Accepting Bookings</th>
              <th>Date</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {getSortedStaff().map((staffMember) => (
              <tr
                key={staffMember._id}
                onClick={() => handleViewStaff(staffMember)}
                style={{ cursor: 'pointer' }}
              >
                <td className="product-name" data-label="Name">{staffMember.name}</td>
                <td data-label="Email">{staffMember.email}</td>
                <td data-label="Title">{staffMember.title || 'N/A'}</td>
                <td data-label="Services" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {getServiceNames(staffMember.serviceIds)}
                </td>
                <td data-label="Status">
                  <span className={`status-badge ${staffMember.isActive ? 'status-active' : 'status-inactive'}`}>
                    {staffMember.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td data-label="Accepting Bookings">
                  <span className={`status-badge ${staffMember.acceptingBookings ? 'status-active' : 'status-inactive'}`}>
                    {staffMember.acceptingBookings ? 'Yes' : 'No'}
                  </span>
                </td>
                <td data-label="Date">{formatDate(staffMember.createdAt)}</td>
                <td className="product-id" data-label="ID">STF-{staffMember._id.slice(-8).toUpperCase()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && (
          <div className="no-data">No staff members found. Add your first staff member to get started!</div>
        )}
      </div>

      {isModalOpen && (
        <StaffEditModal
          staffMember={selectedStaff}
          services={services}
          onClose={handleCloseModal}
          onSave={handleSaveStaff}
          onDelete={handleDeleteStaff}
          viewMode={viewMode}
        />
      )}
    </div>
  );
}
