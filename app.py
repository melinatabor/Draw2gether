from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from PIL import Image, ImageDraw
from uuid import uuid4
from pathlib import Path
from quickdraw import QuickDrawDataGroup
import os
import generate_data

class ImageData(BaseModel):
    strokes: list
    box: list

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.post("/transform")
async def transform(image_data: ImageData, background_tasks: BackgroundTasks):
    images_dir = "./images"
    os.makedirs(images_dir, exist_ok=True)

    filepath = f"{images_dir}/{str(uuid4())}.png"
    img = transform_img(image_data.strokes, image_data.box)
    img.save(filepath)

    background_tasks.add_task(os.remove, filepath)

    return FileResponse(filepath)


def transform_img(strokes, box):
    width, height = box[2] - box[0], box[3] - box[1]
    image = Image.new("RGB", (width, height), color=(255, 255, 255))
    image_draw = ImageDraw.Draw(image)

    for stroke in strokes:
        positions = [(stroke[0][i], stroke[1][i]) for i in range(len(stroke[0]))]
        image_draw.line(positions, fill=(0, 0, 0), width=3)

    return image.resize(size=(28, 28))

@app.get("/generate/{label}")
async def generate_route(label: str):
    try:
        generate_data.generate_class_images(label, max_drawings=1200, recognized=True)
        return JSONResponse(content={"message": f"Imagenes generadas para {label}"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))