import ReportInfo from "../models/report";

class ReportRepository {
    async CreateandUpdateReportInfo(reportData) {
        try {
            const report = new ReportInfo(reportData);
            return await report.save();
        } catch (error) {
            console.error('Error creating report:', error.message);
            throw error;
        }
    }

    async GetReportInfo() {
        try {
            return await ReportInfo.find();
        } catch (error) {
            console.error('Error retrieving report:', error.message);
            throw error;
        }
    }
}

export default new ReportRepository();