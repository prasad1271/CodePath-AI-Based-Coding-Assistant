from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import generate_uuid


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    tags = Column(JSON, default=list)
    upvotes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    comments = relationship("CommunityComment", back_populates="post", cascade="all, delete-orphan", order_by="CommunityComment.created_at")


class CommunityComment(Base):
    __tablename__ = "community_comments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    post_id = Column(String(36), ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    upvotes_count = Column(Integer, default=0)
    is_accepted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    post = relationship("CommunityPost", back_populates="comments")


class CommunityVote(Base):
    __tablename__ = "community_votes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    entity_type = Column(String(50), nullable=False)  # post, comment
    entity_id = Column(String(36), nullable=False)
    vote_type = Column(Integer, nullable=False)  # 1 (upvote), -1 (downvote)
    created_at = Column(DateTime, default=datetime.utcnow)
