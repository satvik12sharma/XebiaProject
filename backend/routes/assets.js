import express from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get assets (All for IT/HR, Assigned for employee)
router.get('/', authenticateToken, (req, res) => {
  const isIT = ['SUPER_ADMIN', 'HR', 'IT'].includes(req.user.role);
  
  if (!isIT) {
    if (!req.user.employeeId) {
      return res.status(400).json({ success: false, message: 'User profile not linked to an employee.' });
    }
    const myAssets = db.assets.find({ assignedTo: req.user.employeeId });
    return res.json({ success: true, assets: myAssets });
  }

  const allAssets = db.assets.find();
  const enriched = allAssets.map(asset => {
    const assignee = db.employees.findOne({ employeeId: asset.assignedTo });
    return {
      ...asset,
      assigneeName: assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Unassigned'
    };
  });
  
  res.json({ success: true, assets: enriched });
});

// Add asset (IT Admin only)
router.post('/', authenticateToken, requireRole(['SUPER_ADMIN', 'IT']), (req, res) => {
  const { assetName, serialNumber, type, assignedTo, status } = req.body;

  if (!assetName || !serialNumber || !type) {
    return res.status(400).json({ success: false, message: 'Asset Name, Serial Number, and Type are required.' });
  }

  const newAsset = db.assets.create({
    assetName,
    serialNumber,
    type,
    assignedTo: assignedTo || '',
    status: status || (assignedTo ? 'Assigned' : 'Available'),
    assignedDate: assignedTo ? new Date().toISOString().split('T')[0] : ''
  });

  res.json({ success: true, asset: newAsset });
});

// Update asset allocation/status
router.put('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'IT']), (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  const asset = db.assets.findById(id);
  if (!asset) {
    return res.status(404).json({ success: false, message: 'Asset not found.' });
  }

  if (updateFields.assignedTo && updateFields.assignedTo !== asset.assignedTo) {
    updateFields.assignedDate = new Date().toISOString().split('T')[0];
    updateFields.status = 'Assigned';

    // Notify employee of asset assignment
    db.notifications.create({
      recipientId: updateFields.assignedTo,
      message: `A new asset (${asset.assetName} - SN: ${asset.serialNumber}) has been assigned to you.`,
      read: false,
      createdAt: new Date().toISOString()
    });
  } else if (updateFields.assignedTo === '') {
    updateFields.assignedDate = '';
    updateFields.status = 'Available';
  }

  const updated = db.assets.findByIdAndUpdate(id, updateFields);
  res.json({ success: true, asset: updated });
});

export default router;
