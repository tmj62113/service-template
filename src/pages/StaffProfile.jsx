import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { getApiUrl } from '../config/api';
import '../styles/StaffProfile.css';

export default function StaffProfile() {
  const { id } = useParams();
  const [staffMember, setStaffMember] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStaffMember() {
      try {
        setLoading(true);
        const [staffResponse, servicesResponse] = await Promise.all([
          fetch(getApiUrl(`/api/staff/${id}`)),
          fetch(getApiUrl('/api/services')),
        ]);

        if (!staffResponse.ok) {
          throw new Error('Staff member not found');
        }

        if (!servicesResponse.ok) {
          throw new Error('Failed to load services');
        }

        const staffData = await staffResponse.json();
        const servicesData = await servicesResponse.json();

        setStaffMember(staffData);
        setServices(servicesData.services || servicesData);
      } catch (err) {
        console.error('Failed to load staff profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStaffMember();
  }, [id]);

  const associatedServices = useMemo(() => {
    if (!staffMember) return [];
    const memberServiceIds = (staffMember.serviceIds || []).map((id) => id.toString());
    return services.filter((service) => memberServiceIds.includes(service._id));
  }, [staffMember, services]);

  if (loading) {
    return (
      <div className="staff-profile__status">
        <p>Loading team member...</p>
      </div>
    );
  }

  if (error || !staffMember) {
    return (
      <div className="staff-profile__status">
        <p role="alert">{error || 'Unable to find that staff member.'}</p>
        <Link to="/staff" className="btn btn-secondary">
          Back to team
        </Link>
      </div>
    );
  }

  return (
    <div className="staff-profile">
      <SEO
        title={`${staffMember.name} — Clockwork Team`}
        description={staffMember.bio || `${staffMember.name} is part of the Clockwork team.`}
        keywords={['staff', staffMember.name, staffMember.title, ...(staffMember.specialties || [])]}
      />

      <nav className="staff-profile__breadcrumbs" aria-label="Breadcrumb">
        <Link to="/" className="staff-profile__breadcrumb-link">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link to="/staff" className="staff-profile__breadcrumb-link">
          Our Team
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{staffMember.name}</span>
      </nav>

      <header className="staff-profile__header">
        <div className="staff-profile__media">
          {staffMember.photo ? (
            <img
              src={staffMember.photo}
              alt={`Portrait of ${staffMember.name}`}
              loading="lazy"
            />
          ) : (
            <div className="staff-profile__placeholder" aria-hidden="true">
              <span className="material-symbols-outlined">person</span>
            </div>
          )}
        </div>
        <div className="staff-profile__intro">
          <h1>{staffMember.name}</h1>
          {staffMember.title && <p className="staff-profile__title">{staffMember.title}</p>}
          {staffMember.specialties?.length > 0 && (
            <ul className="staff-profile__chips" aria-label="Specialties">
              {staffMember.specialties.map((specialty) => (
                <li key={specialty}>{specialty}</li>
              ))}
            </ul>
          )}
          <div className="staff-profile__cta">
            <Link to={`/book?staff=${staffMember._id}`} className="btn btn-primary">
              Book a session
            </Link>
            <a href="/contact" className="btn btn-tertiary">
              Contact team
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>
      </header>

      <section className="staff-profile__content">
        {staffMember.bio && (
          <article className="staff-profile__section">
            <h2>About {staffMember.name.split(' ')[0] || 'this team member'}</h2>
            <p>{staffMember.bio}</p>
          </article>
        )}

        <article className="staff-profile__section">
          <h2>Availability</h2>
          <p>
            {staffMember.acceptingBookings
              ? 'Currently accepting new bookings.'
              : 'Currently unavailable for new bookings.'}
          </p>
          <p>
            Default buffer between appointments: {staffMember.defaultBookingBuffer || 15} minutes.
          </p>
          <p>Time zone: {staffMember.timeZone}</p>
        </article>

        {associatedServices.length > 0 && (
          <article className="staff-profile__section">
            <h2>Services offered</h2>
            <ul className="staff-profile__service-list">
              {associatedServices.map((service) => (
                <li key={service._id}>
                  <h3>{service.name}</h3>
                  {service.description && <p>{service.description}</p>}
                  <div className="staff-profile__service-meta">
                    <span>{service.duration} minutes</span>
                    <span>${service.price}</span>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        )}

        {staffMember.email && (
          <article className="staff-profile__section staff-profile__contact">
            <h2>Connect with {staffMember.name.split(' ')[0]}</h2>
            <a href={`mailto:${staffMember.email}`} className="btn btn-secondary">
              Email {staffMember.name.split(' ')[0]}
            </a>
            {staffMember.phone && <p>Phone: {staffMember.phone}</p>}
          </article>
        )}
      </section>
    </div>
  );
}
