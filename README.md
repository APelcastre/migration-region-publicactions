# API de Regiones y Países

Este proyecto ejecuta las funciones para almacenar las regiones con paises estados y municipios.

## Descripción

Esta aplicación permite:
- Conectar a una base de datos MongoDB.
- Leer archivos JSON que contienen información de países y regiones.
- Filtrar y procesar la información para solo almacenar las regiones con nombres válidos.
- Proporcionar una API para obtener las regiones almacenadas.

## Requisitos

Antes de ejecutar la aplicación, asegúrate de tener instalados los siguientes requisitos:
- [Node.js](https://nodejs.org/) (v14 o superior).
- [MongoDB](https://www.mongodb.com/) (puedes usar [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) para una base de datos en la nube).

## Instalación

Sigue estos pasos para instalar y configurar la aplicación en tu entorno local:

### 1. Clona el repositorio:


### 1.1 Comandos

Ejecuta npm install

### 2. configura archivo .env:

MONGO_URI=mongodb://localhost:27017/nombre-de-tu-base-de-datos
PATHCOUNTRIES=C:/Projects/countries.json
PATHSTATES=C:/Projects/states.json
PATHCITIES=C:/Projects/cities.json

### 3. Ejecutar archivo .bat
Una vez configurado el projecto con las dependencias necesarias, ve a la carpeta del projecto y ejecuta el archivo run.bat dando doble click. 
Esto desencadena la ejecución de la función para generar los documentos y guardarlos en MongoDB.