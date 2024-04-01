from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash,check_password_hash
db=SQLAlchemy()

# Define models

class Section(db.Model):
    __tablename__='section'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    date_created = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.Text)

    def __repr__(self):
        return f"Section('{self.name}', '{self.date_created}')"

class User(db.Model):
    __tablename__='user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash=db.Column(db.String(100),nullable=False)
    # Add more user attributes as needed

    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self,password):
        self.password_hash=generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash,password)

    def __repr__(self):
        return f"User('{self.username}')"

class Librarian(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    # Add more librarian attributes as needed

    def __repr__(self):
        return f"Librarian('{self.username}')"

class Ebook(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(100), nullable=False)
    date_issued = db.Column(db.DateTime)
    return_date = db.Column(db.DateTime)

    section_id = db.Column(db.Integer, db.ForeignKey('section.id'), nullable=False)
    section = db.relationship('Section', backref=db.backref('ebooks', lazy=True))

    def __repr__(self):
        return f"Ebook('{self.name}', '{self.author}', '{self.date_issued}', '{self.return_date}')"

# Define any additional models or relationships as needed

