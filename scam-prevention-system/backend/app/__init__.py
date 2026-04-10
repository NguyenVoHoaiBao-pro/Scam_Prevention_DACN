from flask import Flask
from flask_cors import CORS
import importlib.util
from pathlib import Path

app = Flask(__name__)
CORS(app)

routes_file = Path(__file__).with_name("routes.py")
spec = importlib.util.spec_from_file_location("app.main_routes", routes_file)
routes_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(routes_module)