from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    pass


class CommentResponse(CommentBase):
    id: str
    post_id: str
    user_id: str
    author_name: str
    upvotes_count: int
    is_accepted: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PostBase(BaseModel):
    title: str
    content: str
    tags: List[str] = []


class PostCreate(PostBase):
    pass


class PostResponse(PostBase):
    id: str
    user_id: str
    author_name: str
    upvotes_count: int
    comments_count: int
    is_resolved: bool
    created_at: datetime
    updated_at: datetime
    comments: List[CommentResponse] = []

    class Config:
        from_attributes = True


class VoteRequest(BaseModel):
    entity_type: str  # post, comment
    entity_id: str
    vote_type: int  # 1 or -1
