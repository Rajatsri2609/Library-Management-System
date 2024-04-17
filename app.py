from models import *
from flask import Flask,render_template, request,jsonify,flash
import jwt
from functools import wraps
from jwt import encode
from datetime import datetime
from flask_cors import CORS 
from flask_restful import *
from flask import current_app as app, jsonify, request, render_template
from worker import celery_init_app
#from tasks import say_hello
from tasks import daily_reminder
from tasks import report
from tasks import revoke_access_task
from celery import Celery, Task
from flask import Flask
from datetime import datetime, timezone
from celery.schedules import crontab
from cache_instances import cache
from sqlalchemy import func


def create_app() -> Flask:
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'abcd'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///project_db.sqlite3'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'
    BROKER_URL = "redis://localhost:6379/1"
    RESULT_BACKEND = "redis://localhost:6379/2"
    REDIS_URL="redis://localhost:6379"
    timezone = "Asia/Kolkata"
    broker_connection_retry_on_startup=True
    app.config['CACHE_TYPE'] = 'RedisCache'
    app.config['CACHE_REDIS_HOST'] = 'localhost'
    app.config['CACHE_REDIS_PORT'] = '6379'
    app.config['CACHE_REDIS_DB'] = '3'
    CORS(app)
    db.init_app(app)
    cache.init_app(app)
    app.app_context().push()
    db.create_all()
    celery_init_app(app)
    return app
    
