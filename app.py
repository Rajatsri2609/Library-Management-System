from models import *
from flask import Flask,render_template, request , redirect , url_for, flash,session
from flask_sqlalchemy import SQLAlchemy
from models import *
from datetime import datetime
from flask_cors import CORS 
from flask_restful import *

app = Flask(__name__)
app.config['SECRET_KEY'] = 'abcd'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///project_db.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db.init_app(app)
#api.init_app(app)
app.app_context().push()
db.create_all()


@app.route('/')
def index():
    return render_template('Login.html')

@app.route('/register')  
def register():
    return render_template('register.html')

if __name__ == "__main__":
    app.run(debug=True)