from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class RefreshRequest(BaseModel):
    refresh_token: str


class UserPublic(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    plan: str
    is_admin: bool = False


class LoginData(BaseModel):
    access_token: str
    refresh_token: str
    user: UserPublic


class LoginResponse(BaseModel):
    success: bool = True
    data: LoginData


class RegisterResponse(BaseModel):
    success: bool = True
    message: str = "Account created"


class RefreshResponse(BaseModel):
    access_token: str


class LogoutResponse(BaseModel):
    success: bool = True


class MeResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    plan: str
    is_admin: bool = False
