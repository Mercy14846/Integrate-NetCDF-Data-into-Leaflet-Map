# Integrate-NetCDF-Data-into-Leaflet-Map
# Climate Data Visualization Platform

A web-based mapping interface for visualizing climate data from NetCDF files combined with OpenStreetMap base layers.

## Features

- Multiple base layers (OSM Streets, Google Satellite)
- NetCDF data overlay for weather variables
- Time slider for temporal data navigation
- Interactive weather station markers
- Country boundaries overlay
- Responsive coordinate display

## Requirements

- Python 3.7+
- Node.js (for optional development)
- NetCDF data files (see Configuration)

## Installation

1. Clone repository:
```bash
git clone https://github.com/yourusername/climate-map.git
cd climate-map
```
2. Install Python dependencies:
```bash
pip install flask netCDF4 numpy pillow matplotlib flask-cors
```
3. Place NetCDF files in ~/climate_data (default) or your preferred directory:
```bash
mkdir -p ~/climate_data
# Copy your .nc files to this directory
```
4. Configuration
Edit `app.py` if needed:

```python
DATA_DIR = '/path/to/your/netcdf/files'  # Line 14
```
Supported variables (add corresponding .nc files):
- temperature.nc
- pressure.nc
- wind_speed.nc
- precipitation.nc

# Running the Application
Start Flask backend:
```bash
python app.py
```
Open the frontend in the browser:
```
http://localhost:5000
```
# Usage
1. Layer Controls (top-right):
- Toggle between map base layers
- Enable/disable weather overlays and boundaries

2. Time Control (bottom-left):
- Drag slider to navigate temporal data
- Displays current time index

3. Interactive Features:
- Click countries to zoom
- Hover for coordinates
- Click markers for station info

# Troubleshooting
- Ensure NetCDF files are named correctly (e.g., temperature.nc)
- Check Flask server is running on port 5000
- Verify file permissions in your data directory
- Use browser developer tools for error inspection

# License
MIT License - see LICENSE file

**Note:** Add your NetCDF files to the specified directory before running. Supported variables will automatically appear in layer controls.
