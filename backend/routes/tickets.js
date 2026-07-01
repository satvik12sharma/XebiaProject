import express from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get tickets (All for IT, Own for Employee)
router.get('/', authenticateToken, (req, res) => {
  const isIT = ['SUPER_ADMIN', 'HR', 'IT'].includes(req.user.role);
  
  if (!isIT) {
    if (!req.user.employeeId) {
      return res.status(400).json({ success: false, message: 'User profile not linked to an employee.' });
    }
    const tickets = db.tickets.find({ employeeId: req.user.employeeId });
    return res.json({ success: true, tickets });
  }

  const allTickets = db.tickets.find();
  const enriched = allTickets.map(tkt => {
    const requester = db.employees.findOne({ employeeId: tkt.employeeId });
    return {
      ...tkt,
      requesterName: requester ? `${requester.firstName} ${requester.lastName}` : 'System User'
    };
  });
  
  res.json({ success: true, tickets: enriched });
});

// Raise a ticket (Any employee)
router.post('/', authenticateToken, (req, res) => {
  const { title, description, priority } = req.body;
  const employeeId = req.user.employeeId;

  if (!employeeId) {
    return res.status(400).json({ success: false, message: 'User profile not linked to an employee.' });
  }

  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Title and Description are required' });
  }

  const newTicket = db.tickets.create({
    employeeId,
    title,
    description,
    priority: priority || 'Medium',
    status: 'Open',
    assignedTo: '',
    createdAt: new Date().toISOString()
  });

  // Notify IT Admins of new ticket
  const itUsers = db.users.find({ role: 'IT' });
  itUsers.forEach(it => {
    db.notifications.create({
      recipientId: it.employeeId || it._id,
      message: `New Help Desk ticket raised: "${title}"`,
      read: false,
      createdAt: new Date().toISOString()
    });
  });

  res.json({ success: true, ticket: newTicket });
});

// Update ticket status / assignee (IT Admin only)
router.put('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'IT']), (req, res) => {
  const { id } = req.params;
  const { status, assignedTo } = req.body;

  const ticket = db.tickets.findById(id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found.' });
  }

  const updateFields = {};
  if (status) updateFields.status = status;
  if (assignedTo !== undefined) updateFields.assignedTo = assignedTo;

  const updated = db.tickets.findByIdAndUpdate(id, updateFields);

  // Notify employee of update
  db.notifications.create({
    recipientId: ticket.employeeId,
    message: `Your IT support ticket "${ticket.title}" status has been updated to "${status || ticket.status}"`,
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json({ success: true, ticket: updated });
});

export default router;
