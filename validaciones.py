
# Validación que un nombre sea valido (misma que en registro.js)
def esNombreValido(nombre):
    permitidos = set("abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMNÑOPQRSTUVWXYZáéíóúÁÉÍÓÚüÜ ")
    for char in nombre:
        if char not in permitidos:
            return False
    return True

# Validación que un numero sea valido (misma que en registro.js)
def esNumerovalido(numero):
    numero = numero.replace(" ", "")
    permitidos = set("0123456789")

    if len(numero) < 9 or len(numero) > 12:  # Un número chileno con menos de 9 dígitos es inválido
        return False

    inicio_necesario = 0  # Asumimos que empieza sin +
    if numero[0] == "+":  # Si el usuario escribió el prefijo +
        if numero[1] == "5" and numero[2] == "6":  # Debe colocar también 56 para el número chileno
            inicio_necesario = 3  # Empezamos a contar desde el índice 3
        else:
            return False

    for i in range(inicio_necesario, len(numero)):  # Iteramos cada caracter
        if numero[i] not in permitidos:  # Si no es un dígito, retornamos False
            return False

    return True