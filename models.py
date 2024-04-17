from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash,check_password_hash
from datetime import *

db=SQLAlchemy()



class Section(db.Model):
    __tablename__='section'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    date_created = db.Column(db.String)
    description = db.Column(db.Text)

    ebooks_del = db.relationship('Ebook', cascade='all, delete-orphan',  back_populates='section')

    ebooks = db.relationship('Ebook', back_populates='section',overlaps="ebooks_del")

    def __repr__(self):
        return f"Section('{self.name}', '{self.date_created}')"


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email=db.Column(db.String(100),nullable=False)
    is_Librarian = db.Column(db.Boolean, nullable=False, default=False)
    # Add more user attributes as needed

    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"User('{self.username}')"


class Librarian(db.Model):
    __tablename__ = 'librarian'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    is_Librarian = db.Column(db.Boolean, nullable=False, default=False)

    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"Librarian('{self.username}')"


class Ebook(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(100), nullable=False)
    dateIssued = db.Column(db.Date)
    returnDate = db.Column(db.Date)
    section_id = db.Column(db.Integer, db.ForeignKey('section.id'), nullable=False)

    section = db.relationship('Section', back_populates='ebooks_del')
    
class Access(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ebook_id = db.Column(db.Integer, db.ForeignKey('ebook.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    section_id = db.Column(db.Integer, db.ForeignKey('section.id'), nullable=False)
    granted_access_date = db.Column(db.DateTime)
    revoked_access_date = db.Column(db.DateTime)

    librarian_id = db.Column(db.Integer, db.ForeignKey('librarian.id'), nullable=False)
    librarian = db.relationship('Librarian', backref=db.backref('access_granted', lazy=True))
    ebook = db.relationship('Ebook', backref=db.backref('access', cascade='all, delete-orphan', lazy=True))

    def __repr__(self):
        return f"Access('{self.user_id}', '{self.section_id}', '{self.granted_access_date}', '{self.revoked_access_date}', '{self.librarian_id}')"

class AccessHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ebook_id = db.Column(db.Integer, db.ForeignKey('ebook.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    section_id = db.Column(db.Integer, db.ForeignKey('section.id'), nullable=False)
    access_date = db.Column(db.DateTime, nullable=False)
    librarian_id = db.Column(db.Integer, db.ForeignKey('librarian.id'), nullable=False)
    ebook_name = db.Column(db.String(200), nullable=False)

    user = db.relationship('User', backref=db.backref('access_history', lazy=True))
    ebook = db.relationship('Ebook', backref=db.backref('access_history', lazy=True))
    section = db.relationship('Section', backref=db.backref('access_history', lazy=True))
    librarian = db.relationship('Librarian', backref=db.backref('access_history', lazy=True))

    def __repr__(self):
        return f"AccessHistory('{self.ebook_id}', '{self.user_id}', '{self.access_date}', '{self.librarian_id}', '{self.ebook_name}')"


class BookRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ebook_id = db.Column(db.Integer, db.ForeignKey('ebook.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    section_id = db.Column(db.Integer, db.ForeignKey('section.id'), nullable=False)
    request_date = db.Column(db.DateTime)
    return_date = db.Column(db.DateTime)

    user = db.relationship('User', backref=db.backref('book_requests', lazy=True))
    ebook = db.relationship('Ebook', backref=db.backref('book_requests', cascade='all, delete-orphan', lazy=True))

    def __repr__(self):
        return f"BookRequest('{self.ebook_id}', '{self.user_id}', '{self.request_date}', '{self.return_date}')"
    
class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ebook_id = db.Column(db.Integer, db.ForeignKey('ebook.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    feedback_date = db.Column(db.DateTime, nullable=False)

    user = db.relationship('User', backref=db.backref('feedbacks', lazy=True))
    ebook = db.relationship('Ebook', backref=db.backref('feedbacks', cascade='all, delete-orphan',lazy=True))

    def __repr__(self):
        return f"Feedback('{self.rating}', '{self.comment}', '{self.feedback_date}')"


