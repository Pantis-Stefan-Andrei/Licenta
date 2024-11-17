from flask import Flask, request
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

@app.route('/get', methods=['POST'])
def capture_data():
    data = request.get_json()
    print("Received data:", json.dumps(data, indent=4))
    # You can also save the data to a file if needed
    with open("captured_data.json", "a") as file:
        json.dump(data, file)
        file.write("\n")
    return "Data received successfully", 200


