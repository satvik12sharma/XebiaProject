import express from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all projects
router.get('/', authenticateToken, (req, res) => {
  const projects = db.projects.find();
  const enriched = projects.map(proj => {
    const mgr = db.employees.findOne({ employeeId: proj.manager });
    return {
      ...proj,
      managerName: mgr ? `${mgr.firstName} ${mgr.lastName}` : 'N/A'
    };
  });
  res.json({ success: true, projects: enriched });
});

// Create project
router.post('/', authenticateToken, requireRole(['SUPER_ADMIN', 'HR', 'MANAGER']), (req, res) => {
  const { projectName, description, manager, deadline } = req.body;

  if (!projectName || !deadline) {
    return res.status(400).json({ success: false, message: 'Project Name and Deadline are required.' });
  }

  const proj = db.projects.create({
    projectName,
    description: description || '',
    manager: manager || req.user.employeeId || '',
    status: 'In Progress',
    deadline
  });

  res.json({ success: true, project: proj });
});

// Get tasks (filtered by project or assigned user)
router.get('/tasks', authenticateToken, (req, res) => {
  const { projectId, assignedTo } = req.query;
  let list = db.tasks.find();

  if (projectId) {
    list = list.filter(t => t.projectId === projectId);
  }
  if (assignedTo) {
    list = list.filter(t => t.assignedTo === assignedTo);
  } else if (req.user.role === 'EMPLOYEE') {
    // Regular employees see only their tasks by default
    list = list.filter(t => t.assignedTo === req.user.employeeId);
  }

  const enrichedTasks = list.map(t => {
    const assignee = db.employees.findOne({ employeeId: t.assignedTo });
    return {
      ...t,
      assigneeName: assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Unassigned'
    };
  });

  res.json({ success: true, tasks: enrichedTasks });
});

// Create task
router.post('/tasks', authenticateToken, requireRole(['SUPER_ADMIN', 'HR', 'MANAGER']), (req, res) => {
  const { projectId, task, assignedTo, priority, deadline } = req.body;

  if (!projectId || !task || !assignedTo || !deadline) {
    return res.status(400).json({ success: false, message: 'Project, Task Name, Assignee and Deadline are required.' });
  }

  const projectRecord = db.projects.findById(projectId);
  if (!projectRecord) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const newTask = db.tasks.create({
    projectId,
    project: projectRecord.projectName,
    task,
    assignedTo, // One owner per task
    priority: priority || 'Medium',
    status: 'To Do',
    deadline, // Deadline mandatory
    comments: [],
    attachments: []
  });

  // Notify assignee
  db.notifications.create({
    recipientId: assignedTo,
    message: `You have been assigned a new task: "${task}" under project "${projectRecord.projectName}"`,
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json({ success: true, task: newTask });
});

// Update task status and details
router.put('/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status, comments, attachments } = req.body;

  const currentTask = db.tasks.findById(id);
  if (!currentTask) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  // Rule: Completed tasks become read-only
  if (currentTask.status === 'Completed') {
    return res.status(400).json({ success: false, message: 'Completed tasks are locked and read-only.' });
  }

  // Rule: Tasks cannot be marked Completed directly by regular employees without manager review
  const isEmployee = req.user.role === 'EMPLOYEE';
  if (status === 'Completed' && isEmployee && currentTask.status !== 'Review') {
    return res.status(400).json({
      success: false,
      message: 'Task must be moved to "Review" status first for manager approval.'
    });
  }

  const updateFields = {};
  if (status) updateFields.status = status;
  
  if (comments) {
    updateFields.comments = [...(currentTask.comments || []), {
      author: req.user.name,
      text: comments,
      timestamp: new Date().toISOString()
    }];
  }

  if (attachments) {
    updateFields.attachments = [...(currentTask.attachments || []), attachments];
  }

  const updated = db.tasks.findByIdAndUpdate(id, updateFields);

  // Notifications if task is completed
  if (status === 'Completed') {
    const project = db.projects.findById(currentTask.projectId);
    if (project && project.manager) {
      db.notifications.create({
        recipientId: project.manager,
        message: `Task "${currentTask.task}" has been completed by ${req.user.name}.`,
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  }

  res.json({ success: true, task: updated });
});

export default router;
