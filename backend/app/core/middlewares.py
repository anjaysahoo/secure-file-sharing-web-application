from fastapi import Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


def add_cors_middleware(app) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors.origins,
        allow_credentials=settings.cors.allow_credentials,
        allow_methods=settings.cors.allow_methods,
        allow_headers=settings.cors.allow_headers,
    )


async def log_file_operations(request: Request, call_next) -> Response:
    response = await call_next(request)

    if hasattr(request.state, 'credentials') and hasattr(request.state, 'file_name'):
        action = "upload" if request.url.path.startswith("/files/upload") else "download"
        username = request.state.credentials.subject["username"]
        file_name = request.state.file_name
        logger = settings.logger.setup()
        logger.info("", extra={"action": action, "username": username, "file_name": file_name})

    return response
