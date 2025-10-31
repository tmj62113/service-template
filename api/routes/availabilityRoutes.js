import express from 'express';
import { Availability } from '../../db/models/Availability.js';
import { Staff } from '../../db/models/Staff.js';
import { authenticateToken } from '../../middleware/auth.js';

const availabilityRouter = express.Router();

function toIdString(id) {
  if (!id) return undefined;
  return typeof id === 'string' ? id : id.toString();
}

export async function authorizeAvailabilityManagement(user, { staffId, availability } = {}) {
  if (!user) {
    return {
      allowed: false,
      status: 401,
      message: 'Authentication required',
    };
  }

  if (user.role === 'admin') {
    return { allowed: true };
  }

  if (user.role === 'provider') {
    const linkedStaff = await Staff.findByUserId(user._id);

    if (!linkedStaff) {
      return {
        allowed: false,
        status: 403,
        message: 'Forbidden: Provider account is not linked to a staff profile',
      };
    }

    const targetStaffId = staffId || toIdString(availability?.staffId);

    if (targetStaffId && toIdString(linkedStaff._id) !== targetStaffId) {
      return {
        allowed: false,
        status: 403,
        message: 'Forbidden: You can only manage your own availability',
      };
    }

    return { allowed: true, staff: linkedStaff };
  }

  return {
    allowed: false,
    status: 403,
    message: 'Forbidden: Admin or provider access required',
  };
}

availabilityRouter.get('/staff/:staffId', async (req, res) => {
  try {
    const availability = await Availability.findByStaff(req.params.staffId);

    if (!availability) {
      return res.status(404).json({ error: 'Availability not found for this staff member' });
    }

    res.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

availabilityRouter.get('/slots', async (req, res) => {
  try {
    const { staffId, date, duration, bufferTime = 0 } = req.query;

    if (!staffId || !date || !duration) {
      return res.status(400).json({ error: 'staffId, date, and duration are required' });
    }

    const slots = await Availability.getAvailableSlots(
      staffId,
      new Date(date),
      parseInt(duration),
      parseInt(bufferTime)
    );

    res.json({ slots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

availabilityRouter.post('/staff/:staffId', authenticateToken, async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const staffMember = await Staff.findById(staffId);

    if (!staffMember) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const authResult = await authorizeAvailabilityManagement(req.user, { staffId: toIdString(staffMember._id) });

    if (!authResult.allowed) {
      return res.status(authResult.status).json({ error: authResult.message });
    }

    const existing = await Availability.findByStaff(staffId);
    if (existing) {
      return res.status(409).json({ error: 'Availability already exists for this staff member' });
    }

    const availability = await Availability.create({
      staffId,
      ...req.body,
    });

    res.status(201).json(availability);
  } catch (error) {
    console.error('Error creating availability:', error);
    res.status(500).json({ error: 'Failed to create availability' });
  }
});

availabilityRouter.put('/:id', authenticateToken, async (req, res) => {
  try {
    const availabilityRecord = await Availability.findById(req.params.id);

    if (!availabilityRecord) {
      return res.status(404).json({ error: 'Availability not found' });
    }

    const authResult = await authorizeAvailabilityManagement(req.user, { availability: availabilityRecord });

    if (!authResult.allowed) {
      return res.status(authResult.status).json({ error: authResult.message });
    }

    const updated = await Availability.update(req.params.id, req.body);

    if (!updated) {
      return res.status(500).json({ error: 'Failed to update availability' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

availabilityRouter.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const availabilityRecord = await Availability.findById(req.params.id);

    if (!availabilityRecord) {
      return res.status(404).json({ error: 'Availability not found' });
    }

    const authResult = await authorizeAvailabilityManagement(req.user, { availability: availabilityRecord });

    if (!authResult.allowed) {
      return res.status(authResult.status).json({ error: authResult.message });
    }

    const deleted = await Availability.delete(req.params.id);

    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete availability' });
    }

    res.json({ message: 'Availability deleted successfully' });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({ error: 'Failed to delete availability' });
  }
});

availabilityRouter.post('/:id/exceptions', authenticateToken, async (req, res) => {
  try {
    const availabilityRecord = await Availability.findById(req.params.id);

    if (!availabilityRecord) {
      return res.status(404).json({ error: 'Availability not found' });
    }

    const authResult = await authorizeAvailabilityManagement(req.user, { availability: availabilityRecord });

    if (!authResult.allowed) {
      return res.status(authResult.status).json({ error: authResult.message });
    }

    const updated = await Availability.addException(req.params.id, req.body);

    if (!updated) {
      return res.status(500).json({ error: 'Failed to add exception' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error adding exception:', error);
    res.status(500).json({ error: 'Failed to add exception' });
  }
});

export { availabilityRouter };
