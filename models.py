import os
from datetime import datetime, timedelta

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


# --- MODELOS DE LA BASE DE DATOS (ORM) ---
class Base(DeclarativeBase):
    pass

class Region(Base):
    __tablename__ = 'region'
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(200))

    # Relaciones
    comunas: Mapped[list['Comuna']] = relationship(back_populates='region') # Una region tiene muchas comunas

class Comuna(Base):
    __tablename__ = 'comuna'
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(200))
    region_id : Mapped[int] = mapped_column(ForeignKey('region.id'))

    # Relaciones
    region : Mapped['Region'] = relationship(back_populates='comunas') # Una comuna esta en una region
    voluntarios: Mapped[list['Voluntario']] = relationship(back_populates='comuna') # Una comuna tiene muchos voluntarios


class Voluntario(Base):
    __tablename__ = 'voluntario'
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(80))
    telefono: Mapped[str] = mapped_column(String(15))
    fecha_registro : Mapped[datetime] = mapped_column()
    comuna_id: Mapped[int] = mapped_column(ForeignKey('comuna.id'))

    # Relaciones
    comuna: Mapped['Comuna'] = relationship(back_populates='voluntarios') # Un voluntario pertenece a una comuna
    avistamientos: Mapped[list['Avistamiento']] = relationship(back_populates='voluntario') # Un voluntario puede tener uno o mas avistamientos

class Ave(Base):
    __tablename__ = 'ave'
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(80))

    # Relaciones
    avistamientos: Mapped[list['Avistamiento']] = relationship(back_populates='ave') # Una ave puede tener uno o mas avistamientos

class Avistamiento(Base):
    __tablename__ = 'avistamiento'
    id: Mapped[int] = mapped_column(primary_key=True)
    voluntario_id: Mapped[int] = mapped_column(ForeignKey('voluntario.id'))
    ave_id: Mapped[int] = mapped_column(ForeignKey('ave.id'))
    fecha_hora: Mapped[datetime] = mapped_column()
    lugar: Mapped[str] = mapped_column(String(200))
    descripcion: Mapped[str | None] = mapped_column(String(500))

    # Relaciones
    voluntario: Mapped['Voluntario'] = relationship(back_populates='avistamientos') # Un avistamiento fue hecho por un voluntario
    registros: Mapped[list['Registro']] = relationship(back_populates='avistamiento') # Un avistamiento puede tener muchos registros
    ave: Mapped['Ave'] = relationship(back_populates='avistamientos') # Un avistamiento vio una ave.


class Registro(Base):
    __tablename__ = 'registro'
    id: Mapped[int] = mapped_column(primary_key=True)
    ruta_archivo: Mapped[str] = mapped_column(String(300))
    nombre_archivo: Mapped[str] = mapped_column(String(300))
    avistamiento_id: Mapped[int] = mapped_column(ForeignKey('avistamiento.id'))

    # Relaciones
    avistamiento : Mapped['Avistamiento'] = relationship(back_populates='registros') # Un registro pertenece a un avistamiento


#--- Consultas ---

def agregar_voluntario(session, nombre, email, telefono, comuna_id):
    voluntario = Voluntario(
        nombre=nombre,
        email=email,
        telefono=telefono.replace(" ", ""),
        fecha_registro=datetime.now(),
        comuna_id=comuna_id,
    )
    try:
        session.add(voluntario)
        session.commit()
        return voluntario.id
    except Exception as e:
        session.rollback()
        return None

def agregar_avistamiento(session, voluntario_id, ave_id, fecha_hora, lugar, descripcion, registros):
    guardados = []
    try:
        avistamiento = Avistamiento(
            voluntario_id=voluntario_id, ave_id=ave_id,
            fecha_hora=fecha_hora, lugar=lugar, descripcion=descripcion or None,
        )
        session.add(avistamiento)
        session.flush()  # asigna avistamiento.id sin cerrar la transacción
        for r in registros:
            r['registro_obj'].save(r['ruta_fisica'])
            guardados.append(r['ruta_fisica'])
            session.add(Registro(
                ruta_archivo=r['ruta_relativa'],
                nombre_archivo=r['nombre_original'],
                avistamiento_id=avistamiento.id,
            ))
        session.commit()
        return avistamiento.id
    except Exception:
        session.rollback()
        for ruta in guardados:
            if os.path.exists(ruta):
                os.remove(ruta)
        return None