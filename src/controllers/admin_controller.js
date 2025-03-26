import AdminService from "../services/admin_service.js";

class AdminController {
    constructor() {
        // Remove the 'new' keyword since AdminService is likely already an instance
        this.service = AdminService;
    }
    
    async getAllDashboardData(req, res) {
        try {
        const data = await this.service.getAllDashboardData();
        return res.status(200).json({
            success: true,
            data
        });
        } catch (error) {
        console.error('Error in getAllDashboardData controller:', error.message);
        return res.status(500).json({
            success: false,
            message: `Failed to get dashboard data: ${error.message}`
        });
        }
    }
}

export default new AdminController();