app=create_app()
celery_app=celery_init_app(app)


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
            token = jwt.encode({'username': user.username, 'is_librarian': False}, app.config['SECRET_KEY'], algorithm='HS256')
            print("Generated token:", token)
            # Include additional user information in the token if needed
            flash("Login Successful","success")
            print("Decoded token payload:", jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256']))
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
    email=data.get('email')

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

    new_user = User(username=username, password=password, name=name,email=email)
    db.session.add(new_user)
    db.session.commit()

    # Generate token for the new user
    token = jwt.encode({'username': new_user.username,'is_librarian': False}, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({"message": "User registered successfully", "token": token}), 201


@app.get('/api/sections')
@token_required
@cache.cached(timeout=30)
def get_sections(current_user):
    sections = Section.query.all()
    section_data = []
    for section in sections:
        section_info = {
            'id': section.id,
            'name': section.name,
            'num_ebooks': len(section.ebooks),
            'description': section.description,
            'ebooks': [{'id': ebook.id, 'name': ebook.name, 'author': ebook.author} for ebook in section.ebooks]
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
            'dateIssued': ebook.dateIssued.isoformat() if ebook.dateIssued else None,
            'returnDate': ebook.returnDate.isoformat() if ebook.returnDate else None
        }
        ebook_data.append(ebook_info)
        
    response_data = {
        'section_name': section.name,
        'ebooks': ebook_data
    }
    print(response_data)  # Add this line to print the response data

    return jsonify(response_data)  # Return response_data instead of ebook_data

@app.post('/api/sections/<int:section_id>/ebooks')
@token_required
def add_ebook(current_user, section_id):
    
    try:
        if not current_user.is_Librarian:
            return jsonify({"message": "Unauthorized access"}), 403

        section = Section.query.get(section_id)
        if not section:
            return jsonify({"message": "Section not found"}), 404

        data = request.get_json()
        name = data.get('name')
        content = data.get('content')
        author = data.get('author')
        # dateIssued = data.get('dateIssued')
        # returnDate = data.get('returnDate')

        if not (name and content and author):
            return jsonify({"message": "Please provide all required fields"}), 400
        
        # dateIssued = datetime.strptime(dateIssued, '%Y-%m-%d')
        # returnDate = datetime.strptime(returnDate, '%Y-%m-%d')

        new_ebook = Ebook(
            name=name,
            content=content,
            author=author,
            # dateIssued=dateIssued,
            # returnDate=returnDate,
            section_id=section_id
        )


        db.session.add(new_ebook)
        db.session.commit()

        return jsonify({"message": "Ebook added successfully", "id": new_ebook.id}), 201
    except Exception as e:
        print("Error:", e)  # Print the error message for debugging
        return jsonify({"message": "Internal Server Error"}), 500



@app.get('/api/sections/<int:section_id>/ebooks/<int:ebook_id>')
@token_required
def get_ebook(current_user, section_id, ebook_id):
    try:
        if not current_user.is_Librarian:
            return jsonify({"message": "Unauthorized access"}), 403

        section = Section.query.get(section_id)
        if not section:
            return jsonify({"message": "Section not found"}), 404

        ebook = Ebook.query.filter_by(id=ebook_id, section_id=section_id).first()
        if not ebook:
            return jsonify({"message": "Ebook not found in this section"}), 404

        # Serialize the ebook object to send its details in the response
        ebook_info = {
            'id': ebook.id,
            'name': ebook.name,
            'content': ebook.content,
            'author': ebook.author,
            # 'dateIssued': ebook.dateIssued.strftime('%Y-%m-%d'),
            # 'returnDate': ebook.returnDate.strftime('%Y-%m-%d')
        }

        return jsonify(ebook_info), 200
    except Exception as e:
        print("Error:", e)  # Print the error message for debugging
        return jsonify({"message": "Internal Server Error"}), 500

@app.delete('/api/sections/<int:section_id>/ebooks/<int:ebook_id>')
@token_required
def delete_ebook(current_user, section_id, ebook_id):
    try:
        if not current_user.is_Librarian:
            return jsonify({"message": "Unauthorized access"}), 403

        section = Section.query.get(section_id)
        if not section:
            return jsonify({"message": "Section not found"}), 404

        ebook = Ebook.query.filter_by(id=ebook_id, section_id=section_id).first()
        if not ebook:
            return jsonify({"message": "Ebook not found in this section"}), 404

        db.session.delete(ebook)
        db.session.commit()

        return jsonify({"message": "Ebook deleted successfully", "id": ebook.id}), 200
    except Exception as e:
        print("Error:", e)  # Print the error message for debugging
        return jsonify({"message": "Internal Server Error"}), 500



@app.put('/api/sections/<int:section_id>/ebooks/<int:ebook_id>')
@token_required
def edit_ebook(current_user, section_id, ebook_id):
    try:
        if not current_user.is_Librarian:
            return jsonify({"message": "Unauthorized access"}), 403

        section = Section.query.get(section_id)
        if not section:
            return jsonify({"message": "Section not found"}), 404

        ebook = Ebook.query.filter_by(id=ebook_id, section_id=section_id).first()
        if not ebook:
            return jsonify({"message": "Ebook not found in this section"}), 404

        data = request.get_json()
        # Update ebook attributes with new data
        ebook.name = data.get('name', ebook.name)
        ebook.content = data.get('content', ebook.content)
        ebook.author = data.get('author', ebook.author)
        # Ensure date format is correct
        # dateIssued = datetime.strptime(data.get('dateIssued'), '%Y-%m-%d')
        # returnDate = datetime.strptime(data.get('returnDate'), '%Y-%m-%d')
        # ebook.dateIssued = dateIssued
        # ebook.returnDate = returnDate

        db.session.commit()

        return jsonify({"message": "Ebook updated successfully", "id": ebook.id}), 200
    except Exception as e:
        print("Error:", e)  # Print the error message for debugging
        return jsonify({"message": "Internal Server Error"}), 500

@app.post('/api/request-access/<int:ebook_id>')
@token_required
def request_access(current_user, ebook_id):
    # Retrieve the ebook object
    ebook = Ebook.query.get(ebook_id)
    if not ebook:
        return jsonify({"message": "Ebook not found"}), 404

    # Check if the user already has access to the ebook
    existing_access = Access.query.filter_by(user_id=current_user.id, ebook_id=ebook_id).first()
    if existing_access:
        return jsonify({"message": "Access already granted for this ebook"}), 400
    
    # Check if there's already a pending request for any ebook within the same section
    existing_requests = BookRequest.query \
        .join(Ebook, BookRequest.ebook_id == Ebook.id) \
        .filter(Ebook.section_id == ebook.section_id) \
        .filter(Ebook.id==ebook.id)\
        .filter(BookRequest.user_id == current_user.id) \
        .filter(BookRequest.return_date == None) \
        .all()

    if existing_requests:
        print(existing_requests)
        return jsonify({"message": "There is already a pending request for an ebook from this section"}), 400
    

    max_books_requested = 5
    num_books_requested = db.session.query(func.count(BookRequest.id)) \
        .filter_by(user_id=current_user.id, return_date=None) \
        .scalar()

    if num_books_requested >= max_books_requested:
        return jsonify({"message": f"You have already requested access to {max_books_requested} books. You cannot request access to more books."}), 400
    
    # Create a new book request
    book_request = BookRequest(
        user_id=current_user.id,
        ebook_id=ebook_id,
        section_id=ebook.section_id,
        request_date=datetime.utcnow(),
        return_date=None
    )
    db.session.add(book_request)
    db.session.commit()
    return jsonify({"message": "Access request sent successfully"}), 201


from flask import jsonify

@app.get('/api/pending-requests')
@token_required
def get_pending_requests(current_user):
    try:
        pending_requests_info = []
        
        # Check if there are pending requests in the Access table
        access_requests = Access.query.filter_by(revoked_access_date=None).all()
    
        for access in access_requests:
            request_info = {
                'id': access.id,
                'user_id': access.user_id,
                'ebook_id': access.ebook_id,
                'request_date': access.granted_access_date.isoformat(),
                'accessGranted': True,  # Access is already granted
                'accessButtonText': 'Revoke Access'  # Button text for revoking access
            }
            pending_requests_info.append(request_info)
        
            # If there are no pending requests in Access table, fetch from BookRequest table
        book_requests = BookRequest.query.filter_by(return_date=None).all()
        for request in book_requests:
            request_info = {
                'id': request.id,
                'user_id': request.user_id,
                'ebook_id': request.ebook_id,
                'request_date': request.request_date.isoformat(),
                'accessGranted': False,  # Access needs to be granted
                'accessButtonText': 'Grant Access'  # Button text for granting access
            }
            pending_requests_info.append(request_info)

        return jsonify(pending_requests_info), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "Internal Server Error"}), 500



