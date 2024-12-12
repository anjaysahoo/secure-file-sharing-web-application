import uvicorn
from fastapi import FastAPI

from app.core.config import settings
from app.core.middlewares import log_file_operations, add_cors_middleware
from app.routes.file import router as file_router
from app.routes.user import router as user_router

app = FastAPI()

app.include_router(user_router)
app.include_router(file_router)

add_cors_middleware(app)
app.middleware("http")(log_file_operations)

# if __name__ == "__main__":
#     uvicorn.run(
#         "main:app",
#         host=settings.run.host,
#         port=settings.run.port,
#         reload=True,
#     )
