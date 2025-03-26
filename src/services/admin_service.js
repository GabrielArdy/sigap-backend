import user_repository from "../database/repository/user_repository.js";
import attendance_repository from "../database/repository/attendance_repository.js";

class AdminService {
    constructor() {
        this.userRepository = user_repository;
        this.attendanceRepository = attendance_repository;
    }
    async getAllDashboardData() {
        try {
            const totalUsers = await this.userRepository.countUsers();
            const totalTodayCheckIn = await this.attendanceRepository.CountTodayCheckIn();
            const totalTodayCheckOut = await this.attendanceRepository.countTodayCheckOut();
            const checkInPercentage = Math.round(totalTodayCheckIn / totalUsers * 100);
            const checkOutPercentage = Math.round(totalTodayCheckOut / totalUsers * 100);
            const recentActivities = await this._getRecentActivity();
            const attTrend = await this._getWeekAttendanceTrend();
            
            return {
                totalUsers,
                checkIn: {
                    count: totalTodayCheckIn,
                    percentage: checkInPercentage
                },
                checkOut: {
                    count: totalTodayCheckOut,
                    percentage: checkOutPercentage
                },
                recentActivities,
                attendanceTrend: attTrend
            };
        } catch (error) {
            throw error;
        }
    }

    async _getRecentActivity() {
        try {
            // Get the timestamp for 3 hours ago
            const threeHoursAgo = new Date();
            threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
            
            // Get all attendance records from the last 3 hours
            const recentAttendances = await attendance_repository.findAll({
                updatedAt: { $gte: threeHoursAgo }
            });
            
            // Map to create the required format and get user details
            const activitiesPromises = recentAttendances.map(async (attendance) => {
                const user = await user_repository.findById(attendance.userId);
                
                // Check if checkOut date is the default date (1970-01-01)
                const isCheckIn = attendance.checkOut && 
                                 (attendance.checkOut.getTime() === new Date(0).getTime() || 
                                  attendance.checkOut.toISOString() === '1970-01-01T00:00:00.000Z');
                
                return {
                    fullName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
                    type: isCheckIn ? 'CheckIn' : 'CheckOut',
                    timestamp: attendance.updatedAt
                };
            });
            
            const activities = await Promise.all(activitiesPromises);
            
            // Sort by timestamp (newest first) and limit to 5 results
            return activities
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 5);
        } catch (error) {
            console.error('Error getting recent activities:', error);
            return [];
        }
    }

    async _getWeekAttendanceTrend() {
        try {
            const today = new Date();
            const dayTrend = [];
            
            // Get data for today and 5 previous days (total 6 days)
            for (let i = 0; i < 6; i++) {
                // Calculate date (today - i days)
                const currentDate = new Date(today);
                currentDate.setDate(today.getDate() - i);
                // Reset time to start of day
                currentDate.setHours(0, 0, 0, 0);
                
                // Use the existing repository functions to count check-ins and check-outs
                const checkInCount = await this.attendanceRepository.CountTodayCheckIn(currentDate);
                const checkOutCount = await this.attendanceRepository.countTodayCheckOut(currentDate);
                
                // Add the data to our results array
                dayTrend.push({
                    date: currentDate,
                    checkIn: checkInCount,
                    checkOut: checkOutCount
                });
            }
            
            // Reverse the array to have oldest date first (chronological order)
            return dayTrend.reverse();
        } catch (error) {
            console.error('Error getting week attendance trend:', error);
            return [];
        }
    }
}

export default new AdminService();