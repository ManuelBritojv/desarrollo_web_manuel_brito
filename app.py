from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Configuración BD 
# Por ahora acá, luego lo configuraré de mejor manera.
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://cc5002:programacionweb@localhost:3306/tarea2'

db = SQLAlchemy(app)

# --- MODELOS DE LA BASE DE DATOS (ORM) ---
class Region(db.Model):
    __tablename__ = 'region'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)

class Comuna(db.Model):
    __tablename__ = 'comuna'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    region_id = db.Column(db.Integer, db.ForeignKey('region.id'), nullable=False)

class Voluntario(db.Model):
    __tablename__ = 'voluntario'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(80), nullable=False)
    telefono = db.Column(db.String(15), nullable=False)
    fecha_registro = db.Column(db.DateTime, nullable=False)
    comuna_id = db.Column(db.Integer, db.ForeignKey('comuna.id'), nullable=False)

class Ave(db.Model):
    __tablename__ = 'ave'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(80), nullable=False)

class Avistamiento(db.Model):
    __tablename__ = 'avistamiento'
    id = db.Column(db.Integer, primary_key=True)
    voluntario_id = db.Column(db.Integer, db.ForeignKey('voluntario.id'), nullable=False)
    ave_id = db.Column(db.Integer, db.ForeignKey('ave.id'), nullable=False)
    fecha_hora = db.Column(db.DateTime, nullable=False)
    lugar = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.String(500), nullable=True)

class Registro(db.Model):
    __tablename__ = 'registro'
    id = db.Column(db.Integer, primary_key=True)
    ruta_archivo = db.Column(db.String(300), nullable=False)
    nombre_archivo = db.Column(db.String(300), nullable=False)
    avistamiento_id = db.Column(db.Integer, db.ForeignKey('avistamiento.id'), nullable=False)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/registro')
def registro():
    return render_template("registro.html")

@app.route('/avistamiento')
def avistamiento():
    return render_template("avistamiento.html")

@app.route('/listado')
def listado():
    return render_template("listado.html")

@app.route('/metricas')
def metricas():
    return render_template("metricas.html")

if __name__ == '__main__':
    app.run(debug=True)