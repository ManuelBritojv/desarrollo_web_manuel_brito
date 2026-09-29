from flask import Flask, render_template
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models import Base

app = Flask(__name__)

# Configuración BD 
# Por ahora acá, luego lo configuraré de mejor manera.
DATABASE_URL = 'mysql+pymysql://cc5002:programacionweb@localhost:3306/tarea2'

engine = create_engine(DATABASE_URL) # Crea el motor de conexión de SQLAlchemy.
Session = sessionmaker(bind=engine)


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
    Base.metadata.create_all(engine)
    app.run(debug=True)