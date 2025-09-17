const express = require('express');
const router = express.Router();
const axios = require('axios');
const asyncHandler = require('express-async-handler');

// Overpass API URL
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// In-memory store for prices. Key: osmId, Value: { petrolPrice, dieselPrice, lastUpdated }
const priceStore = {};

// Helper function to fetch stations from Overpass
const fetchStationsFromOverpass = async (lat, lng, radius) => {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="fuel"](around:${radius},${lat},${lng});
      way["amenity"="fuel"](around:${radius},${lat},${lng});
      relation["amenity"="fuel"](around:${radius},${lat},${lng});
    );
    out center;
  `;
  const response = await axios.get(OVERPASS_API_URL, { params: { data: query } });
  return response.data.elements;
};

// Helper function to format and merge data
const formatAndMergeStations = (elements) => {
  return elements.map(element => {
    const tags = element.tags || {};
    const osmId = element.id;
    const prices = priceStore[osmId] || {};

    return {
      osmId: osmId,
      name: tags.name || 'Unknown Fuel Station',
      brand: tags.brand || 'Unknown',
      latitude: element.lat || element.center?.lat,
      longitude: element.lon || element.center?.lon,
      address: `${tags['addr:street'] || ''} ${tags['addr:housenumber'] || ''}, ${tags['addr:city'] || ''}`.trim(),
      openingHours: tags.opening_hours || 'N/A',
      petrolPrice: prices.petrolPrice || null,
      dieselPrice: prices.dieselPrice || null,
      lastUpdated: prices.lastUpdated || null,
    };
  });
};

/**
 * @desc    Fetch nearby fuel stations from OpenStreetMap and merge with prices
 * @route   GET /api/stations/nearby
 * @access  Public
 */
router.get('/nearby', asyncHandler(async (req, res) => {
  const { lat, lng, radius = 10000 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  const elements = await fetchStationsFromOverpass(lat, lng, radius);
  const stations = formatAndMergeStations(elements);

  res.json(stations);
}));

/**
 * @desc    Get cheapest stations
 * @route   GET /api/stations/cheapest
 * @access  Public
 */
router.get('/cheapest', asyncHandler(async (req, res) => {
  const { lat, lng, fuelType = 'petrol', limit = 5 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  // For simplicity, we'll search in a larger radius to find some stations with prices
  const elements = await fetchStationsFromOverpass(lat, lng, 50000); // 50km radius
  const allStations = formatAndMergeStations(elements);

  const priceField = fuelType === 'diesel' ? 'dieselPrice' : 'petrolPrice';

  const stationsWithPrices = allStations
    .filter(s => s[priceField] !== null && s[priceField] > 0)
    .sort((a, b) => a[priceField] - b[priceField]);

  res.json(stationsWithPrices.slice(0, limit));
}));

/**
 * @desc    Update station price
 * @route   POST /api/stations/:id/update-price
 * @access  Public (for simplicity, would be Authenticated in a real app)
 */
router.post('/:id/update-price', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fuelType, price } = req.body;

  if (!fuelType || !price) {
    return res.status(400).json({ message: 'Fuel type and price are required' });
  }

  if (!priceStore[id]) {
    priceStore[id] = {};
  }

  const priceField = fuelType.toLowerCase() === 'diesel' ? 'dieselPrice' : 'petrolPrice';
  priceStore[id][priceField] = parseFloat(price);
  priceStore[id].lastUpdated = new Date().toISOString();

  console.log(`Updated price for station ${id}:`, priceStore[id]);

  res.status(200).json({ message: 'Price updated successfully' });
}));

module.exports = router;
