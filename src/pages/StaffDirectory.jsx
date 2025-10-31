import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { getApiUrl } from '../config/api';
import '../styles/StaffDirectory.css';

const PLACEHOLDER_COLORS = [
  'rgba(var(--rgb-primary), 0.45)',
  'rgba(var(--rgb-secondary), 0.12)',
  'rgba(var(--rgb-primary-light), 0.6)',
];

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function StaffAvatar({ name, photo, index }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt={name ? `Portrait of ${name}` : 'Staff portrait'}
        className="staff-directory__avatar"
        loading="lazy"
      />
    );
  }

  const background = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
  const initials = getInitials(name);

  return (
    <div
      className="staff-directory__avatar staff-directory__avatar--placeholder"
      aria-hidden="true"
      style={{ background }}
    >
      {initials || <span className="material-symbols-outlined">person</span>}
    </div>
  );
}

export default function StaffDirectory() {
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [staffResponse, servicesResponse] = await Promise.all([
          fetch(getApiUrl('/api/staff?limit=100&isActive=true'), {
            credentials: 'include',
          }),
          fetch(getApiUrl('/api/services')),
        ]);

        if (!staffResponse.ok) {
          throw new Error('Failed to load staff');
        }

        if (!servicesResponse.ok) {
          throw new Error('Failed to load services');
        }

        const staffData = await staffResponse.json();
        const servicesData = await servicesResponse.json();

        const staffList = staffData.staff || staffData;
        setStaff(
          (staffList || []).filter((member) => member.isActive !== false)
        );
        setServices(servicesData.services || servicesData);
      } catch (err) {
        console.error('Failed to load staff directory:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const visibleStaff = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return staff.filter((member) => {
      if (availabilityFilter === 'accepting' && !member.acceptingBookings) {
        return false;
      }

      if (availabilityFilter === 'paused' && member.acceptingBookings) {
        return false;
      }

      if (
        serviceFilter !== 'all' &&
        !(member.serviceIds || []).map((id) => id.toString()).includes(serviceFilter)
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        member.name,
        member.title,
        member.bio,
        ...(member.specialties || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [staff, availabilityFilter, serviceFilter, searchTerm]);

  return (
    <div className="staff-directory">
      <SEO
        title="Our Team"
        description="Meet the experts behind Clockwork. Browse our staff directory, learn more about their specialties, and find the right expert for your next session."
        keywords={['staff', 'team', 'experts', 'coaches', 'consultants']}
      />
      <section className="staff-directory__hero">
        <div className="staff-directory__hero-content">
          <span className="staff-directory__hero-kicker">Meet the team</span>
          <h1>Experts dedicated to your success</h1>
          <p>
            Browse our team of coaches, consultants, and specialists. Explore their backgrounds, specialties, and availability to find the perfect partner for your goals.
          </p>
        </div>
      </section>

      <section className="staff-directory__filters" aria-label="Staff filters">
        <div className="staff-directory__search" role="search">
          <label htmlFor="staff-search" className="sr-only">
            Search staff
          </label>
          <span className="material-symbols-outlined" aria-hidden="true">
            search
          </span>
          <input
            id="staff-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, role, or specialty"
            aria-label="Search staff directory"
          />
        </div>
        <div className="staff-directory__filter-controls">
          <label>
            Availability
            <select
              value={availabilityFilter}
              onChange={(event) => setAvailabilityFilter(event.target.value)}
            >
              <option value="all">All team members</option>
              <option value="accepting">Accepting bookings</option>
              <option value="paused">Currently unavailable</option>
            </select>
          </label>
          <label>
            Service
            <select
              value={serviceFilter}
              onChange={(event) => setServiceFilter(event.target.value)}
            >
              <option value="all">All services</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="staff-directory__grid" aria-live="polite">
        {loading && <p className="staff-directory__status">Loading team members...</p>}
        {error && !loading && (
          <p className="staff-directory__status staff-directory__status--error">
            {error}
          </p>
        )}
        {!loading && !error && visibleStaff.length === 0 && (
          <p className="staff-directory__status">
            No team members match your filters just yet. Try adjusting your search.
          </p>
        )}
        {!loading && !error &&
          visibleStaff.map((member, index) => (
            <article key={member._id} className="staff-directory__card">
              <StaffAvatar name={member.name} photo={member.photo} index={index} />
              <div className="staff-directory__card-body">
                <h2>{member.name}</h2>
                {member.title && <p className="staff-directory__card-title">{member.title}</p>}
                {member.specialties?.length > 0 && (
                  <ul className="staff-directory__specialties">
                    {member.specialties.slice(0, 3).map((specialty) => (
                      <li key={specialty}>{specialty}</li>
                    ))}
                  </ul>
                )}
                {member.bio && (
                  <p className="staff-directory__bio">
                    {member.bio.length > 180
                      ? `${member.bio.slice(0, 177)}...`
                      : member.bio}
                  </p>
                )}
                <div className="staff-directory__card-actions">
                  <Link to={`/staff/${member._id}`} className="btn btn-secondary">
                    View profile
                  </Link>
                  <Link
                    to={`/book?staff=${member._id}`}
                    className="btn btn-tertiary"
                    aria-label={`Book a session with ${member.name}`}
                  >
                    Book session
                    <span className="arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
      </section>
    </div>
  );
}
