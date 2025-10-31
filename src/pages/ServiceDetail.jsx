import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles/ServiceDetail.css';

function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useEffect(() => {
    fetchService();
  }, [id]);

  useEffect(() => {
    if (service && service.staffIds && service.staffIds.length > 0) {
      fetchStaff();
    }
  }, [service]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/services/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Service not found');
        }
        throw new Error('Failed to fetch service');
      }

      const data = await response.json();
      setService(data);
      setSelectedStaff(null);
      setError(null);
    } catch (err) {
      console.error('Error fetching service:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch(`/api/staff?serviceId=${id}&isActive=true&acceptingBookings=true`);
      if (!response.ok) throw new Error('Failed to fetch staff');

      const data = await response.json();
      setStaff(data.staff || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  const fetchRelatedServices = useCallback(async (category, currentServiceId) => {
    if (!category) return;

    const params = new URLSearchParams({
      isActive: 'true',
      limit: '6',
      category,
    });

    try {
      setRelatedLoading(true);
      const response = await fetch(`/api/services?${params}`);
      if (!response.ok) throw new Error('Failed to fetch related services');

      const data = await response.json();
      const related = (data.services || [])
        .filter((item) => item._id !== currentServiceId)
        .slice(0, 3);
      setRelatedServices(related);
    } catch (err) {
      console.error('Error fetching related services:', err);
      setRelatedServices([]);
    } finally {
      setRelatedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (service?.category) {
      fetchRelatedServices(service.category, service._id);
    } else {
      setRelatedServices([]);
    }
  }, [service, fetchRelatedServices]);

  const formatPrice = (priceInCents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInCents / 100);
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const handleBookNow = () => {
    // Navigate to booking flow with service and optionally selected staff
    const params = new URLSearchParams({
      service: id,
    });
    if (selectedStaff) {
      params.append('staff', selectedStaff);
    }
    navigate(`/book?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="service-detail-page section-container--wide">
        <div className="loading">Loading service...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="service-detail-page section-container--wide">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/services" className="btn btn-primary">
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  return (
    <div className="service-detail-page section-container--wide">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
          <Link to="/services">Services</Link>
          <span className="breadcrumb-separator">/</span>
          <span>{service.name}</span>
        </nav>

        <div className="service-detail-grid">
          {/* Image Section */}
          {service.image && (
            <div className="service-detail-image">
              <img src={service.image} alt={service.name} />
            </div>
          )}

          {/* Content Section */}
          <div className="service-detail-content">
            <div className="service-category-badge">{service.category}</div>
            <h1 className="service-detail-title">{service.name}</h1>

            <div className="service-detail-meta">
              <div className="meta-item">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z"/>
                  <path d="M8 3.5a.5.5 0 01.5.5v4.21l2.65 1.53a.5.5 0 01-.5.87L7.85 8.85A.5.5 0 017.5 8.5V4a.5.5 0 01.5-.5z"/>
                </svg>
                <span>{formatDuration(service.duration)}</span>
              </div>

              <div className="meta-item price">
                {formatPrice(service.price)}
              </div>
            </div>

            <div className="service-detail-description">
              <h2>About This Service</h2>
              <p>{service.description}</p>
            </div>

            {/* Cancellation Policy */}
            {service.cancellationPolicy && (
              <div className="service-detail-policy">
                <h3>Cancellation Policy</h3>
                <p>
                  Cancel up to {service.cancellationPolicy.hoursBeforeStart} hours before your appointment
                  for a {service.cancellationPolicy.refundPercentage}% refund.
                </p>
              </div>
            )}

            {/* Buffer Time */}
            {service.bufferTime > 0 && (
              <div className="service-detail-info">
                <p className="info-text">
                  <strong>Note:</strong> A {service.bufferTime} minute buffer is included after each session.
                </p>
              </div>
            )}

            {/* Staff Selection */}
            {staff.length > 0 && (
              <div className="staff-selection">
                <h3>Choose Your Coach/Consultant (Optional)</h3>
                <div className="staff-grid">
                  <button
                    className={`staff-card ${selectedStaff === null ? 'selected' : ''}`}
                    onClick={() => setSelectedStaff(null)}
                  >
                    <div className="staff-avatar-placeholder">
                      <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm0 1a4.5 4.5 0 00-4.5 4.5.5.5 0 00.5.5h8a.5.5 0 00.5-.5A4.5 4.5 0 008 9z"/>
                      </svg>
                    </div>
                    <div className="staff-info">
                      <div className="staff-name">Any Available</div>
                      <div className="staff-title">First available coach</div>
                    </div>
                  </button>

                  {staff.map((member) => (
                    <button
                      key={member._id}
                      className={`staff-card ${selectedStaff === member._id ? 'selected' : ''}`}
                      onClick={() => setSelectedStaff(member._id)}
                    >
                      {member.photo ? (
                        <div className="staff-avatar">
                          <img src={member.photo} alt={member.name} />
                        </div>
                      ) : (
                        <div className="staff-avatar-placeholder">
                          <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm0 1a4.5 4.5 0 00-4.5 4.5.5.5 0 00.5.5h8a.5.5 0 00.5-.5A4.5 4.5 0 008 9z"/>
                          </svg>
                        </div>
                      )}
                      <div className="staff-info">
                        <div className="staff-name">{member.name}</div>
                        {member.title && <div className="staff-title">{member.title}</div>}
                        {member.specialties && member.specialties.length > 0 && (
                          <div className="staff-specialties">
                            {member.specialties.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Book Button */}
            <button
              onClick={handleBookNow}
              className="btn btn-primary btn-lg book-now-button"
            >
              Book This Service
            </button>
          </div>
        </div>

        {(relatedLoading || relatedServices.length > 0) && (
          <section className="related-services-section" aria-label="Related services">
            <div className="related-services-header">
              <h2>Explore more services</h2>
              <p>Discover additional ways we can support your goals.</p>
            </div>

            {relatedLoading ? (
              <div className="related-services-loading">Loading related services...</div>
            ) : (
              <div className="related-services-grid">
                {relatedServices.map((related) => (
                  <Link
                    key={related._id}
                    to={`/services/${related._id}`}
                    className="related-service-card"
                  >
                    {related.image && (
                      <div className="related-service-image">
                        <img src={related.image} alt={related.name} />
                      </div>
                    )}
                    <div className="related-service-content">
                      <div className="related-service-category">{related.category}</div>
                      <h3 className="related-service-title">{related.name}</h3>
                      <p className="related-service-description">
                        {related.description && related.description.length > 90
                          ? `${related.description.substring(0, 90)}...`
                          : related.description}
                      </p>
                      <div className="related-service-meta">
                        <span>{formatDuration(related.duration)}</span>
                        <span className="related-service-price">{formatPrice(related.price)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
                {(!relatedServices || relatedServices.length === 0) && !relatedLoading && (
                  <div className="related-services-empty">No additional services available right now.</div>
                )}
              </div>
            )}
          </section>
        )}
    </div>
  );
}

export default ServiceDetail;
