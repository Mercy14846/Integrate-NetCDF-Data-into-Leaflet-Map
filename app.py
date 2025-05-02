from flask import Flask, render_template, send_file, request, jsonify
from netCDF4 import Dataset
import numpy as np
from io import BytesIO
from PIL import Image
import matplotlib.pyplot as plt
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuration
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')  # Relative to app.py

data = ds[variable][time_idx, :, :]  # Expects [time, lat, lon] dimensions

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/weather-layer')
def get_weather_layer():
    try:
        variable = request.args.get('var')
        time_idx = int(request.args.get('time', 0))
        
        nc_file = f"{variable}.nc"
        nc_path = os.path.join(DATA_DIR, nc_file)
        
        if not os.path.exists(nc_path):
            return jsonify({"error": f"File {nc_file} not found in {DATA_DIR}"}), 404

        with Dataset(nc_path) as ds:
            print(f"Variable dimensions: {ds[variable].dimensions}")
            print(f"Time dimension length: {len(ds['time'])}")
            print(f"Lat range: {ds['lat'][:].min()} to {ds['lat'][:].max()}")
            print(f"Lon range: {ds['lon'][:].min()} to {ds['lon'][:].max()}")

        with Dataset(nc_path) as ds:
            data = ds[variable][time_idx, :, :]
            print(f"Data min: {np.nanmin(data)}, max: {np.nanmax(data)}")
              
            # Normalize and colorize
            norm_data = ((data - np.nanmin(data)) / 
                       (np.nanmax(data) - np.nanmin(data)) * 255).astype(np.uint8)
            cmap = plt.cm.get_cmap('viridis')
            colored_data = (cmap(norm_data / 255.0)[:, :, :3] * 255).astype(np.uint8)

            # Convert to PNG
            img = Image.fromarray(colored_data)
            img_io = BytesIO()
            img.save(img_io, 'PNG')
            img_io.seek(0)

        return send_file(img_io, mimetype='image/png')

    except Exception as e:
        return jsonify({
            "error": str(e),
            "path": nc_path,
            "available_files": os.listdir(DATA_DIR)
        }), 500

@app.route('/time-steps')
def get_time_steps():
    try:
        variable = request.args.get('var')
        nc_path = os.path.join(DATA_DIR, f'{variable}.nc')
        
        if not os.path.exists(nc_path):
            return jsonify({"error": "File not found"}), 404

        with Dataset(nc_path) as ds:
            if 'time' not in ds.variables:
                return jsonify({"error": "No time dimension found"}), 400
                
            times = ds['time'][:].tolist()
        return jsonify({"times": times})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)