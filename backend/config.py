import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 72
cors_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,*")
CORS_ORIGINS = [origin.strip() for origin in cors_env.split(",") if origin.strip()]
