from datetime import timedelta, datetime, timezone
from typing import Annotated, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from passlib.context import CryptContext
from jose import jwt

from app.core.config import settings
from app.models.user import User
from app.models.property import Property, PropertyStatusEnum
from app.models.review import Review
from app.schemas.user import UserCreate, UserRead, PublicUserProfile, PublicReviewItem
from app.schemas.token import Token
from app.api.deps import SessionDep

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(subject: str | Any, expires_delta: timedelta) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

@router.post("/login", response_model=Token)
async def login_access_token(
    session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = await session.scalar(select(User).where(User.email == form_data.username))
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        token_type="bearer",
    )

@router.post("/register", response_model=UserRead)
async def register_user(session: SessionDep, user_in: UserCreate) -> Any:
    """
    Create new user.
    """
    user = await session.scalar(select(User).where(User.email == user_in.email))
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    db_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        is_active=user_in.is_active,
    )
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    return db_user

def obfuscate_email(email: str) -> str:
    if not email or "@" not in email:
        return "***"
    username, domain = email.split("@", 1)
    if len(username) <= 2:
        masked_user = username[0] + "***"
    else:
        masked_user = username[0] + "***" + username[-1]
    return f"{masked_user}@{domain}"

@router.get("/profile/{user_id}", response_model=PublicUserProfile)
async def get_public_profile(session: SessionDep, user_id: int) -> PublicUserProfile:
    """
    Perfil público de un usuario (Dueño o Inquilino).
    Retorna información básica con email ofuscado, rol, fecha de registro, puntaje promedio,
    últimas reviews recibidas y propiedades activas con status=AVAILABLE.
    """
    user = await session.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    # 1. Obtener propiedades activas del usuario (status=AVAILABLE)
    properties_stmt = (
        select(Property)
        .options(selectinload(Property.images))
        .where(
            Property.owner_id == user_id,
            Property.status == PropertyStatusEnum.AVAILABLE,
        )
        .order_by(Property.created_at.desc())
    )
    prop_result = await session.execute(properties_stmt)
    properties = prop_result.scalars().all()

    # 2. Obtener últimas reviews recibidas
    reviews_stmt = (
        select(Review)
        .options(selectinload(Review.reviewer))
        .where(Review.reviewed_id == user_id)
        .order_by(Review.created_at.desc())
        .limit(10)
    )
    rev_result = await session.execute(reviews_stmt)
    reviews = rev_result.scalars().all()

    # 3. Calcular promedio y cantidad de reviews
    rating_data = await session.execute(
        select(
            func.coalesce(func.avg(Review.rating), 0.0),
            func.count(Review.id),
        ).where(Review.reviewed_id == user_id)
    )
    rating_avg, reviews_count = rating_data.one()

    return PublicUserProfile(
        id=user.id,
        email=obfuscate_email(user.email),
        role=user.role,
        created_at=user.created_at,
        rating_average=round(float(rating_avg), 1),
        reviews_count=reviews_count,
        reviews=[
            PublicReviewItem(
                id=r.id,
                reviewer_id=r.reviewer_id,
                reviewer_email=obfuscate_email(r.reviewer.email) if r.reviewer else None,
                property_id=r.property_id,
                rating=r.rating,
                comment=r.comment,
                created_at=r.created_at,
            )
            for r in reviews
        ],
        properties=properties,
    )

