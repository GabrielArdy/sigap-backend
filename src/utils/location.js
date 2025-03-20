/**
 * Calculate the distance between two geographical points in meters
 * 
 * @param {number} lat1 - Latitude of the first point in decimal degrees
 * @param {number} lon1 - Longitude of the first point in decimal degrees
 * @param {number} lat2 - Latitude of the second point in decimal degrees
 * @param {number} lon2 - Longitude of the second point in decimal degrees
 * @returns {number} - Distance in meters
 */
const calculateDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  // Earth's radius in meters
  const earthRadius = 6371000;
  
  // Convert degrees to radians
  const toRadians = (degrees) => degrees * Math.PI / 180;
  
  // Calculate differences in coordinates
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  // Haversine formula
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;
  
  return distance;
};

export default calculateDistanceInMeters;
