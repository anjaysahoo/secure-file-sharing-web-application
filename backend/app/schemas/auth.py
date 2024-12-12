from pydantic import BaseModel


class AuthBaseSchema(BaseModel):
    username: str


class LoginSchema(AuthBaseSchema):
    password: str


class RegisterSchema(AuthBaseSchema):
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginResponse(TokenResponse):
    username: str
    is_admin: bool = False
