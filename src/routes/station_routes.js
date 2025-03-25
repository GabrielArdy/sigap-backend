import express from 'express';
import StationController from '../controllers/station_controller.js';

const router = express.Router();
const stationController = new StationController();

// Route to create a new station
router.post('/', (req, res) => stationController.createStation(req, res));

// Route to get all stations
router.get('/', (req, res) => stationController.getAllStations(req, res));

// Route to get station by ID
router.get('/:stationId', (req, res) => stationController.getStationById(req, res));

// Route to delete station by ID
router.delete('/', (req, res) => stationController.deleteStation(req, res));

router.put('/:stationId', (req, res) => stationController.updateStationStatus(req, res));

router.get('/status/:stationId', (req, res) => stationController.checkStationStatus(req, res));

export default router;
