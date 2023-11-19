from sqlalchemy import Column, Integer, String, DateTime
import datetime

from .database import Base


class PromptResponsePair(Base):
    __tablename__ = "PromptResponsePair"
    id = Column(Integer, primary_key=True, index=True)
    prompt = Column(String)
    response = Column(String)
    date = DateTime(default=datetime.datetime.utcnow)
