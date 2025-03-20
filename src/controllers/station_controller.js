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
}

export default StationController;
