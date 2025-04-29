// Initialize map
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

// Weather layer manager
const weatherLayerManager = {
    currentLayer: null,
    currentVar: null,
    
    layers: {
        "Temperature": { var: 'temperature', bounds: [[-35, -20], [37, 50]] },
        "Pressure": { var: 'pressure', bounds: [[-35, -20], [37, 50]] }
    },

    async loadLayer(name) {
        if (this.currentLayer) {
            map.removeLayer(this.currentLayer);
        }

        const config = this.layers[name];
        const response = await fetch(`/time-steps?var=${config.var}`);
        
        if (!response.ok) {
            console.error('Failed to load time steps:', await response.text());
            return;
        }

        const timeData = await response.json();
        this.createTimeControl(timeData.times.length);
        
        this.currentLayer = L.imageOverlay(
            `/weather-layer?var=${config.var}&time=0`,
            config.bounds,
            { var: config.var }
        ).addTo(map);
        
        this.currentVar = config.var;
    },

    createTimeControl(maxTime) {
        let control = document.querySelector('.leaflet-control-time');
        
        if (!control) {
            control = L.control({ position: 'bottomleft' });
            control.onAdd = () => {
                const div = L.DomUtil.create('div', 'leaflet-control-time');
                div.innerHTML = `
                    <input type="range" min="0" max="${maxTime}" value="0" 
                           class="time-slider">
                    <span class="time-display">Time Index: 0</span>
                `;
                return div;
            };
            control.addTo(map);
        }

        document.querySelector('.time-slider').addEventListener('input', (e) => {
            const timeIdx = e.target.value;
            document.querySelector('.time-display').textContent = `Time Index: ${timeIdx}`;
            this.currentLayer.setUrl(
                `/weather-layer?var=${this.currentVar}&time=${timeIdx}`
            );
        });
    }
};

// Layer control
L.control.layers(baseLayers, {}, {
    collapsed: false
}).addTo(map);

// Handle layer changes
map.on('baselayerchange', (e) => {
    if (weatherLayerManager.layers[e.name]) {
        weatherLayerManager.loadLayer(e.name);
    }
});

// Initialize coordinates display
map.on('mousemove', (e) => {
    document.querySelector('.coordinate-display').textContent = 
        `Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`;
});

// Add coordinates display control
L.control({position: 'bottomright'}).onAdd = () => {
    const div = L.DomUtil.create('div', 'coordinate-display');
    div.style.backgroundColor = 'white';
    div.style.padding = '5px';
    return div;
}.addTo(map);