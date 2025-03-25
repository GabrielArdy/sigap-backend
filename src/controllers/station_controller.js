import StationService from '../services/station_service.js';

class StationController {
    constructor() {
        this.stationService = new StationService();
    }

    async createStation(req, res) {
        try {
            const stationData = req.body;
            const result = await this.stationService.CreateNewStation(stationData);
            return res.status(201).json({
                status: 'success',
                message: 'Station created successfully',
                data: result
            });
        } catch (error) {
            console.error('Error creating station:', error.message);
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getAllStations(req, res) {
        try {
            const stations = await this.stationService.GetAllStation();
            return res.status(200).json({
                status: 'success',
                message: 'Stations retrieved successfully',
                data: stations
            });
        } catch (error) {
            console.error('Error retrieving stations:', error.message);
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getStationById(req, res) {
        try {
            const { stationId } = req.params;
            const station = await this.stationService.GetStationByStationId(stationId);
            return res.status(200).json({
                status: 'success',
                message: 'Station retrieved successfully',
                data: station
            });
        } catch (error) {
            console.error('Error retrieving station:', error.message);
            if (error.message.includes('not found')) {
                return res.status(404).json({
                    status: 'error',
                    message: error.message
                });
            }
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async deleteStation(req, res) {
        try {
            const { stationId } = req.body;
            await this.stationService.DeleteStationByStationId(stationId);
            return res.status(200).json({
                status: 'success',
                message: `Station with ID ${stationId} deleted successfully`
            });
        } catch (error) {
            console.error('Error deleting station:', error.message);
            if (error.message.includes('not found')) {
                return res.status(404).json({
                    status: 'error',
                    message: error.message
                });
            }
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async updateStationStatus(req, res) {
        try {
            const { stationId, stationStatus } = req.body;
            
            if (!stationId || !stationStatus) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Station ID and status are required'
                });
            }

            // Validate status value
            if (!['active', 'offline'].includes(stationStatus)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Station status must be either "active" or "offline"'
                });
            }

            const updatedStation = await this.stationService.UpdateStatusStationByStationId(stationId, stationStatus);
            
            return res.status(200).json({
                status: 'success',
                message: `Station status updated to ${stationStatus} successfully`,
                data: updatedStation
            });
        } catch (error) {
            console.error('Error updating station status:', error.message);
            
            if (error.message.includes('not found')) {
                return res.status(404).json({
                    status: 'error',
                    message: error.message
                });
            } else if (error.message.includes('already active')) {
                return res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            }
            
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async checkStationStatus(req, res) {
        try {
            const { stationId } = req.params;
            
            if (!stationId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Station ID is required'
                });
            }

            const stationStatus = await this.stationService.CheckStationStatus(stationId);
            
            return res.status(200).json({
                status: 'success',
                message: 'Station status retrieved successfully',
                data: { 
                    stationId,
                    stationStatus
                }
            });
        } catch (error) {
            console.error('Error checking station status:', error.message);
            
            if (error.message.includes('not found')) {
                return res.status(404).json({
                    status: 'error',
                    message: error.message
                });
            }
            
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
}

export default StationController;
