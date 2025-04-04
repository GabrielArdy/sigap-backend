import express from 'express';
import leaveRequestController from '../controllers/leave_request_controller.js';

const router = express.Router();

// Create a new leave request
router.post('/requests', leaveRequestController.createRequestLeave);

// Get all leave requests with optional filtering
router.get('/requests', leaveRequestController.getAllRequestLeave);

// Get dashboard list of leave requests
router.get('/requests/list', leaveRequestController.getLeaveRequestsList);

// Get leave request by ID
router.get('/requests/:requestId', leaveRequestController.getRequestLeaveByRequestId);

// Update leave request
router.put('/requests/:requestId', leaveRequestController.updateRequestLeave);

// Update open status (open/close request)
router.patch('/requests/:requestId/status', leaveRequestController.updateStatusOpen);

// Approve or reject leave request
router.patch('/requests/:requestId/approval', leaveRequestController.approveOrRejectLeaveRequest);

// Get leave requests by user
router.get('/user/:userId/requests', leaveRequestController.getLeaveRequestsByEmployee);

// Get leave requests by approver
router.get('/approver/:approverId/requests', leaveRequestController.getLeaveRequestsByApprover);

// Delete leave request
router.delete('/requests/:requestId', leaveRequestController.deleteLeaveRequest);

export default router;
