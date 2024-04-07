from models import *
from flask import Flask,render_template, request,jsonify,flash, redirect, url_for, session
import jwt
from jwt import encode
# from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS 
from flask_restful import *
from flask import current_app as app, jsonify, request, render_template
# from flask_security import auth_required, roles_required
# from werkzeug.security import check_password_hash
# from flask_restful import marshal, fields
# import flask_excel as excel
# from celery.result import AsyncResult
# from .tasks import create_resource_csv
# from .sec import datastore


app = Flask(__name__)
app.config['SECRET_KEY'] = 'abcd'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///project_db.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'

CORS(app)
db.init_app(app)
#api.init_app(app)
app.app_context().push()
db.create_all()

librarian = Librarian.query.filter_by(username='librarian').first()

if not librarian:
    librarian = Librarian(username='librarian', password='librarian', name='Librarian', is_Librarian=True)
    db.session.add(librarian)
    db.session.commit()

@app.get('/')
def home():
        return render_template("index.html")

@app.post('/user-login')
def user_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        flash("Username or password not provided", "error")
        return jsonify({"message": "Username or password not provided"}), 400

    user = User.query.filter_by(username=username).first()
    if user:
        if user.check_password(password):
            # Authentication successful
            token = jwt.encode({'username': user.username},app.config['SECRET_KEY'], algorithm='HS256')
            # Include additional user information in the token if needed
            flash("Login Successful","success")
            return jsonify({"message": "Login successful", "token": token,"username": user.username,"is_Librarian":user.is_Librarian}), 200
        else:
            return jsonify({"message": "Incorrect password"}), 401

    librarian = Librarian.query.filter_by(username=username).first()
    if librarian:
        if check_password_hash(librarian.password_hash, password):
            # Log in as librarian
            token = jwt.encode({'username': librarian.username, 'is_librarian': True}, app.config['SECRET_KEY'], algorithm='HS256')
            return jsonify({"message": "Login successful as librarian", "token": token,"is_Librarian":librarian.is_Librarian,"username": librarian.username}), 200
        else:
            return jsonify({"message": "Incorrect password"}), 401

    flash("Username cannot be empty","error")
    return jsonify({"message": "User not found"}), 404
    

@app.post('/register')
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')

    if not username or not password or not name:
        flash("Username, password, or name not provided", "error")
        return jsonify({"message": "Username, password, or name not provided"}), 400

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"message": "Username already exists"}), 409

    new_user = User(username=username, password=password, name=name)
    db.session.add(new_user)
    db.session.commit()

    # Generate token for the new user
    token = jwt.encode({'username': new_user.username}, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({"message": "User registered successfully", "token": token}), 201


# @app.post('/user-login')
# def userogin():
#     data = request.get_json()
#     username = data.get('username')
#     password = data.get('password')

#     if not username or not password:
#         return jsonify({"message": "Username or password not provided"}), 400

#     # Check if the user is a regular user
#     user = User.query.filter_by(username=username).first()
#     if user and check_password_hash(user.password_hash, password):
#         # Log in as regular user
#         token = jwt.encode({'username': user.username}, app.config['SECRET_KEY'], algorithm='HS256')
#         return jsonify({"message": "Login successful", "token": token}), 200

#     # Check if the user is a librarian
#     librarian = Librarian.query.filter_by(username=username).first()
#     if librarian and check_password_hash(librarian.password_hash, password):
#         # Log in as librarian
#         token = jwt.encode({'username': librarian.username, 'is_librarian': True}, app.config['SECRET_KEY'], algorithm='HS256')
#         return jsonify({"message": "Login successful as librarian", "token": token}), 200

#     return jsonify({"message": "Invalid username or password"}), 401
   


if __name__ == "__main__":
    app.run(debug=True)