import AdminService from "../services/admin_service.js";

class AdminController {
    constructor() {
        this.service = AdminService;
        // Bind the methods to this instance to ensure 'this' context is preserved
        this.getAllDashboardData = this.getAllDashboardData.bind(this);
        this.getMonthlyReport = this.getMonthlyReport.bind(this);
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

    async getMonthlyReport(req, res) {
        const { month, year } = req.query;
        try {
            const data = await this.service.getAttendanceMonthlyReport(month, year);
            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            console.error('Error in getMonthlyReport controller:', error.message);
            return res.status(500).json({
                success: false,
                message: `Failed to get monthly report: ${error.message}`
            });
        }
    }
}

export default new AdminController();