import leave_request_repository from "../database/repository/leave_request_repository.js";
import attendance_service from "./attendance_service.js";
import constant from "../utils/constant.js";

class LeaveRequestService {
    constructor() {
        this.leaveRequestRepository = leave_request_repository;
        this.attendanceService = attendance_service;
    }
    async createLeaveRequest(requestData) {
        try {
            const newRequest = await this.leaveRequestRepository.createRequest(requestData);
            return newRequest;
        } catch (error) {
            console.error('Error creating leave request:', error.message);
            throw error;
        }
    }

    async getLeaveRequestById(requestId) {
        try {
            const request = await this.leaveRequestRepository.getRequestByRequestId(requestId);
            return request;
        } catch (error) {
            console.error('Error fetching leave request:', error.message);
            throw error;
        }
    }

    async updateLeaveRequest(requestId, updateData) {
        try {
            // Check if request exists before doing anything
            const requestFind = await this.leaveRequestRepository.findByRequestId(requestId);
            if (!requestFind) {
                throw new Error('Leave request not found');
            }
            
            if (updateData.approvalStatus === constant.APPROVED) {
                // Map request type to attendance status
                let attendanceStatus = 'A'; // Default status
                
                if (requestFind.requestType === "leave") {
                    attendanceStatus = 'L';
                } else if (requestFind.requestType === "sick") {
                    attendanceStatus = 'S';
                }
                
                // Get the start and end dates from the request
                const startDate = new Date(requestFind.requestedStartDate);
                const endDate = new Date(requestFind.requestedEndDate);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);
                
                // Calculate the number of days in the range
                const dayDifference = Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000)) + 1;
                
                // Create attendance records for each day in the range
                for (let i = 0; i < dayDifference; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + i);
                    
                    const newAttendanceData = {
                        userId: requestFind.requesterId, // Use requesterId from the leave request
                        date: currentDate,
                        checkIn: new Date(0), // Unix epoch
                        checkOut: new Date(0), // Unix epoch
                        attendanceStatus: attendanceStatus, // Set status based on request type
                        stationId: "-",
                    };
                    
                    await this.attendanceService.recordAttendance(newAttendanceData);
                }
            }
            
            // Update the leave request
            const updatedRequest = await this.leaveRequestRepository.updateRequest(requestId, updateData);
            return updatedRequest;
        } catch (error) {
            console.error('Error updating leave request:', error.message);
            throw error;
        }
    }

    async deleteLeaveRequest(requestId) {
        try {
            // Check if request exists before doing anything
            const requestToDelete = await this.leaveRequestRepository.findByRequestId(requestId);
            if (!requestToDelete) {
                return null;
            }
            
            const result = await this.leaveRequestRepository.deleteRequest(requestId);
            return result;
        } catch (error) {
            console.error('Error deleting leave request:', error.message);
            throw error;
        }
    }

    async getLeaveRequestCount(filter = {}) {
        try {
            const count = await this.leaveRequestRepository.countAll(filter);
            return count;
        } catch (error) {
            console.error('Error counting leave requests:', error.message);
            throw error;
        }
    }
    async getLeaveRequests(filter = {}, options = {}) {
        try {
            const requests = await this.leaveRequestRepository.findAll(filter, options);
            return requests;
        } catch (error) {
            console.error('Error fetching leave requests:', error.message);
            throw error;
        }
    }
}

export default new LeaveRequestService();