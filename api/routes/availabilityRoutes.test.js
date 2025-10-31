import express from 'express';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../db/models/Availability.js', () => ({
  Availability: {
    findByStaff: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addException: vi.fn(),
    getAvailableSlots: vi.fn(),
  },
}));

vi.mock('../../db/models/Staff.js', () => ({
  Staff: {
    findById: vi.fn(),
    findByUserId: vi.fn(),
  },
}));

vi.mock('../../middleware/auth.js', () => ({
  authenticateToken: (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  },
}));

let availabilityRouter;
let authorizeAvailabilityManagement;
let Availability;
let Staff;

beforeAll(async () => {
  ({ availabilityRouter, authorizeAvailabilityManagement } = await import('./availabilityRoutes.js'));
  ({ Availability } = await import('../../db/models/Availability.js'));
  ({ Staff } = await import('../../db/models/Staff.js'));
});

describe('authorizeAvailabilityManagement', () => {
  it('allows admins to manage any availability', async () => {
    const result = await authorizeAvailabilityManagement({ role: 'admin', _id: 'admin1' }, { staffId: 'staff123' });
    expect(result.allowed).toBe(true);
  });

  it('allows providers to manage their own availability', async () => {
    Staff.findByUserId.mockResolvedValue({ _id: 'staff123' });

    const result = await authorizeAvailabilityManagement(
      { role: 'provider', _id: 'user1' },
      { staffId: 'staff123' }
    );

    expect(result.allowed).toBe(true);
  });

  it('rejects providers that are not linked to a staff profile', async () => {
    Staff.findByUserId.mockResolvedValue(null);

    const result = await authorizeAvailabilityManagement(
      { role: 'provider', _id: 'user1' },
      { staffId: 'staff123' }
    );

    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
  });

  it('rejects non-admin, non-provider roles', async () => {
    const result = await authorizeAvailabilityManagement({ role: 'client', _id: 'user1' }, { staffId: 'staff123' });
    expect(result.allowed).toBe(false);
    expect(result.status).toBe(403);
  });
});

describe('availabilityRoutes', () => {
  let app;
  let currentUser;

  async function makeRequest(method, path, body) {
    const server = app.listen(0);
    await new Promise((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });

    const { port } = server.address();

    try {
      const response = await fetch(`http://127.0.0.1:${port}${path}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });

      const text = await response.text();
      let parsedBody;
      try {
        parsedBody = text ? JSON.parse(text) : undefined;
      } catch (error) {
        parsedBody = text;
      }

      return { status: response.status, body: parsedBody };
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  }

  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = null;
    app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      if (currentUser) {
        req.user = currentUser;
      }
      next();
    });
    app.use('/api/availability', availabilityRouter);
  });

  it('creates a new availability for admin users', async () => {
    currentUser = { role: 'admin', _id: 'admin1' };
    Staff.findById.mockResolvedValue({ _id: 'staff123' });
    Availability.findByStaff.mockResolvedValue(null);
    Availability.create.mockResolvedValue({ _id: 'avail1', staffId: 'staff123', schedule: [] });

    const response = await makeRequest('POST', '/api/availability/staff/staff123', { schedule: [] });

    expect(response.status).toBe(201);
    expect(Availability.create).toHaveBeenCalledWith({ staffId: 'staff123', schedule: [] });
  });

  it('allows providers to create availability for their own staff record', async () => {
    currentUser = { role: 'provider', _id: 'provider1' };
    Staff.findById.mockResolvedValue({ _id: 'staff123' });
    Staff.findByUserId.mockResolvedValue({ _id: 'staff123' });
    Availability.findByStaff.mockResolvedValue(null);
    Availability.create.mockResolvedValue({ _id: 'avail1', staffId: 'staff123', schedule: [] });

    const response = await makeRequest('POST', '/api/availability/staff/staff123', { schedule: [] });

    expect(response.status).toBe(201);
    expect(Availability.create).toHaveBeenCalledTimes(1);
  });

  it('prevents providers from creating availability for other staff members', async () => {
    currentUser = { role: 'provider', _id: 'provider1' };
    Staff.findById.mockResolvedValue({ _id: 'staff456' });
    Staff.findByUserId.mockResolvedValue({ _id: 'staff123' });

    const response = await makeRequest('POST', '/api/availability/staff/staff456', { schedule: [] });

    expect(response.status).toBe(403);
    expect(Availability.create).not.toHaveBeenCalled();
  });

  it('returns conflict when availability already exists', async () => {
    currentUser = { role: 'admin', _id: 'admin1' };
    Staff.findById.mockResolvedValue({ _id: 'staff123' });
    Availability.findByStaff.mockResolvedValue({ _id: 'existing' });

    const response = await makeRequest('POST', '/api/availability/staff/staff123', { schedule: [] });

    expect(response.status).toBe(409);
    expect(Availability.create).not.toHaveBeenCalled();
  });

  it('updates availability schedules', async () => {
    currentUser = { role: 'admin', _id: 'admin1' };
    Availability.findById.mockResolvedValue({ _id: 'avail1', staffId: 'staff123' });
    Availability.update.mockResolvedValue({ _id: 'avail1', staffId: 'staff123', schedule: [] });

    const response = await makeRequest('PUT', '/api/availability/avail1', { schedule: [] });

    expect(response.status).toBe(200);
    expect(Availability.update).toHaveBeenCalledWith('avail1', { schedule: [] });
  });

  it('prevents providers from updating availability they do not own', async () => {
    currentUser = { role: 'provider', _id: 'provider1' };
    Availability.findById.mockResolvedValue({ _id: 'avail1', staffId: 'staff456' });
    Staff.findByUserId.mockResolvedValue({ _id: 'staff123' });

    const response = await makeRequest('PUT', '/api/availability/avail1', { schedule: [] });

    expect(response.status).toBe(403);
    expect(Availability.update).not.toHaveBeenCalled();
  });

  it('deletes availability schedules', async () => {
    currentUser = { role: 'admin', _id: 'admin1' };
    Availability.findById.mockResolvedValue({ _id: 'avail1', staffId: 'staff123' });
    Availability.delete.mockResolvedValue(true);

    const response = await makeRequest('DELETE', '/api/availability/avail1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Availability deleted successfully' });
    expect(Availability.delete).toHaveBeenCalledWith('avail1');
  });

  it('returns not found when deleting missing availability', async () => {
    currentUser = { role: 'admin', _id: 'admin1' };
    Availability.findById.mockResolvedValue(null);

    const response = await makeRequest('DELETE', '/api/availability/missing');

    expect(response.status).toBe(404);
    expect(Availability.delete).not.toHaveBeenCalled();
  });

  it('allows providers to add exceptions to their availability', async () => {
    currentUser = { role: 'provider', _id: 'provider1' };
    Availability.findById.mockResolvedValue({ _id: 'avail1', staffId: 'staff123' });
    Staff.findByUserId.mockResolvedValue({ _id: 'staff123' });
    Availability.addException.mockResolvedValue({ _id: 'avail1', staffId: 'staff123', exceptions: [] });

    const response = await makeRequest('POST', '/api/availability/avail1/exceptions', { date: '2025-02-14', type: 'unavailable' });

    expect(response.status).toBe(200);
    expect(Availability.addException).toHaveBeenCalledWith('avail1', { date: '2025-02-14', type: 'unavailable' });
  });
});
