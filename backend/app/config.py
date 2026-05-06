from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://user:pass@localhost/dclaw_water"
    debug: bool = False

    class Config:
        env_prefix = "DCLAW_WATER_"

settings = Settings()
