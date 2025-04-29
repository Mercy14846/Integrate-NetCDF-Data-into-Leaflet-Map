from flask import Flask, send_file, request, jsonify
from netCDF4 import Dataset
import numpy as np
from io import BytesIO
from PIL import Image
import matplotlib.pyplot as plt
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Configuration
DATA_DIR = os.path.join(os.path.expanduser('data'), 'climate_data')  # Adjust to your NC files location

@app.route('/weather-layer')
def get_weather_layer():
    try:
        # Get parameters from request
        variable = request.args.get('var')
        time_idx = int(request.args.get('time', 0))
        
        # Load NetCDF file
        nc_path = os.path.join(DATA_DIR, f'{variable}.nc')
        if not os.path.exists(nc_path):
            return jsonify({"error": "File not found"}), 404

        with Dataset(nc_path) as ds:
            # Extract data (adjust dimensions based on your NC file structure)
            data = ds[variable][time_idx, :, :]
            
            # Normalize and apply colormap
            norm_data = ((data - np.nanmin(data)) / (np.nanmax(data) - np.nanmin(data)) * 255).astype(np.uint8)
            cmap = plt.cm.get_cmap('viridis')
            colored_data = (cmap(norm_data / 255.0)[:, :, :3] * 255).astype(np.uint8)

            # Create image
            img = Image.fromarray(colored_data)
            img_io = BytesIO()
            img.save(img_io, 'PNG')
            img_io.seek(0)

        return send_file(img_io, mimetype='image/png')

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/time-steps')
def get_time_steps():
    variable = request.args.get('var')
    nc_path = os.path.join(DATA_DIR, f'{variable}.nc')
    
    try:
        with Dataset(nc_path) as ds:
            times = ds['time'][:].tolist()
        return jsonify({"times": times})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)