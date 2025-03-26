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

    async getAttendanceMonthlyReport(month, year) {
        try {
            // Validate month and year parameters
            const currentDate = new Date();
            const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1; // Default to current month
            const targetYear = year ? parseInt(year) : currentDate.getFullYear(); // Default to current year

            // Input validation - month should be 1-12
            if (targetMonth < 1 || targetMonth > 12) {
                throw new Error('Invalid month. Month must be between 1 and 12.');
            }

            // Get all users
            const users = await this.userRepository.findAll();
            
            // Create report data for each user
            const reportData = await Promise.all(users.map(async (user) => {
                // Get all attendance records for this user
                let attendanceRecords = [];
                try {
                    attendanceRecords = await this.attendanceRepository.findByUserId(user.userId);
                } catch (error) {
                    console.error(`Error fetching attendance for user ${user.userId}:`, error);
                    // Continue with empty records rather than failing the whole report
                }
                
                // Filter records for the specified month and year
                const filteredRecords = attendanceRecords.filter(record => {
                    if (!record.date) return false;
                    
                    const recordDate = new Date(record.date);
                    return recordDate.getMonth() + 1 === targetMonth && 
                           recordDate.getFullYear() === targetYear;
                });
                
                // Format attendance data for the user
                const attendanceData = filteredRecords.map(record => {
                    // Get the date portion only for the date field
                    const recordDate = new Date(record.date);
                    
                    // Map status codes to more descriptive names
                    let statusDescription;
                    switch(record.attendanceStatus) {
                        case 'P':
                            statusDescription = 'Present';
                            break;
                        case 'A':
                            statusDescription = 'Absent';
                            break;
                        case 'S':
                            statusDescription = 'Sick';
                            break;
                        case 'L':
                            statusDescription = 'Leave';
                            break;
                        default:
                            // Fallback logic if attendanceStatus is not set
                            if (record.checkIn && record.checkIn.getTime() !== new Date(0).getTime()) {
                                statusDescription = 'Present';
                                
                                // If no checkout or default checkout, mark as "Not checked out"
                                if (!record.checkOut || record.checkOut.getTime() === new Date(0).getTime()) {
                                    statusDescription = 'Not checked out';
                                }
                            } else {
                                statusDescription = 'Absent';
                            }
                    }
                    
                    return {
                        date: recordDate,
                        checkIn: record.checkIn,
                        checkOut: record.checkOut,
                        status: statusDescription
                    };
                });
                
                // Return formatted data for this user
                return {
                    fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
                    nip: user.nip || user.employeeId || 'N/A',
                    attendanceData: attendanceData
                };
            }));
            
            return {
                data: reportData,
                meta: {
                    month: targetMonth,
                    year: targetYear,
                }
            };
        } catch (error) {
            console.error('Error generating monthly report:', error);
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