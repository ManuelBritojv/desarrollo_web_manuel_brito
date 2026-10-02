import os
from datetime import datetime, timedelta
from math import ceil

from flask import Flask, abort, flash, redirect, render_template, request, url_for
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session
from werkzeug.utils import secure_filename

from models import *
from validaciones import *

app = Flask(__name__)

# Extensiones permitidas de archivos
EXTENSIONES_PERMITIDAS = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm'}
# Carpeta donde se almacenarán los registros
UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Aseguro de que la carpeta exista al iniciar
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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

            # Validacion Nombre
            if not nombre or len(nombre) > 255 or not esNombreValido(nombre):
                flash('El nombre es inválido o esta vacío.', 'flash_error')
                hayError = True

            # Validación email
            if not email or '@' not in email or len(email) > 80:
                flash('El correo es inválido o esta vacío.', 'flash_error')
                hayError = True

            # Validacion telefono
            if telefono and not esNumerovalido(telefono):
                flash('El número de teléfono ingresado no es válido', 'flash_error')
                hayError = True

            comuna = None
            # Validacion region y comuna
            if region_id.isdecimal() and comuna_id.isdecimal():
                comuna = session.scalars(
                    stmtC.where(Comuna.id == int(comuna_id))
                ).first()
            if comuna is None or comuna.region_id != int(region_id):
                flash('Debe seleccionar una región y una comuna válidas.', 'flash_error')
                hayError = True

            if hayError:
                return render_template("registro.html", regiones=regiones, comunas=comunas)
            
            # Agregamos voluntario a la BD
            voluntario_id = agregar_voluntario(session, nombre, email, telefono, comuna.id)

            # Si por algun motivo falla.
            if voluntario_id is None:
                flash('No se pudo guardar el registro. Intente nuevamente.', 'flash_error')
                return render_template("registro.html", regiones=regiones, comunas=comunas)
            return redirect(url_for('registro', exito=voluntario_id))

        # Si el metodo de request es GET
        exito_id = request.args.get('exito', '')
        if exito_id.isdecimal():
            voluntario = session.scalars(
                select(Voluntario)                      # SELECT * FROM voluntario
                .where(Voluntario.id == int(exito_id))  # WHERE id = exito_id
            ).first() 
            if voluntario is not None:
                return render_template("registro.html", regiones=regiones, comunas=comunas, exito=True, voluntario_id=voluntario.id)
        return render_template("registro.html", regiones=regiones, comunas=comunas)


