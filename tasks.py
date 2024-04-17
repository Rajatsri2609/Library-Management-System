from celery import shared_task
from models import *
from mail_service import send_message
from jinja2 import Template
from flask import render_template_string
from celery import shared_task
from datetime import datetime, timedelta
from pytz import timezone
from sqlalchemy import and_



# @shared_task(ignore_result=False)
# def say_hello():
#     return "Say Hello"

#daily mails

@shared_task(ignore_result=False)
def daily_reminder(to, subject):
    users = User.query.all()
    for user in users:
        send_message(user.email,subject,"Visit the app")
    return "OK"

# monthly report

@shared_task(ignore_result=True)
def report(to, subject):
    try:
        users = User.query.all()
        for user in users:
            feedback = Feedback.query.filter_by(user_id=user.id).all()
            access_history = AccessHistory.query.filter_by(user_id=user.id).all()
            with open('report.html', 'r') as f:
                template = Template(f.read())
                send_message(user.email, subject,
                             template.render(feedback=feedback, access_history=access_history))
        return "OK"
    except Exception as e:
        print("Error:", e)
        return "Error"



@shared_task(ignore_result=True)
def revoke_access_task():
    try:
        # Get the current time in UTC
        current_time = datetime.now(timezone('UTC'))
        
        # Calculate the datetime 1 minute ago
        one_minute_ago = current_time - timedelta(minutes=1)
        
        # Query for access entries granted more than 1 minute ago
        access_entries = Access.query.filter(and_(Access.granted_access_date <= one_minute_ago, Access.revoked_access_date == None)).all()
        
        # Revoke access for each entry
        for access_entry in access_entries:
            access_entry.revoked_access_date = current_time
            db.session.delete(access_entry)
            db.session.commit()
    except Exception as e:
        print("Error revoking expired access:", e)

    return "OK"
