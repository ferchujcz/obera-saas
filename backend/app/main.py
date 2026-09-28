from fastapi import FastAPI, APIRouter
from app.api import auth, properties, subscriptions, alerts, reviews
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="MVP SaaS Inmobiliario Oberá")

# Configuración CORS para el Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Modificar en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "API SaaS Inmobiliario Online"}

api_router = APIRouter()
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(properties.router, prefix="/properties", tags=["properties"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])

app.include_router(api_router, prefix="/api/v1")
