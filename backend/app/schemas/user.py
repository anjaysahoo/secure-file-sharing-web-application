from pydantic import BaseModel, Field

from app.utils.users import AccessAction


class UserBaseSchema(BaseModel):
    username: str = Field(min_length=3)


class UserResponseSchema(UserBaseSchema):
    is_admin: bool


class UserStatisticsSchema(UserBaseSchema):
    is_admin: bool
    download_count: int


class GrantFileAccessRequest(UserBaseSchema):
    file_id: int
    action: AccessAction


class GrantAdminRequest(UserBaseSchema):
    username: str
