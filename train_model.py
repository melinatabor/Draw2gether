import tensorflow as tf
import matplotlib.pyplot as plt
import os
import datetime
import json
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Rescaling, BatchNormalization, Dropout
from tensorflow.keras.preprocessing import image_dataset_from_directory
from tensorflow.keras.callbacks import TensorBoard

# Configuración de los parámetros del dataset
batch_size = 32
img_height = 28
img_width = 28
num_classes = 345

# Cargar los datos
train_ds = image_dataset_from_directory(
    'dataset',
    validation_split=0.2,
    subset="training",
    seed=123,
    image_size=(img_height, img_width),
    batch_size=batch_size,
    color_mode="grayscale",
)

val_ds = image_dataset_from_directory(
    'dataset',
    validation_split=0.2,
    subset="validation",
    seed=123,
    image_size=(img_height, img_width),
    batch_size=batch_size,
    color_mode="grayscale"
)

class_names = train_ds.class_names
with open('static/class_names.json', 'w') as f:
    json.dump(class_names, f)


# Construir el modelo
model = Sequential([
    Rescaling(1./255, input_shape=(img_height, img_width, 1)),
    BatchNormalization(),

    Conv2D(6, kernel_size=(3, 3), padding="same", activation="relu"),
    Conv2D(8, kernel_size=(3, 3), padding="same", activation="relu"),
    Conv2D(10, kernel_size=(3, 3), padding="same", activation="relu"),
    BatchNormalization(),
    MaxPooling2D(pool_size=(2, 2)),

    Flatten(),

    Dense(700, activation="relu"),
    BatchNormalization(),
    Dropout(0.2),

    Dense(500, activation="relu"),
    BatchNormalization(),
    Dropout(0.2),

    Dense(400, activation="relu"),
    Dropout(0.2),

    Dense(num_classes, activation="softmax")
])

# Compilar el modelo
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Entrenar el modelo
epochs = 14
logdir = os.path.join("logs", datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
tensorboard_callback = TensorBoard(logdir, histogram_freq=1)

model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=epochs,
    verbose=1,
    callbacks=[tensorboard_callback]
)

# Guardar el modelo
model_path = './models/model_' + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
model.save(model_path)

converter = tf.lite.TFLiteConverter.from_saved_model(model_path)
tflite_model = converter.convert()

with open('model.tflite', 'wb') as f:
    f.write(tflite_model)

