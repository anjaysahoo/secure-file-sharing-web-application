from pydantic import BaseModel, ConfigDict


class FileResponseBaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    filepath: str


class FileResponseUserSchema(FileResponseBaseSchema):
    pass


class FileResponseAdminSchema(FileResponseBaseSchema):
    owner_username: str
    download_count: int
