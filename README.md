![Inicio](https://github.com/user-attachments/assets/145257e5-354d-4a3d-a73a-a061d9ffdcfc)

# 🎮  Draw2gether
Draw2gether es un juego interactivo donde los usuarios dibujan objetos y una inteligencia artificial intenta adivinarlos. El proyecto utiliza **TensorFlow**, **FastAPI** y **p5.js**, proporcionando una experiencia educativa que enseña tanto el reconocimiento de imágenes como la interacción con modelos de IA. El backend maneja la generación de datos, el procesamiento de imágenes y el entrenamiento de un modelo de deep learning.

## Índice
- [Instalación](#instalación)
- [Uso](#uso)
- [Características](#características)
- [Backend](#backend)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Contribuciones](#contribuciones)

## 🖥️ Instalación

1. Clona el repositorio a tu máquina local:
   ```zsh
   git clone https://github.com/melinatabor/Draw2gether.git
   ```
2. Crea un entorno virtual en la carpeta del proyecto:
    ```zsh
    cd Draw2gether
    python -m venv env
    ```
3. Activa el entorno virtual:
    - En Linux/MacOS:
        ```zsh
        source env/bin/activate
        ```
    - En Windows:
        ```zsh
        env\Scripts\activate
        ```
4. Instala las dependencias:
    ```zsh
    pip install fastapi uvicorn tensorflow pillow quickdraw
    ```
5. Inicia el servidor FastAPI en el servidor de tu puerto html:
    ```zsh
    uvicorn app:app --reload --port 5500
    ```
6. Abre tu navegador y ve a http://localhost:8080/index.html para comenzar a jugar :)

## Uso
1. Al abrir el juego, selecciona el botón "Jugar" en la pantalla de inicio.
2. El juego te dará una palabra al azar que debes intentar dibujar en el área de dibujo.
3. El temporizador te dará 15 segundos para completar tu dibujo.
4. Haz clic en el botón ¡LISTO! para que la IA intente adivinar lo que has dibujado.
5. La IA mostrará si acertaste o si necesitas intentarlo de nuevo.

## 🚀 Características
- __Reconocimiento de dibujos__: El juego utiliza un modelo de TensorFlow Lite para adivinar los objetos dibujados por el jugador.
- __Generación de datos__: El backend genera imágenes de entrenamiento utilizando la API de QuickDraw para clases específicas.
- __Entrenamiento de IA__: Un modelo de reconocimiento de imágenes se entrena con imágenes de QuickDraw y se exporta en formato TensorFlow Lite.
- __Temporizador__: Los usuarios tienen 15 segundos para completar su dibujo.
- __Juego dinámico__: Las palabras cambian en cada ronda para una experiencia única.
- __Feedback inmediato__: El sistema proporciona resultados instantáneos tras cada intento.

## Backend
El backend de IA Draw está desarrollado utilizando FastAPI. Sus principales funciones son:

__1. Transformación de imágenes:__
    La API recibe los trazos dibujados por el usuario y genera una imagen a partir de ellos.
    Las imágenes generadas se envían de vuelta al frontend para su procesamiento y se eliminan automáticamente tras ser enviadas.

__2. Generación de datasets:__
    Utilizando la librería QuickDraw, el backend permite generar imágenes de clases específicas (como "gato" o "perro") que se utilizan para entrenar el modelo de IA.

__3. Entrenamiento del modelo:__
    El backend entrena un modelo de reconocimiento de dibujos usando imágenes de QuickDraw y TensorFlow. El modelo entrenado se guarda en formato .tflite, listo para su uso en el frontend.

__4. Modelo de reconocimiento:__
    El modelo de TensorFlow Lite se entrena utilizando una red neuronal convolucional. Una vez entrenado, el modelo se utiliza para hacer predicciones sobre los dibujos realizados por el jugador.

## 📂 Estructura del Proyecto

La estructura del proyecto se organiza de la siguiente manera:

- `index.html`: Página de inicio del juego donde se introduce al usuario a IA Draw.
- `pizarra.html`: Página principal del juego donde el usuario interactúa con el área de dibujo y la IA.
- `sketch.js`: Contiene la lógica principal del juego, incluyendo la configuración del canvas, el manejo de eventos de dibujo y las predicciones realizadas por la IA.
- `main.py`: Archivo principal del backend implementado con FastAPI, maneja las rutas para procesar imágenes y generar datasets.
- `class_names.json`: Archivo JSON que contiene las etiquetas de las clases que el modelo de IA reconoce y utiliza para hacer predicciones.
- `models/`: Carpeta que contiene el modelo de TensorFlow Lite entrenado para el reconocimiento de dibujos.
- `dataset/`: Carpeta donde se almacenan las imágenes generadas por QuickDraw para entrenar el modelo.
- `libs/`: Librerías externas utilizadas en el proyecto como p5.js, TensorFlow y otras.
- `static/`: Directorio que contiene archivos estáticos como imágenes, scripts y estilos CSS.

Cada archivo y directorio tiene un propósito específico para garantizar que el frontend y el backend interactúen de manera eficiente y sin problemas.

## Tecnologías Utilizadas

- **[p5.js](https://p5js.org/)**: Biblioteca de JavaScript para crear gráficos interactivos y visualizaciones en la web.
- **[TensorFlow.js](https://www.tensorflow.org/js)**: Framework para ejecutar modelos de machine learning directamente en el navegador.
- **[FastAPI](https://fastapi.tiangolo.com/)**: Framework web moderno y de alto rendimiento para construir APIs utilizando Python.
- **[QuickDraw](https://quickdraw.withgoogle.com/data)**: API y conjunto de datos de dibujos a mano alzada generados por usuarios de todo el mundo. Utilizado para generar imágenes de entrenamiento.
- **[Bootstrap](https://getbootstrap.com/)**: Framework CSS popular para construir sitios web responsivos y móviles.

## Contribuciones

¡Las contribuciones son bienvenidas! Si deseas colaborar con Draw2gether, sigue estos pasos:

1. Realiza un fork del repositorio.
2. Crea una nueva rama para tu característica o corrección (`git checkout -b feature/nueva-caracteristica`).
3. Haz commit de tus cambios (`git commit -m 'Descripción de los cambios'`).
4. Sube tu rama a GitHub (`git push origin feature/nueva-caracteristica`).
5. Abre un **Pull Request** para revisar tus cambios.

Me encantaría recibir tus aportes, ya sea mejorando el código, resolviendo errores o añadiendo nuevas funcionalidades.
