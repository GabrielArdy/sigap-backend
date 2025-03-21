import Station from '../models/station.js';

class StationRepository {
    async createStation({ stationId, stationName, stationLocation, radiusThreshold, stationStatus, lastActive }) {
        try {
            const station = new Station({
                stationId,
                stationName,
                stationLocation,
                radiusThreshold,
                stationStatus,
                lastActive,
            });
            return await station.save();
        } catch (error) {
            console.error('Error creating station:', error.message);
            throw error;
        }
    }

    async findAllStations() {
        try {
            return await Station.find({});
        } catch (error) {
            console.error('Error finding all stations:', error.message);
            throw error;
        }
    }

    async findStationById(id) {
        try {
            return await Station.findById(id);
        } catch (error) {
            console.error('Error finding station by ID:', error.message);
            throw error;
        }
    }

    async findStationByStationId(stationId) {
        try {
            return await Station.findOne({ stationId });
        } catch (error) {
            console.error('Error finding station by station ID:', error.message);
            throw error;
        }
    }

    async findStationByName(stationName) {
        try {
            return await Station.find({ 
                stationName: { $regex: stationName, $options: 'i' } 
            });
        } catch (error) {
            console.error('Error finding station by name:', error.message);
            throw error;
        }
    }

    async updateStation(id, stationData) {
        try {
            const updatedData = { ...stationData, updatedAt: Date.now() };
            return await Station.findByIdAndUpdate(
                id,
                updatedData,
                { new: true, runValidators: true }
            );
        } catch (error) {
            console.error('Error updating station:', error.message);
            throw error;
        }
    }

    async deleteStation(id) {
        try {
            return await Station.findByIdAndDelete(id);
        } catch (error) {
            console.error('Error deleting station:', error.message);
            throw error;
        }
    }

    async findStationsNearLocation(latitude, longitude, maxDistance = 10000) {
        try {
            // Find stations within a certain radius (in meters)
            // This requires a geospatial index if dealing with large datasets
            return await Station.find({
                'stationLocation': {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [longitude, latitude]
                        },
                        $maxDistance: maxDistance
                    }
                }
            });
        } catch (error) {
            console.error('Error finding stations near location:', error.message);
            throw error;
        }
    }
}

export default StationRepository;
