from flask import Flask, flash, render_template, request
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from models import *
from validaciones import *

app = Flask(__name__)

# Secret Key (Sirve para firmar de forma segura los datos de las sesiones del usuario)
# Conseguida mediante, import secrets -> secrets.token_hex(24)
app.config["SECRET_KEY"] = '23307804b9bebfe17aeb40fa870e7199fadc7ad99a5f902a'
DATABASE_URL = 'mysql+pymysql://cc5002:programacionweb@localhost:3306/tarea2'
engine = create_engine(DATABASE_URL) # Crea el motor de conexión de SQLAlchemy.

@app.route('/')
def index():
    with Session(engine) as session:
        stmt = ( 
            select(Avistamiento)               # SELECT * FROM avistamiento
            .order_by(Avistamiento.id.desc())  # ORDER BY id DESC LIMIT 2 
            .limit(2)
        )
        avistamientos = session.scalars(stmt).all()
        return render_template("index.html", avistamientos=avistamientos)

@app.route('/registro', methods=['GET', 'POST'])
def registro():
    with Session(engine) as session:
        stmtR = (
            select(Region)           # SELECT * FROM region
            .order_by(Region.nombre) # ORDER BY nombre
        )
        stmtC = (
            select(Comuna)           # SELECT * FROM comuna
            .order_by(Comuna.nombre) # ORDER BY nombre
        )
        regiones = session.scalars(stmtR).all()
        comunas = session.scalars(stmtC).all()

        # Si el metodo de request es POST (Envio del form)
        if request.method == 'POST':
            nombre = request.form.get('nombre', '').strip()
            email = request.form.get('email', '').strip()
            telefono = request.form.get('telefono', '').strip()
            region_id = request.form.get('region', '')
            comuna_id = request.form.get('comuna', '')
            hayError = False
            if not nombre or len(nombre) > 255 or not esNombreValido(nombre):
                flash('El nombre es inválido o esta vacío.', 'flash_error')
                hayError = True
            if not email or '@' not in email or len(email) > 80:
                flash('El correo es inválido o esta vacío.', 'flash_error')
                hayError = True
            if telefono and not esNumerovalido(telefono):
                flash('El número de teléfono ingresado no es válido', 'flash_error')
                hayError = True
            comuna = None
            if region_id.isdecimal() and comuna_id.isdecimal():
                comuna = session.get(Comuna, int(comuna_id))
            if comuna is None or comuna.region_id != int(region_id):
                flash('Debe seleccionar una región y una comuna válidas.', 'flash_error')
                hayError = True
            if hayError:
                return render_template("registro.html", regiones=regiones, comunas=comunas)
            voluntario_id = agregar_voluntario(session, nombre, email, telefono, comuna.id)
            if voluntario_id is None:
                flash('No se pudo guardar el registro. Intente nuevamente.', 'flash_error')
                return render_template("registro.html", regiones=regiones, comunas=comunas)
            return render_template("registro.html", regiones=regiones, comunas=comunas, exito=True, voluntario_id=voluntario_id)

        # Si el metodo de request es GET
        return render_template("registro.html", regiones=regiones, comunas=comunas)

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