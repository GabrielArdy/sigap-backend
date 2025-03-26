import reportRepository from "../database/repository/report_repository.js";

class ReportService {
    async getReportInfo() {
        try {
            const reports = await reportRepository.GetReportInfo();
            // Since we expect only one report document to exist
            return reports.length > 0 ? reports[0] : null;
        } catch (error) {
            console.error('Error in getReportInfo service:', error.message);
            throw error;
        }
    }

    async createOrUpdateReportInfo(reportData) {
        try {
            // Check if report exists
            const existingReports = await reportRepository.GetReportInfo();
            
            // If report exists, update with new data
            if (existingReports.length > 0) {
                const existingReport = existingReports[0];
                
                // Update the existing document with new values
                Object.keys(reportData).forEach(key => {
                    existingReport[key] = reportData[key];
                });
                
                existingReport.UpdatedAt = new Date();
                return await existingReport.save();
            } else {
                // Create new report if none exists
                return await reportRepository.CreateandUpdateReportInfo(reportData);
            }
        } catch (error) {
            console.error('Error in createOrUpdateReportInfo service:', error.message);
            throw error;
        }
    }
}

export default new ReportService();

