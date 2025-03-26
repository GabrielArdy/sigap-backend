 import { AdminService } from "../services/admin_service";

class AdminController {
    constructor() {
        this.service = new AdminService();
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