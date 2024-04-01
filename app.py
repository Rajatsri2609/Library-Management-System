from models import *

app = Flask(__name__)
app.config['SECRET_KEY'] = '026f45e44043f2c417198178ffa070f72eee7c11fd58492435b3696f08ffe47b6a1b4471d7a24d8038dd449d98cb7964ab50b6140d49f41a52889d00a8f596b7'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///project_db.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

if __name__ == "__main__":
    app.run(debug=True)