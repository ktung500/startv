from flask import Flask
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class properties(db.Model):
    _id = db.Column("id", db.Integer, primary_key=True)

#groups api route
@app.route("/properties")
def properties():
    return {"properties": ["Property 1", "Property2"]}

if __name__ == "__main__":
    app.run(debug=True)