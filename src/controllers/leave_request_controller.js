import leaveRequestService from "../services/request_leave_service.js";
import constant from "../utils/constant.js";
import { v4 as uuidv4 } from 'uuid'; // Assuming you're using uuid for ID generation
import userRepository from "../database/repository/user_repository.js";

class LeaveRequestController {
    async createRequestLeave(req, res) {
        try {
            const { 
                requestType,
                requesterId, 
                requestedStartDate, 
                requestedEndDate, 
                description, 
                attachment,
            } = req.body;
            
            // Validate required fields
            if (!requestType || !requesterId || !requestedStartDate || !requestedEndDate || !description ) {
                return res.status(400).json({ success: false, message: "Missing required fields" });
            }
            
            const requestData = {
                requestId: uuidv4(), // Generate unique ID
                requestType,
                requesterId,
                requestedStartDate,
                requestedEndDate,
                description,
                attachment: attachment || "",
                approverId: "-",
                aprovalStatus: constant.PENDING,
                requestedAt: new Date(),
                updatedAt: new Date(),
                isOpen: false
            };
            
            const newRequest = await leaveRequestService.createLeaveRequest(requestData);
            
            return res.status(201).json({
                success: true,
                message: "Leave request created successfully",
                data: newRequest
            });
        } catch (error) {
            console.error("Create leave request error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to create leave request",
                error: error.message
            });
        }
    }
    
    async updateRequestLeave(req, res) {
        try {
            const { requestId } = req.params;
            const updateData = req.body;
            
            if (!requestId) {
                return res.status(400).json({ success: false, message: "Request ID is required" });
            }
            
            // Find the request first to check if it exists
            const existingRequest = await leaveRequestService.getLeaveRequestById(requestId);
            if (!existingRequest) {
                return res.status(404).json({ success: false, message: "Leave request not found" });
            }
            
            // Only allow updates if request is still open
            if (!existingRequest.isOpen) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Cannot update a closed leave request" 
                });
            }
            
            const updatedRequest = await leaveRequestService.updateLeaveRequest(requestId, updateData);
            
            return res.status(200).json({
                success: true,
                message: "Leave request updated successfully",
                data: updatedRequest
            });
        } catch (error) {
            console.error("Update leave request error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to update leave request",
                error: error.message
            });
        }
    }
    
    async updateStatusOpen(req, res) {
        try {
            const { requestId } = req.params;
            const { isOpen, userId } = req.body;
            
            if (isOpen === undefined) {
                return res.status(400).json({ success: false, message: "isOpen status is required" });
            }
            
            if (!userId) {
                return res.status(400).json({ success: false, message: "User ID is required" });
            }
            
            // Find the request first to check if it exists
            const existingRequest = await leaveRequestService.getLeaveRequestById(requestId);
            if (!existingRequest) {
                return res.status(404).json({ success: false, message: "Leave request not found" });
            }
            
            // Update both isOpen status and approverId
            const updatedRequest = await leaveRequestService.updateLeaveRequest(requestId, { 
                isOpen,
                approverId: userId 
            });
            
            return res.status(200).json({
                success: true,
                message: `Leave request ${isOpen ? 'opened' : 'closed'} successfully`,
                data: updatedRequest
            });
        } catch (error) {
            console.error("Update status open error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to update open status",
                error: error.message
            });
        }
    }
    
    async getRequestLeaveByRequestId(req, res) {
        try {
            const { requestId } = req.params;
            
            if (!requestId) {
                return res.status(400).json({ success: false, message: "Request ID is required" });
            }
            
            const request = await leaveRequestService.getLeaveRequestById(requestId);
            
            if (!request) {
                return res.status(404).json({ success: false, message: "Leave request not found" });
            }
            
            // Get user details from repository
            const user = await userRepository.findById(request.requesterId);
            
            // Create requesterName from firstName and lastName
            const requesterName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown User';
            
            // Create a new response object with requesterName instead of requesterId
            const responseData = {
                ...request.toObject(),
                requesterName,
                requesterId: undefined // Remove requesterId from response
            };
            
            return res.status(200).json({
                success: true,
                data: responseData
            });
        } catch (error) {
            console.error("Get leave request error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch leave request",
                error: error.message
            });
        }
    }
    
    async getAllRequestLeave(req, res) {
        try {
            const { 
                requestType, 
                requesterId, 
                approverId, 
                aprovalStatus, 
                isOpen,
                startDate, 
                endDate, 
                page = 1, 
                limit = 10,
                sortBy = 'updatedAt',
                sortOrder = 'desc'
            } = req.query;
            
            // Build filter object based on provided query parameters
            const filter = {};
            
            if (requestType) filter.requestType = requestType;
            if (requesterId) filter.requesterId = requesterId;
            if (approverId) filter.approverId = approverId;
            if (aprovalStatus) filter.aprovalStatus = aprovalStatus;
            if (isOpen !== undefined) filter.isOpen = isOpen === 'true';
            
            // Date range filter
            if (startDate && endDate) {
                filter.$or = [
                    { 
                        requestedStartDate: { 
                            $gte: new Date(startDate), 
                            $lte: new Date(endDate) 
                        } 
                    },
                    { 
                        requestedEndDate: { 
                            $gte: new Date(startDate), 
                            $lte: new Date(endDate) 
                        } 
                    }
                ];
            }
            
            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
            
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort
            };
            
            const requests = await leaveRequestService.getLeaveRequests(filter, options);
            
            return res.status(200).json({
                success: true,
                data: requests.data,
                pagination: requests.pagination
            });
        } catch (error) {
            console.error("Get all leave requests error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch leave requests",
                error: error.message
            });
        }
    }
    
    async approveOrRejectLeaveRequest(req, res) {
        try {
            const { requestId } = req.params;
            const { aprovalStatus, approverComment, userId } = req.body;
            
            if (!requestId || !aprovalStatus || !userId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Request ID, approval status, and user ID are required" 
                });
            }
            
            // Validate approval status
            if (![constant.APPROVED, constant.REJECTED].includes(aprovalStatus)) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Invalid approval status. Must be 'APPROVED' or 'REJECTED'" 
                });
            }
            
            const updateData = {
                aprovalStatus,
                approverComment,
                userId, // Required for attendance record if approved
                updatedAt: new Date(),
                isOpen: false // Close the request after approval/rejection
            };
            
            const updatedRequest = await leaveRequestService.updateLeaveRequest(requestId, updateData);
            
            return res.status(200).json({
                success: true,
                message: `Leave request ${aprovalStatus.toLowerCase()} successfully`,
                data: updatedRequest
            });
        } catch (error) {
            console.error("Approve/reject leave request error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to process approval",
                error: error.message
            });
        }
    }
    
    async getLeaveRequestsByEmployee(req, res) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            
            if (!userId) {
                return res.status(400).json({ success: false, message: "User ID is required" });
            }
            
            const filter = { requesterId: userId };
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { updatedAt: -1 }
            };
            
            const requests = await leaveRequestService.getLeaveRequests(filter, options);
            
            return res.status(200).json({
                success: true,
                data: requests.data,
                pagination: requests.pagination
            });
        } catch (error) {
            console.error("Get employee leave requests error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch employee leave requests",
                error: error.message
            });
        }
    }
    
    async getLeaveRequestsByApprover(req, res) {
        try {
            const { approverId } = req.params;
            const { aprovalStatus, page = 1, limit = 10 } = req.query;
            
            if (!approverId) {
                return res.status(400).json({ success: false, message: "Approver ID is required" });
            }
            
            const filter = { approverId };
            if (aprovalStatus) {
                filter.aprovalStatus = aprovalStatus;
            }
            
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { updatedAt: -1 }
            };
            
            const requests = await leaveRequestService.getLeaveRequests(filter, options);
            
            return res.status(200).json({
                success: true,
                data: requests.data,
                pagination: requests.pagination
            });
        } catch (error) {
            console.error("Get approver leave requests error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch approver leave requests",
                error: error.message
            });
        }
    }
    
    async deleteLeaveRequest(req, res) {
        try {
            const { requestId } = req.params;
            
            if (!requestId) {
                return res.status(400).json({ success: false, message: "Request ID is required" });
            }
            
            // Additional method needed in repository and service
            const result = await leaveRequestService.deleteLeaveRequest(requestId);
            
            if (!result) {
                return res.status(404).json({ success: false, message: "Leave request not found" });
            }
            
            return res.status(200).json({
                success: true,
                message: "Leave request deleted successfully"
            });
        } catch (error) {
            console.error("Delete leave request error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to delete leave request",
                error: error.message
            });
        }
    }

    async getLeaveRequestsList(req, res) {
        try {
            const { page = 1, limit = 10, sortBy = 'requestedAt', sortOrder = 'desc' } = req.query;
            
            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
            
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort
            };
            
            // Get all leave requests
            const requests = await leaveRequestService.getLeaveRequests({}, options);
            
            // Map through the requests and add user information
            const enrichedRequests = await Promise.all(requests.data.map(async (request) => {
                // Get user details from repository
                const user = await userRepository.findById(request.requesterId);
                
                // Create fullName from firstName and lastName
                const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown User';
                
                // Return only the required fields
                return {
                    requestId: request.requestId,
                    fullName,
                    requestType: request.requestType,
                    requestedAt: request.requestedAt
                };
            }));
            
            return res.status(200).json({
                success: true,
                data: enrichedRequests,
                pagination: requests.pagination
            });
        } catch (error) {
            console.error("Get leave requests list error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch leave requests list",
                error: error.message
            });
        }
    }
}

export default new LeaveRequestController();
