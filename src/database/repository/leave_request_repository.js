import LeaveRequest from "../models/leave_request.js";

class LeaveRequestRepository {
    async createRequest(requestData) {
        try {
            const newRequest = new LeaveRequest(requestData);
            return await newRequest.save();
        } catch (error) {
            throw new Error(`Error creating leave request: ${error.message}`);
        }
    }

    async getRequestByRequestId(requestId) {
        try {
            return await LeaveRequest.findOne({ requestId });
        } catch (error) {
            throw new Error(`Error fetching leave request: ${error.message}`);
        }
    }

    async updateRequest(requestId, updateData) {
        try {
            return await LeaveRequest.findOneAndUpdate(
                { requestId },
                { ...updateData, updatedAt: Date.now() },
                { new: true } // Return the updated document
            );
        } catch (error) {
            throw new Error(`Error updating leave request: ${error.message}`);
        }
    }

    async countAll(filter = {}) {
        try {
            return await LeaveRequest.countDocuments(filter);
        } catch (error) {
            throw new Error(`Error counting leave requests: ${error.message}`);
        }
    }

    async findByRequestId(requestId) {
        try {
            return await LeaveRequest.findOne({ requestId });
        } catch (error) {
            throw new Error(`Error finding leave request by ID: ${error.message}`);
        }
    }

    async findAll(filter = {}, options = {}) {
        try {
            const { limit = 10, page = 1, sort = { updatedAt: -1 } } = options;
            const skip = (page - 1) * limit;
            
            const requests = await LeaveRequest.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit);
                
            const total = await this.countAll(filter);
            
            return {
                data: requests,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error finding leave requests: ${error.message}`);
        }
    }

    async deleteRequest(requestId) {
        try {
            return await LeaveRequest.findOneAndDelete({ requestId });
        } catch (error) {
            throw new Error(`Error deleting leave request: ${error.message}`);
        }
    }
}

export default new LeaveRequestRepository();
