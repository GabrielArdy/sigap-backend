import ReportService from "../services/report_service.js";

class ReportController {

    constructor() {
        // Bind the methods to this instance to ensure 'this' context is preserved
        this.getReportInfo = this.getReportInfo.bind(this);
        this.createOrUpdateReportInfo = this.createOrUpdateReportInfo.bind(this);
    }
    async getReportInfo(req, res) {
        try {
            const report = await ReportService.getReportInfo();
            return res.status(200).json(report);
        } catch (error) {
            console.error('Error in getReportInfo controller:', error.message);
            return res.status(500).json({ message: error.message });
        }
    }

    async createOrUpdateReportInfo(req, res) {
        try {
            const reportData = req.body;
            const report = await ReportService.createOrUpdateReportInfo(reportData);
            return res.status(200).json(report);
        } catch (error) {
            console.error('Error in createOrUpdateReportInfo controller:', error.message);
            return res.status(500).json({ message: error.message });
        }
    }
}

export default new ReportController();