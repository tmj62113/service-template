import { useState, useEffect, useRef } from "react";
import { getApiUrl } from "../config/api";

export default function ServiceEditModal({
  service,
  onClose,
  onSave,
  onDelete,
  viewMode = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "1-on-1",
    duration: 60,
    price: 0,
    isActive: true,
    bufferTime: 0,
    maxAdvanceBooking: 30,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(!viewMode);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || "",
        description: service.description || "",
        category: service.category || "1-on-1",
        duration: service.duration || 60,
        price: service.price || 0,
        isActive: service.isActive !== undefined ? service.isActive : true,
        bufferTime: service.bufferTime || 0,
        maxAdvanceBooking: service.maxAdvanceBooking || 30,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category: "1-on-1",
        duration: 60,
        price: 0,
        isActive: true,
        bufferTime: 0,
        maxAdvanceBooking: 30,
      });
    }
    setIsEditing(!viewMode);
  }, [service, viewMode]);

  // Focus management for modal
  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);
    return () => {
      previousFocusRef.current?.focus();
    };
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = service
        ? getApiUrl(`/api/services/${service._id}`)
        : getApiUrl("/api/services");

      const method = service ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration),
          bufferTime: parseInt(formData.bufferTime),
          maxAdvanceBooking: parseInt(formData.maxAdvanceBooking),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save service");
      }

      const savedService = await response.json();
      onSave(savedService);
      onClose();
    } catch (err) {
      console.error("Failed to save service:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (service) {
      onDelete(service._id);
      onClose();
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{service ? (isEditing ? "Edit Service" : "Service Details") : "New Service"}</h2>
          <button
            ref={closeButtonRef}
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="modal-error">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {viewMode && !isEditing ? (
              // View Mode
              <div className="product-view">
                <div className="view-row">
                  <label>Service Name:</label>
                  <p>{formData.name}</p>
                </div>
                <div className="view-row">
                  <label>Category:</label>
                  <p>{formData.category}</p>
                </div>
                <div className="view-row">
                  <label>Description:</label>
                  <p>{formData.description || "No description provided"}</p>
                </div>
                <div className="view-row">
                  <label>Duration:</label>
                  <p>{formData.duration} minutes</p>
                </div>
                <div className="view-row">
                  <label>Price:</label>
                  <p>{formatCurrency(formData.price)}</p>
                </div>
                <div className="view-row">
                  <label>Buffer Time:</label>
                  <p>{formData.bufferTime} minutes</p>
                </div>
                <div className="view-row">
                  <label>Max Advance Booking:</label>
                  <p>{formData.maxAdvanceBooking} days</p>
                </div>
                <div className="view-row">
                  <label>Status:</label>
                  <p>
                    <span className={`status-badge ${formData.isActive ? 'status-active' : 'status-inactive'}`}>
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              // Edit Mode
              <>
                <div className="form-group">
                  <label htmlFor="name">Service Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 60-Minute Coaching Session"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="1-on-1">1-on-1</option>
                      <option value="Group Session">Group Session</option>
                      <option value="Workshop">Workshop</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="duration">Duration (minutes) *</label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                      min="15"
                      step="15"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe what this service includes..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">Price (USD) *</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bufferTime">Buffer Time (minutes)</label>
                    <input
                      type="number"
                      id="bufferTime"
                      name="bufferTime"
                      value={formData.bufferTime}
                      onChange={handleChange}
                      min="0"
                      step="5"
                    />
                    <small>Time between appointments</small>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="maxAdvanceBooking">Max Advance Booking (days)</label>
                  <input
                    type="number"
                    id="maxAdvanceBooking"
                    name="maxAdvanceBooking"
                    value={formData.maxAdvanceBooking}
                    onChange={handleChange}
                    min="1"
                  />
                  <small>How far in advance clients can book</small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <span>Active (available for booking)</span>
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            {viewMode && !isEditing ? (
              <>
                <button type="button" className="btn btn-primary" onClick={toggleEditMode}>
                  Edit Service
                </button>
                {service && (
                  <button type="button" className="btn btn-danger" onClick={handleDelete}>
                    Delete Service
                  </button>
                )}
              </>
            ) : (
              <>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : service ? "Update Service" : "Create Service"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
