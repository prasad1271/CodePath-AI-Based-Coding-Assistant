from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.community import CommunityPost, CommunityComment, CommunityVote
from app.schemas.community import PostCreate, PostResponse, CommentCreate, CommentResponse, VoteRequest
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/community", tags=["Community Forum"])


@router.get("/posts", response_model=ApiResponse[List[PostResponse]])
def get_posts(db: Session = Depends(get_db)):
    posts = db.query(CommunityPost).order_by(CommunityPost.created_at.desc()).limit(50).all()
    results = []
    for p in posts:
        author = db.query(User).filter(User.id == p.user_id).first()
        author_name = author.full_name if author else "Student"
        comments_res = []
        for c in p.comments:
            c_author = db.query(User).filter(User.id == c.user_id).first()
            comments_res.append(
                CommentResponse(
                    id=c.id,
                    post_id=c.post_id,
                    user_id=c.user_id,
                    author_name=c_author.full_name if c_author else "Peer",
                    content=c.content,
                    upvotes_count=c.upvotes_count,
                    is_accepted=c.is_accepted,
                    created_at=c.created_at
                )
            )
        results.append(
            PostResponse(
                id=p.id,
                user_id=p.user_id,
                author_name=author_name,
                title=p.title,
                content=p.content,
                tags=p.tags or [],
                upvotes_count=p.upvotes_count,
                comments_count=len(p.comments),
                is_resolved=p.is_resolved,
                created_at=p.created_at,
                updated_at=p.updated_at,
                comments=comments_res
            )
        )
    return ApiResponse(success=True, data=results)


@router.post("/posts", response_model=ApiResponse[PostResponse])
def create_post(
    payload: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = CommunityPost(
        user_id=current_user.id,
        title=payload.title,
        content=payload.content,
        tags=payload.tags or ["general"]
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    return ApiResponse(
        success=True,
        data=PostResponse(
            id=post.id,
            user_id=post.user_id,
            author_name=current_user.full_name,
            title=post.title,
            content=post.content,
            tags=post.tags or [],
            upvotes_count=0,
            comments_count=0,
            is_resolved=False,
            created_at=post.created_at,
            updated_at=post.updated_at,
            comments=[]
        )
    )


@router.delete("/posts/{post_id}", response_model=ApiResponse[dict])
def delete_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail={"code": "POST_NOT_FOUND", "message": "Post not found."})

    if post.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail={"code": "UNAUTHORIZED", "message": "Not authorized to delete this post."})

    db.delete(post)
    db.commit()
    return ApiResponse(success=True, data={"message": "Post successfully removed."})


@router.post("/posts/{post_id}/comments", response_model=ApiResponse[CommentResponse])
def add_comment(
    post_id: str,
    payload: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail={"code": "POST_NOT_FOUND", "message": "Post not found."})

    comment = CommunityComment(
        post_id=post.id,
        user_id=current_user.id,
        content=payload.content
    )
    db.add(comment)
    post.comments_count += 1
    db.commit()
    db.refresh(comment)

    return ApiResponse(
        success=True,
        data=CommentResponse(
            id=comment.id,
            post_id=comment.post_id,
            user_id=comment.user_id,
            author_name=current_user.full_name,
            content=comment.content,
            upvotes_count=0,
            is_accepted=False,
            created_at=comment.created_at
        )
    )


@router.post("/vote", response_model=ApiResponse[dict])
def vote_entity(
    payload: VoteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.entity_type == "post":
        post = db.query(CommunityPost).filter(CommunityPost.id == payload.entity_id).first()
        if post:
            post.upvotes_count += payload.vote_type
            db.commit()
            return ApiResponse(success=True, data={"upvotes": post.upvotes_count})
    elif payload.entity_type == "comment":
        comment = db.query(CommunityComment).filter(CommunityComment.id == payload.entity_id).first()
        if comment:
            comment.upvotes_count += payload.vote_type
            db.commit()
            return ApiResponse(success=True, data={"upvotes": comment.upvotes_count})

    return ApiResponse(success=True, data={"status": "vote recorded"})
