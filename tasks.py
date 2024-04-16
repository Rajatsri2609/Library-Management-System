from celery import shared_task
from models import *
from mail_service import send_message
from jinja2 import Template
from flask import render_template_string



@shared_task(ignore_result=False)
def say_hello():
    return "Say Hello"

#daily mails

@shared_task(ignore_result=False)
def daily_reminder(to, subject):
    users = User.query.all()
    for user in users:
        send_message(user.email,subject,"Visit the app")
    return "OK"

# monthly report

# @shared_task(ignore_result=True)
# def report(to, subject):
#     users = User.query.all()
#     feedback = Feedback.query.all()
#     for user in users:
#         with open('report.html', 'r') as f:
#             template = Template(f.read())
#             send_message(user.email, subject,
#                          template.render(feedback=feedback))
#     return "OK"