@app.post('/api/grant-access/<int:request_id>')
@token_required
def grant_access(current_user, request_id):
    try:
        if not current_user.is_Librarian:
            return jsonify({"message": "Unauthorized access"}), 403

        # Find the pending request
        book_request = BookRequest.query.get(request_id)
        if not book_request:
            return jsonify({"message": "Request not found"}), 404

        # Create a new entry in the Access table
        access = Access(
            ebook_id=book_request.ebook_id,
            user_id=book_request.user_id,
            section_id=book_request.section_id,
            granted_access_date=datetime.now(timezone.utc),
            revoked_access_date=None,
            librarian_id=current_user.id
        )
        db.session.add(access)

        # Create a new entry in the AccessHistory table
        access_history = AccessHistory(
            ebook_id=book_request.ebook_id,
            user_id=book_request.user_id,
            section_id=book_request.section_id,
            access_date=datetime.now(timezone.utc),
            librarian_id=current_user.id,
            ebook_name=book_request.ebook.name
        )
        db.session.add(access_history)

        # Delete the pending request
        db.session.delete(book_request)

        db.session.commit()

        return jsonify({"message": "Access granted successfully"}), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "Internal Server Error"}), 500

# @app.post('/api/deny-access/<int:request_id>')
# @token_required
# def deny_access(current_user, request_id):
#     try:
#         if not current_user.is_Librarian:
#             return jsonify({"message": "Unauthorized access"}), 403

#         # Find the pending request
#         book_request = BookRequest.query.session.get(BookRequest, request_id)
#         if not book_request:
#             return jsonify({"message": "Request not found"}), 404

#         # Delete the pending request
#         db.session.delete(book_request)
#         db.session.commit()

#         return jsonify({"message": "Access denied successfully"}), 200
#     except Exception as e:
#         print("Error:", e)
#         return jsonify({"message": "Internal Server Error"}), 500

