import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';

export default function AdminClients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');

  useEffect(() => {
    fetchClients();
  }, [submittedSearch]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = submittedSearch ? `?search=${encodeURIComponent(submittedSearch)}` : '';
      const response = await fetch(getApiUrl(`/api/clients${params}`), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load clients');
      }

      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Failed to load clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmittedSearch(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSubmittedSearch('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="loading">Loading clients...</div>;
  }

  return (
    <div className="admin-clients admin-customers">
      <div className="clients-header customers-header">
        <div>
          <h2>Clients</h2>
          <p className="clients-subtitle">Manage client profiles, preferences, and booking history.</p>
        </div>
        <form className="clients-search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search clients by name, email, or phone"
            className="search-input"
          />
          <button type="submit" className="btn btn--primary search-button">
            <span className="material-symbols-outlined">search</span>
            Search
          </button>
          {submittedSearch && (
            <button type="button" onClick={handleClearSearch} className="btn btn--secondary clear-button">
              Clear
            </button>
          )}
        </form>
      </div>

      {submittedSearch && (
        <div className="search-results-info">
          <p>Search results for: <strong>{submittedSearch}</strong> ({clients.length} {clients.length === 1 ? 'result' : 'results'})</p>
        </div>
      )}

      <div className="clients-table-container customers-table-container">
        <table className="clients-table customers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Total Bookings</th>
              <th>Joined</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {clients && clients.map((client) => (
              <tr
                key={client._id}
                onClick={() => navigate(`/admin/clients/${client._id}`)}
                className="clickable-row"
              >
                <td data-label="Name">{client.name}</td>
                <td data-label="Email">{client.email}</td>
                <td data-label="Phone">{client.phone || 'N/A'}</td>
                <td data-label="Total Bookings">{client.totalBookings || 0}</td>
                <td data-label="Joined">{formatDate(client.createdAt)}</td>
                <td data-label="Status">
                  <span className={`status-badge ${client.isActive ? 'status-active' : 'status-blocked'}`}>
                    {client.isActive ? 'Active' : 'Blocked'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && !loading && (
          <div className="no-data">
            {submittedSearch ? 'No clients found matching your search.' : 'No clients found.'}
          </div>
        )}
      </div>
    </div>
  );
}
