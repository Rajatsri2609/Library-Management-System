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

# Assuming you have already imported necessary modules and defined your User model

# Check if a librarian with the username 'librarian' exists
librarian = Librarian.query.filter_by(username='librarian').first()

# If librarian doesn't exist, create a new librarian entry
if not librarian:
    librarian = Librarian(username='librarian', password='librarian', name='Librarian', is_Librarian=True)
    db.session.add(librarian)
    db.session.commit()


@app.route('/librarian')
def librarian():
    if 'user_id' not in session:
        flash('Please login to continue.')
        return redirect(url_for('login'))
    
    user=User.query.get(session['user_id'])
    if not user.is_Librarian:
        flash('You are not allowed to view this page.')
        return redirect(url_for('login'))
    return render_template('login.html')


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template('login.html')

    username = request.form.get('username')
    password = request.form.get('password')

    if not username or not password:
        flash('Username or password cannot be empty.')
        return redirect(url_for('login'))

    librarian = Librarian.query.filter_by(username=username).first()
    if librarian and librarian.check_password(password):
        session['user_id'] = librarian.id
        session['role'] = 'librarian'
        return redirect(url_for('ldashboard'))

    user = User.query.filter_by(username=username).first()
    if not user:
        flash('User does not exist.')
        return redirect(url_for('login'))
    if not user.check_password(password):
        flash('Incorrect password.')
        return redirect(url_for('login'))

    # Login successful
    session['user_id'] = user.id
    return redirect(url_for('udashboard'))


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "GET":
        return render_template('register.html')

    if request.method == "POST":
        username = request.form.get('username')
        password = request.form.get('password')
        name = request.form.get('name')

        if not username or not password:
            flash('Username or password cannot be empty.')
            return redirect(url_for('register'))

        if User.query.filter_by(username=username).first():
            flash('User with this username already exists.')
            return redirect(url_for('register'))

        user = User(username=username, password=password, name=name)
        db.session.add(user)
        
        try:
            db.session.commit()
            flash('User successfully registered.')
        except Exception as e:
            print(e)
            db.session.rollback()
            flash('An error occurred while registering the user.')

        return redirect(url_for('login'))


@app.route('/')  
def udashboard():
    if 'user_id' not in session:
        flash('Please login to continue.')
        return redirect(url_for('login'))
    return render_template('udashboard.html')

if __name__ == "__main__":
    app.run(debug=True)