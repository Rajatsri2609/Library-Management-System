from models import *
from flask import Flask,render_template, request,jsonify,flash, redirect, url_for, session
import jwt
from functools import wraps
from jwt import encode
from datetime import datetime
# from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS 
from flask_restful import *
from flask import current_app as app, jsonify, request, render_template


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

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split()[1]

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(username=data['username']).first() or \
                           Librarian.query.filter_by(username=data['username']).first()
        except:
            return jsonify({'message': 'Token is invalid'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

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

    # Check if the username is "librarian"
    if username.lower() == "librarian":
        flash("The username 'librarian' is reserved for librarian accounts only", "error")
        return jsonify({"message": "The username 'librarian' is reserved for librarian accounts only"}), 400

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"message": "Username already exists"}), 409

    new_user = User(username=username, password=password, name=name)
    db.session.add(new_user)
    db.session.commit()

    # Generate token for the new user
    token = jwt.encode({'username': new_user.username}, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({"message": "User registered successfully", "token": token}), 201


@app.get('/api/sections')
@token_required
def get_sections(current_user):
    if not current_user.is_Librarian:
        return jsonify({"message": "Unauthorized access"}), 403

    sections = Section.query.all()
    section_data = []
    for section in sections:
        section_info = {
            'id': section.id,
            'name': section.name,
            'num_ebooks': len(section.ebooks),
            'description':section.description
        }
        section_data.append(section_info)
    return jsonify(section_data)

@app.post('/api/add-section')
@token_required
def add_section(current_user):
    if not current_user.is_Librarian:
        return jsonify({"message": "Unauthorized access"}), 403

    data = request.get_json()
    name = data.get('name')
    description = data.get('description')

    if not name:
        return jsonify({"message": "Section name is required"}), 400
    date = datetime.now().strftime("%Y_%m_%d_%H_%M_%S")
    new_section = Section(name=name, description=description, date_created=date)
    db.session.add(new_section)
    db.session.commit()

    return jsonify({"message": "Section added successfully", "id": new_section.id}), 201

@app.get('/api/sections/<int:section_id>')
@token_required
def get_section_details(current_user, section_id):
    if not current_user.is_Librarian:
        return jsonify({"message": "Unauthorized access"}), 403

    section = Section.query.get(section_id)
    if not section:
        return jsonify({"message": "Section not found"}), 404

    section_info = {
        'id': section.id,
        'name': section.name,
        'description': section.description
    }

    return jsonify(section_info)


@app.put('/api/sections/<int:section_id>')
@token_required
def update_section(current_user, section_id):
    if not current_user.is_Librarian:
        return jsonify({"message": "Unauthorized access"}), 403

    data = request.get_json()
    name = data.get('name')
    description = data.get('description')

    if not name:
        return jsonify({"message": "Section name is required"}), 400

    section = Section.query.get(section_id)
    if not section:
        return jsonify({"message": "Section not found"}), 404

    section.name = name
    section.description = description
    db.session.commit()

    return jsonify({"message": "Section updated successfully", "id": section.id}), 200

@app.delete('/api/sections/<int:section_id>')
@token_required
def delete_section(current_user, section_id):
    if not current_user.is_Librarian:
        return jsonify({"message": "Unauthorized access"}), 403

    section = Section.query.get(section_id)
    if not section:
        return jsonify({"message": "Section not found"}), 404

    db.session.delete(section)
    db.session.commit()

    return jsonify({"message": "Section deleted successfully", "id": section.id}), 200

@app.get('/api/sections/<int:section_id>/ebooks')
@token_required
def get_section_ebooks(current_user, section_id):
    if not current_user.is_Librarian:
        return jsonify({"message": "Unauthorized access"}), 403

    section = Section.query.get(section_id)
    if not section:
        return jsonify({"message": "Section not found"}), 404

    ebooks = Ebook.query.filter_by(section_id=section_id).all()
    ebook_data = []
    for ebook in ebooks:
        ebook_info = {
            'id': ebook.id,
            'name': ebook.name,
            'content': ebook.content,
            'author': ebook.author,
            'date_issued': ebook.date_issued.isoformat() if ebook.date_issued else None,
            'return_date': ebook.return_date.isoformat() if ebook.return_date else None
        }
        ebook_data.append(ebook_info)
        
    response_data = {
        'section_name': section.name,
        'ebooks': ebook_data
    }
    print(response_data)  # Add this line to print the response data

    return jsonify(response_data)  # Return response_data instead of ebook_data




if __name__ == "__main__":
    app.run(debug=True)