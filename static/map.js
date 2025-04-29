// Map initialization
const map = L.map('map').setView([0, 20], 3);

// Base layers
const baseLayers = {
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map),
    
    "Google Satellite": L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: '© Google'
    })
};

// Weather layer configuration
const weatherLayers = {
    "Temperature": { var: 'temperature', bounds: [[-35, -20], [37, 50]] },
    "Pressure": { var: 'pressure', bounds: [[-35, -20], [37, 50]] }
};

// Layer groups
const overlayLayers = {
    "Weather Stations": L.layerGroup(),
    "Country Boundaries": L.layerGroup()
};

// Initialize layer control
L.control.layers(baseLayers, overlayLayers).addTo(map);

// Weather layer management
let activeWeatherLayer = null;

async function loadWeatherLayer(layerName) {
    if (activeWeatherLayer) {
        map.removeLayer(activeWeatherLayer);
    }

    const layerConfig = weatherLayers[layerName];
    const timeResponse = await fetch(`http://localhost:5000/time-steps?var=${layerConfig.var}`);
    const timeData = await timeResponse.json();

    createTimeControl(timeData.times.length);
    
    activeWeatherLayer = L.imageOverlay(
        `http://localhost:5000/weather-layer?var=${layerConfig.var}&time=0`,
        layerConfig.bounds
    ).addTo(map);
}

// Time control
function createTimeControl(maxTime) {
    let timeControl = document.getElementById('time-control');
    if (!timeControl) {
        timeControl = L.control({ position: 'bottomleft' });
        timeControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'time-control');
            div.innerHTML = `
                <input type="range" min="0" max="${maxTime}" value="0" class="time-slider">
                <span class="time-display">Time Index: 0</span>
            `;
            return div;
        };
        timeControl.addTo(map);
    }

    document.querySelector('.time-slider').addEventListener('input', (e) => {
        const timeIdx = e.target.value;
        document.querySelector('.time-display').textContent = `Time Index: ${timeIdx}`;
        activeWeatherLayer.setUrl(
            `http://localhost:5000/weather-layer?var=${activeWeatherLayer.options.var}&time=${timeIdx}`
        );
    });
}

// Layer change handler
map.on('baselayerchange', (e) => {
    if (weatherLayers[e.name]) {
        loadWeatherLayer(e.name);
    }
});

// Initialize other layers (stations, boundaries, etc.)
function initializeBaseFeatures() {
    // Add your existing markers, boundaries, etc. here
    // Keep your existing code for stations and boundaries
}

// Initialize map
initializeBaseFeatures();