from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.api.deps import SessionDep, CurrentUser
from app.models.review import Review
from app.models.user import User
from app.models.property import Property
from app.schemas.review import ReviewCreate, ReviewRead

router = APIRouter()

def obfuscate_email(email: str) -> str:
    if not email or "@" not in email:
        return "***"
    username, domain = email.split("@", 1)
    if len(username) <= 2:
        masked_user = username[0] + "***"
    else:
        masked_user = username[0] + "***" + username[-1]
    return f"{masked_user}@{domain}"

@router.post("/", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
async def create_review(
    session: SessionDep,
    current_user: CurrentUser,
    review_in: ReviewCreate,
) -> ReviewRead:
    """
    Crea una nueva calificación/review para un usuario (Inquilino a Dueño o Dueño a Inquilino).
    Requiere autenticación.
    """
    # 1. No se puede calificar a uno mismo
    if current_user.id == review_in.reviewed_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes calificarte a ti mismo.",
        )

    # 2. Verificar que el usuario calificado exista
    target_user = await session.scalar(select(User).where(User.id == review_in.reviewed_id))
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario a calificar no existe.",
        )

    # 3. Si se especifica una propiedad, verificar que exista
    if review_in.property_id is not None:
        target_property = await session.scalar(
            select(Property).where(Property.id == review_in.property_id)
        )
        if not target_property:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="La propiedad especificada no existe.",
            )

    # 4. Crear la review
    db_review = Review(
        reviewer_id=current_user.id,
        reviewed_id=review_in.reviewed_id,
        property_id=review_in.property_id,
        rating=review_in.rating,
        comment=review_in.comment,
    )
    session.add(db_review)
    await session.flush()

    # 5. Actualizar el promedio del usuario calificado
    avg_rating = await session.scalar(
        select(func.coalesce(func.avg(Review.rating), 0.0)).where(
            Review.reviewed_id == review_in.reviewed_id
        )
    )
    target_user.rating_average = round(float(avg_rating), 1) if avg_rating is not None else 0.0

    await session.commit()
    await session.refresh(db_review)

    return ReviewRead(
        id=db_review.id,
        reviewer_id=db_review.reviewer_id,
        reviewer_email=obfuscate_email(current_user.email),
        reviewed_id=db_review.reviewed_id,
        property_id=db_review.property_id,
        rating=db_review.rating,
        comment=db_review.comment,
        created_at=db_review.created_at,
    )

@router.get("/user/{user_id}", response_model=List[ReviewRead])
async def get_user_reviews(
    session: SessionDep,
    user_id: int,
    limit: int = 20,
) -> List[ReviewRead]:
    """
    Obtiene las reviews recibidas por un usuario.
    """
    stmt = (
        select(Review)
        .options(selectinload(Review.reviewer))
        .where(Review.reviewed_id == user_id)
        .order_by(Review.created_at.desc())
        .limit(limit)
    )
    result = await session.execute(stmt)
    reviews = result.scalars().all()

    return [
        ReviewRead(
            id=r.id,
            reviewer_id=r.reviewer_id,
            reviewer_email=obfuscate_email(r.reviewer.email) if r.reviewer else None,
            reviewed_id=r.reviewed_id,
            property_id=r.property_id,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
        )
        for r in reviews
    ]