@app.post('/api/revoke-access/<int:request_id>')
@token_required
def revoke_access(current_user, request_id):
    try:
        if not current_user.is_Librarian:
            return jsonify({"message": "Unauthorized access"}), 403

        # Find the access entry to revoke
        access_entry = Access.query.get(request_id)
        if not access_entry:
            return jsonify({"message": "Access entry not found"}), 404

        # Set the revoked access date to the current time
        access_entry.revoked_access_date = datetime.now(timezone.utc)

        # Delete the access entry
        db.session.delete(access_entry)
        db.session.commit()

        return jsonify({"message": "Access revoked successfully"}), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "Internal Server Error"}), 500

@app.get('/api/accessed-books')
@token_required
def get_accessed_books(current_user):
    try:
        accessed_books_info = []

        # Query the Access table to get the books that have been granted access
        accessed_books = db.session.query(Access, Ebook).\
            join(Ebook, Access.ebook_id == Ebook.id).\
            filter(Access.revoked_access_date == None).all()

        # Iterate over the accessed books and collect their information
        for access, ebook in accessed_books:
            book_info = {
                'id': ebook.id,
                'name': ebook.name,
                'author': ebook.author,
                'content': ebook.content
            }
            accessed_books_info.append(book_info)

        return jsonify(accessed_books_info), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "Internal Server Error"}), 500

@app.get('/api/book-content/<int:book_id>')
@token_required
def get_book_content(current_user, book_id):
    try:
        # Check if the current user has access to the book
        access = Access.query.filter_by(user_id=current_user.id, ebook_id=book_id).first()
        if not access:
            return jsonify({"message": "You don't have access to this book."}), 403
        
        # Fetch the book content from the eBook table
        ebook = Ebook.query.get(book_id)
        if not ebook:
            return jsonify({"message": "Book not found."}), 404
        
        return jsonify({"content": ebook.content}), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "Internal Server Error"}), 500

@app.delete('/api/return-book/<int:book_id>')
@token_required
def return_book(current_user, book_id):
    try:
        # Check if the current user has access to the book
        access = Access.query.filter_by(user_id=current_user.id, ebook_id=book_id).first()
        if not access:
            return jsonify({"message": "You don't have access to this book."}), 403
        
        # Revoke access to the book by setting the revoked_access_date
        db.session.delete(access)
        db.session.commit()
        
        return jsonify({"message": "Book returned successfully."}), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "Internal Server Error"}), 500

@app.post('/api/feedback/<int:book_id>')
@token_required
def submit_feedback(current_user, book_id):
    data = request.get_json()
    rating = data.get('rating')
    comment = data.get('comment')

    if not rating:
        return jsonify({"message": "Rating is required"}), 400

    # Check if the user has access to the ebook
    access = Access.query.filter_by(user_id=current_user.id, ebook_id=book_id).first()
    if not access:
        return jsonify({"message": "You don't have access to give feedback for this book."}), 403

    # Check if the ebook exists
    ebook = Ebook.query.get(book_id)
    if not ebook:
        return jsonify({"message": "Ebook not found."}), 404
    
    existing_feedback = Feedback.query.filter_by(user_id=current_user.id, ebook_id=book_id).first()
    if existing_feedback:
        return jsonify({"message": "You have already submitted feedback for this book."}), 400

    # Create a new feedback entry
    feedback = Feedback(
        ebook_id=book_id,
        user_id=current_user.id,
        rating=rating,
        comment=comment,
        feedback_date=datetime.utcnow()
    )
    db.session.add(feedback)
    db.session.commit()

    return jsonify({"message": "Feedback submitted successfully"}), 201    


@celery_app.on_after_configure.connect
def send_emails(sender, **kwargs):
    #daily reminder
    sender.add_periodic_task(
        crontab(hour=14, minute=39),
        daily_reminder.s('rajat123@email.com', 'Daily reminder'),
    )
    #send monthly report
    sender.add_periodic_task(
        crontab(hour=14, minute=39, day_of_month=17),
        report.s('rajat123@email.com', 'Monthly Report'),
    )
    #revoke access
    sender.add_periodic_task(
        crontab(hour=14, minute=39),
        revoke_access_task.s(),
    )

if __name__ == "__main__":
    app.run(debug=True)