import { useState, useEffect, useRef } from "react";
import { getApiUrl } from "../config/api";
import { uploadImage } from "../utils/uploadImage";

export default function StaffEditModal({
  staffMember,
  services,
  onClose,
  onSave,
  onDelete,
  viewMode = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    bio: "",
    specialties: [],
    serviceIds: [],
    photo: "",
    timeZone: "America/New_York",
    defaultBookingBuffer: 15,
    isActive: true,
    acceptingBookings: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(!viewMode);
  const [specialtyInput, setSpecialtyInput] = useState("");
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (staffMember) {
      setFormData({
        name: staffMember.name || "",
        email: staffMember.email || "",
        phone: staffMember.phone || "",
        title: staffMember.title || "",
        bio: staffMember.bio || "",
        specialties: staffMember.specialties || [],
        serviceIds: staffMember.serviceIds?.map(id => id.toString()) || [],
        photo: staffMember.photo || "",
        timeZone: staffMember.timeZone || "America/New_York",
        defaultBookingBuffer: staffMember.defaultBookingBuffer || 15,
        isActive: staffMember.isActive !== undefined ? staffMember.isActive : true,
        acceptingBookings: staffMember.acceptingBookings !== undefined ? staffMember.acceptingBookings : true,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        title: "",
        bio: "",
        specialties: [],
        serviceIds: [],
        photo: "",
        timeZone: "America/New_York",
        defaultBookingBuffer: 15,
        isActive: true,
        acceptingBookings: true,
      });
    }
    setIsEditing(!viewMode);
  }, [staffMember, viewMode]);

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

  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => {
      const serviceIds = prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId];
      return { ...prev, serviceIds };
    });
  };

  const handleAddSpecialty = (e) => {
    e.preventDefault();
    if (specialtyInput.trim() && !formData.specialties.includes(specialtyInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, specialtyInput.trim()],
      }));
      setSpecialtyInput("");
    }
  };

  const handleRemoveSpecialty = (specialty) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = staffMember
        ? getApiUrl(`/api/staff/${staffMember._id}`)
        : getApiUrl("/api/staff");

      const method = staffMember ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          defaultBookingBuffer: parseInt(formData.defaultBookingBuffer),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save staff member");
      }

      const savedStaff = await response.json();
      onSave(savedStaff);
      onClose();
    } catch (err) {
      console.error("Failed to save staff member:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (staffMember) {
      onDelete(staffMember._id);
      onClose();
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const getServiceName = (serviceId) => {
    const service = services.find(s => s._id === serviceId.toString());
    return service ? service.name : 'Unknown Service';
  };

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Please upload an image smaller than 5MB');
      event.target.value = '';
      return;
    }

    setUploadingPhoto(true);
    setError(null);

    try {
      const uploadedUrl = await uploadImage(file);
      setFormData((prev) => ({
        ...prev,
        photo: uploadedUrl,
      }));
    } catch (uploadError) {
      console.error('Failed to upload staff photo:', uploadError);
      setError(uploadError.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      photo: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{staffMember ? (isEditing ? "Edit Staff Member" : "Staff Member Details") : "New Staff Member"}</h2>
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
                <div className="view-row" style={{ alignItems: 'flex-start' }}>
                  <label>Photo:</label>
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt={`Portrait of ${formData.name}`}
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    />
                  ) : (
                    <span style={{ color: 'var(--color-text-lighter)' }}>No photo uploaded</span>
                  )}
                </div>
                <div className="view-row">
                  <label>Name:</label>
                  <p>{formData.name}</p>
                </div>
                <div className="view-row">
                  <label>Email:</label>
                  <p>{formData.email}</p>
                </div>
                <div className="view-row">
                  <label>Phone:</label>
                  <p>{formData.phone || "Not provided"}</p>
                </div>
                <div className="view-row">
                  <label>Title:</label>
                  <p>{formData.title || "Not specified"}</p>
                </div>
                <div className="view-row">
                  <label>Bio:</label>
                  <p>{formData.bio || "No bio provided"}</p>
                </div>
                <div className="view-row">
                  <label>Specialties:</label>
                  <p>{formData.specialties.length > 0 ? formData.specialties.join(', ') : 'None'}</p>
                </div>
                <div className="view-row">
                  <label>Services:</label>
                  <p>{formData.serviceIds.length > 0 ? formData.serviceIds.map(getServiceName).join(', ') : 'None assigned'}</p>
                </div>
                <div className="view-row">
                  <label>Time Zone:</label>
                  <p>{formData.timeZone}</p>
                </div>
                <div className="view-row">
                  <label>Default Booking Buffer:</label>
                  <p>{formData.defaultBookingBuffer} minutes</p>
                </div>
                <div className="view-row">
                  <label>Status:</label>
                  <p>
                    <span className={`status-badge ${formData.isActive ? 'status-active' : 'status-inactive'}`}>
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <div className="view-row">
                  <label>Accepting Bookings:</label>
                  <p>
                    <span className={`status-badge ${formData.acceptingBookings ? 'status-active' : 'status-inactive'}`}>
                      {formData.acceptingBookings ? 'Yes' : 'No'}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              // Edit Mode
              <>
                <div className="form-group">
                  <label htmlFor="staffPhoto">Profile Photo</label>
                  <div
                    style={{
                      display: 'flex',
                      gap: 'var(--spacing-md)',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        width: '96px',
                        height: '96px',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        background: 'rgba(var(--rgb-primary), 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: formData.photo ? 'var(--shadow-sm)' : 'none',
                      }}
                    >
                      {formData.photo ? (
                        <img
                          src={formData.photo}
                          alt={formData.name ? `Portrait of ${formData.name}` : 'Uploaded staff portrait'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span className="material-symbols-outlined" aria-hidden="true">person</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="staffPhoto"
                        name="photo"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        aria-describedby="staffPhotoHelp"
                      />
                      <small id="staffPhotoHelp" style={{ color: 'var(--color-text-lighter)' }}>
                        Upload a square image (max 5MB). We'll optimize and crop to focus on faces.
                      </small>
                      {formData.photo && (
                        <button
                          type="button"
                          className="btn btn-tertiary"
                          onClick={handleRemovePhoto}
                          style={{ alignSelf: 'flex-start' }}
                        >
                          Remove photo
                        </button>
                      )}
                      {uploadingPhoto && (
                        <span style={{ color: 'var(--color-text-lighter)', fontSize: 'var(--font-size-sm)' }}>
                          Uploading photo...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., John Smith"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="e.g., john@example.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g., (555) 123-4567"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Senior Coach"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Tell us about this staff member's background and expertise..."
                  />
                </div>

                <div className="form-group">
                  <label>Specialties</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={specialtyInput}
                      onChange={(e) => setSpecialtyInput(e.target.value)}
                      placeholder="e.g., Leadership Coaching"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddSpecialty(e);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleAddSpecialty}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Add
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {formData.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 12px',
                          background: 'var(--color-primary)',
                          color: 'white',
                          borderRadius: '16px',
                          fontSize: '14px',
                        }}
                      >
                        {specialty}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialty(specialty)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '0',
                            lineHeight: '1',
                          }}
                          aria-label={`Remove ${specialty}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Services This Staff Member Can Provide</label>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '12px' }}>
                    {services.length === 0 ? (
                      <p style={{ margin: 0, color: '#666' }}>No services available. Create services first.</p>
                    ) : (
                      services.map((service) => (
                        <label key={service._id} className="checkbox-label" style={{ display: 'block', marginBottom: '8px' }}>
                          <input
                            type="checkbox"
                            checked={formData.serviceIds.includes(service._id)}
                            onChange={() => handleServiceToggle(service._id)}
                          />
                          <span>{service.name} ({service.duration} min)</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="timeZone">Time Zone</label>
                    <select
                      id="timeZone"
                      name="timeZone"
                      value={formData.timeZone}
                      onChange={handleChange}
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="America/Anchorage">Alaska Time</option>
                      <option value="Pacific/Honolulu">Hawaii Time</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="defaultBookingBuffer">Default Booking Buffer (minutes)</label>
                    <input
                      type="number"
                      id="defaultBookingBuffer"
                      name="defaultBookingBuffer"
                      value={formData.defaultBookingBuffer}
                      onChange={handleChange}
                      min="0"
                      step="5"
                    />
                    <small>Time between appointments</small>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                      />
                      <span>Active (staff member is active)</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="acceptingBookings"
                        checked={formData.acceptingBookings}
                        onChange={handleChange}
                      />
                      <span>Accepting Bookings (available for new bookings)</span>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            {viewMode && !isEditing ? (
              <>
                <button type="button" className="btn btn-primary" onClick={toggleEditMode}>
                  Edit Staff Member
                </button>
                {staffMember && (
                  <button type="button" className="btn btn-danger" onClick={handleDelete}>
                    Deactivate Staff Member
                  </button>
                )}
              </>
            ) : (
              <>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : staffMember ? "Update Staff Member" : "Create Staff Member"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