@app.route('/avistamiento', methods=['GET', 'POST'])
def avistamiento():
    with Session(engine) as session:
        # Si el metodo de request es POST (Envio del form)
        stmtR = (
            select(Region)           # SELECT * FROM region
            .order_by(Region.nombre) # ORDER BY nombre
        )
        stmtC = (
            select(Comuna)           # SELECT * FROM comuna
            .order_by(Comuna.nombre) # ORDER BY nombre
        )
        stmtA = (
            select(Ave)              # SELECT * FROM AVE
            .order_by(Ave.nombre)    # ORDER BY nombre

        )
        regiones = session.scalars(stmtR).all()
        comunas = session.scalars(stmtC).all()
        aves = session.scalars(stmtA).all()
        if request.method == 'POST':
            id_voluntario = request.form.get('id-voluntario', '').strip()
            fecha_hora = request.form.get('fecha', '').strip()
            tipo_ave = request.form.get('tipo-ave','').strip()
            descripcion = request.form.get('descripcion', '').strip()
            region_id = request.form.get('region', '')
            comuna_id = request.form.get('comuna', '')
            lugar = request.form.get('lugar','').strip()
            registros = request.files.getlist('evidencia')

            hayError = False

            # Validación id_voluntario
            if id_voluntario.isdecimal():
                voluntario = session.scalars(
                    select(Voluntario)                             # SELECT * FROM voluntario
                    .where(Voluntario.id == int(id_voluntario))    # WHERE id = id_voluntario
                ).first() # Solo necesito el primer elemento que aparezca...

                if voluntario is None:
                    flash('No existe usuario con ese id', 'flash_error')
                    hayError = True
            else: 
                flash('El id es inválido', 'flash_error')
                hayError = True

            # Validación fecha y hora
            try:
                fecha_hora = datetime.strptime(fecha_hora, '%Y-%m-%dT%H:%M')
                ahora = datetime.now()
                hace_tres_anhos = ahora - timedelta(days= 3 * 365)

                if fecha_hora > ahora:
                    flash('La fecha no puede ser futura', 'flash_error')
                    hayError = True

                elif fecha_hora < hace_tres_anhos:
                    flash('La fecha no puede tener más de 3 años de antigüedad', 'flash_error')
                    hayError = True
            except ValueError:
                flash('La fecha es inválida', 'flash_error')
                hayError = True

            # Validación ave
            ave_seleccionada = session.scalars(                          
                select(Ave)                                          # SELECT * FROM ave
                .where(func.lower(Ave.nombre) == tipo_ave.lower())   # WHERE LOWER(nombre) = tipo_ave.lower()
            ).first() # Solo necesito el primer elemento que aparezca...

            if ave_seleccionada is None:
                flash('La ave ingresada no es válida', 'flash_error')
                hayError = True
            else:
                # Si es válida, guardo su ID para usarla después
                id_ave = ave_seleccionada.id

            # Validación descripción
            if len(descripcion) > 500:
                flash('La descripción no puede tener mas de 500 caracteres', 'flash_error')
                hayError = True

            # Validación region y comuna
            if region_id.isdecimal() and comuna_id.isdecimal():
                comunaSeleccionada = session.scalars(
                    stmtC.where(Comuna.id == int(comuna_id))
                ).first()
                if comunaSeleccionada is None or comunaSeleccionada.region_id != int(region_id):
                    flash('Debe seleccionar una región y una comuna válidas.', 'flash_error')
                    hayError = True
            else:
                flash('Debe seleccionar una región y una comuna válidas.', 'flash_error')
                hayError = True

            # Validación lugar
            if len(lugar) > 120:
                flash('La especificación del lugar no puede tener mas de 120 caracteres', 'flash_error')
                hayError = True

            # Validación registros
            if not registros or all(r.filename == '' for r in registros):
                flash('Es obligatorio subir al menos una fotografía o vídeo.', 'flash_error')
                hayError = True
            else: # Hay al menos un archivo
                registros_validos = []
                for registro in registros:
                    if registro.filename == '':
                        continue
                    tipo = registro.content_type

                    # Extensión del archivo (en minúsculas, vacía si no tiene punto)
                    if '.' in registro.filename:
                        extension = registro.filename.rsplit('.', 1)[-1].lower() 
                    else: 
                        extension = ''

                    # Si no es una imagen o video, o su extensión no está permitida
                    if (not tipo.startswith('image/') and not tipo.startswith('video/')) or extension not in EXTENSIONES_PERMITIDAS:
                        flash(f'El archivo "{registro.filename}" no es una imagen o video válido.', 'flash_error')
                        hayError = True
                        continue
                    
                    # Si es válido, lo preparamos
                    nombre_original = registro.filename
                    nombre_seguro = secure_filename(nombre_original)
                    ruta_relativa = f"uploads/{nombre_seguro}"
                    ruta_fisica = os.path.join(app.config['UPLOAD_FOLDER'], nombre_seguro)
                    
                    registros_validos.append({
                        'registro_obj': registro, # Importante para poder hacer .save()
                        'ruta_fisica': ruta_fisica, # Importante ya que indica la ruta donde lo guardo.
                        'ruta_relativa': ruta_relativa,
                        'nombre_original': nombre_original
                    })
            if hayError:
                return render_template("avistamiento.html", regiones=regiones, comunas=comunas, aves=aves)
            
            region = session.scalars(
                select(Region)
                .where(Region.id == int(region_id))
            ).first()

            comuna = session.scalars(
                select(Comuna)
                .where(Comuna.id == int(comuna_id))
            ).first()

            # Construimos el lugar final concatenando sus atributos
            if lugar != "":
                lugarFinal = f"{region.nombre}, {comuna.nombre}, {lugar}"
            else:
                lugarFinal = f"{region.nombre}, {comuna.nombre}"

            avistamiento_id = agregar_avistamiento(session, int(id_voluntario), id_ave, fecha_hora, lugarFinal, descripcion, registros_validos)

            if avistamiento_id is None:
                flash('No se pudo guardar el avistamiento. Intente nuevamente.', 'flash_error')
                return render_template("avistamiento.html", regiones=regiones, comunas=comunas, aves=aves)
            
            flash('¡Avistamiento registrado con éxito!', 'flash_exito')
            return redirect(url_for('index'))

        # Si es GET
        return render_template("avistamiento.html", regiones=regiones, comunas=comunas, aves=aves)
    


POR_PAGINA = 5 # Cantidad de avistamientos que muestro por página.
@app.route('/listado')
def listado():
    pagina = request.args.get('pagina', '1')
    if pagina.isdecimal() and int(pagina) >= 1:
        pagina = int(pagina) 
    else: 
        pagina = 1

    with Session(engine) as session:
        total = session.scalar( #Total de avistamientos
            select(func.count(Avistamiento.id))
        )
        total_paginas = max(1, ceil(total / POR_PAGINA)) # Maximo de avistamientos por pagina
        pagina = min(pagina, total_paginas)  # si piden una página que no existe
        stmt = (
            select(Avistamiento)                                                # SELECT * FROM avistamiento
            .order_by(Avistamiento.fecha_hora.desc(), Avistamiento.id.desc())   # ORDER BY fecha_hora DESC, id DESC
            .offset((pagina - 1) * POR_PAGINA)                                  # LIMIT POR_PAGINA
            .limit(POR_PAGINA)                                                  # OFFSET (pagina - 1) * POR_PAGINA;
        )
        avistamientos = session.scalars(stmt).all()
        return render_template("listado.html", avistamientos=avistamientos, pagina=pagina, total_paginas=total_paginas)    


@app.route('/listado/<int:avistamiento_id>')
def detalle(avistamiento_id): # Detalles del avistamiento
    with Session(engine) as session:

        avistamiento = session.scalars(
            select(Avistamiento)                        # SELECT * FROM avistamiento
            .where(Avistamiento.id == avistamiento_id)  # WHERE avistamiento.id = avistamiento_id
        ).first()
        if avistamiento is None:
            abort(404) # No existe el avistamiento, asi que page not found.
        return render_template("detalle.html", avistamiento=avistamiento)

@app.route('/metricas')
def metricas():
    return render_template("metricas.html")

if __name__ == '__main__':
    app.run(debug=True)