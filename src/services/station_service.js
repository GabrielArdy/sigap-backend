import StationRepository from '../database/repository/station_repository.js';

class StationService {
    constructor() {
        this.stationRepository = new StationRepository();
    }

    async CreateNewStation(stationData) {
        try {
            const { stationId, stationName, stationLocation, radiusThreshold, stationStatus, lastActive } = stationData;
            
            // Check if station with same ID already exists
            const existingStation = await this.stationRepository.findStationByStationId(stationId);
            if (existingStation) {
                throw new Error(`Station with ID ${stationId} already exists`);
            }
            
            // Create the new station
            const result = await this.stationRepository.createStation({
                stationId,
                stationName,
                stationLocation,
                radiusThreshold,
                stationStatus,
                lastActive,

            });
            
            return result;
        } catch (error) {
            console.error('Error in CreateNewStation service:', error.message);
            throw error;
        }
    }

    async GetAllStation() {
        try {
            const stations = await this.stationRepository.findAllStations();
            return stations;
        } catch (error) {
            console.error('Error in GetAllStation service:', error.message);
            throw error;
        }
    }

    async GetStationByStationId(stationId) {
        try {
            const station = await this.stationRepository.findStationByStationId(stationId);
            if (!station) {
                throw new Error(`Station with ID ${stationId} not found`);
            }
            return station;
        } catch (error) {
            console.error('Error in GetStationByStationId service:', error.message);
            throw error;
        }
    }

    async DeleteStationByStationId(stationId) {
        try {
            // Check if station exists
            const station = await this.stationRepository.deleteStation(stationId);
            if (!station) {
                throw new Error(`Station with ID ${stationId} not found`);
            }
            
            // Delete the station
            const result = await this.stationRepository.deleteStationByStationId(stationId);
            return result;
        } catch (error) {
            console.error('Error in DeleteStationByStationId service:', error.message);
            throw error;
        }
    }
}

export default StationService;
