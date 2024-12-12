from typing import List

from fastapi import (
    APIRouter,
    UploadFile,
    HTTPException,
    Depends,
    Security,
    status,
    Request
)
from fastapi.responses import FileResponse
from fastapi_jwt import JwtAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import db_helper
from app.crud.file import (
    create_file_in_db,
    get_files,
    get_accessible_files_for_user,
    delete_file_from_db, get_file_by_id,
)
from app.crud.user import get_user_by_username
from app.schemas.file import FileResponseUserSchema, FileResponseAdminSchema
from app.utils.auth import access_security
from app.utils.files import (
    file_storage_location,
    create_unique_filename,
    save_file_to_storage,
    check_user_access
)
from app.utils.users import is_admin_user, get_username_from_credentials

router = APIRouter(prefix="/files", tags=["Files"])


@router.get("/", response_model=List[FileResponseUserSchema] | List[FileResponseAdminSchema])
async def get_all_files(
        credentials: JwtAuthorizationCredentials = Security(access_security),
        session: AsyncSession = Depends(db_helper.get_async_session)
):
    is_admin = credentials.subject["is_admin"]
    user_username = credentials.subject["username"]

    if is_admin:
        files = await get_files(session=session)
        return [FileResponseAdminSchema.model_validate(file) for file in files]

    accessible_files = await get_accessible_files_for_user(session, user_username)
    return [FileResponseUserSchema.model_validate(file) for file in accessible_files]


@router.post("/upload/", status_code=status.HTTP_201_CREATED)
async def upload_file(
        request: Request,
        file: UploadFile,
        credentials: JwtAuthorizationCredentials = Depends(is_admin_user),
        session: AsyncSession = Depends(db_helper.get_async_session),
):
    unique_filename = create_unique_filename(file.filename)
    location_in_storage = file_storage_location(filename=unique_filename)
    await save_file_to_storage(file=file, location=location_in_storage)

    await create_file_in_db(
        session=session,
        filename=file.filename,
        filepath=str(location_in_storage),
        owner_username=get_username_from_credentials(credentials)
    )

    request.state.credentials = credentials
    request.state.file_name = file.filename

    return {"message": f"File '{file.filename}' has been uploaded successfully as '{unique_filename}'."}


@router.get("/download/{file_id}")
async def download_file(
        request: Request,
        file_id: int,
        credentials: JwtAuthorizationCredentials = Security(access_security),
        session: AsyncSession = Depends(db_helper.get_async_session),
):
    user = await get_user_by_username(session, credentials.subject["username"])
    file = await get_file_by_id(session=session, file_id=file_id)

    if file is None:
        raise HTTPException(status_code=404, detail="File not found")

    if not credentials.subject["is_admin"]:
        await check_user_access(session=session, username=str(user.username), file_id=file_id)

    file.download_count += 1
    user.download_count += 1
    await session.commit()

    request.state.credentials = credentials
    request.state.file_name = file.filename

    return FileResponse(file.filepath, media_type='application/octet-stream', filename=file.filename)


@router.delete("/delete/{file_id}", status_code=status.HTTP_200_OK)
async def delete_file(
        file_id: int,
        credentials: JwtAuthorizationCredentials = Depends(is_admin_user),
        session: AsyncSession = Depends(db_helper.get_async_session),
):
    try:
        file = await delete_file_from_db(session=session, file_id=file_id)
        if not file:
            raise HTTPException(status_code=404, detail="File not found in the database.")
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"File not found in storage: {str(e)}")

    return {"message": f"File '{file.filename}' has been deleted successfully."}
