from typing import Any, List, Optional, Annotated
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy import select

from app.api.deps import SessionDep, get_current_active_owner
from app.models.property import Property, PropertyImage
from app.models.user import User
from app.models.subscription import Subscription
from app.schemas.property import PropertyCreate, PropertyRead, PropertyImageCreate, PropertyImageRead
from app.services.matcher import check_property_matches

router = APIRouter()

async def get_owned_property(
    id: int,
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_active_owner)],
) -> Property:
    """
    Inyección de dependencia para verificar que el usuario actual tenga rol OWNER
    y sea el dueño legítimo de la propiedad especificada.
    """
    property = await session.get(Property, id)
    if not property:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    if property.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to modify this property",
        )
    return property

@router.post("/", response_model=PropertyRead)
async def create_property(
    *,
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_active_owner)],
    property_in: PropertyCreate,
    background_tasks: BackgroundTasks,
) -> Any:
    """
    Create new property.
    """
    stmt = select(Subscription).where(
        Subscription.user_id == current_user.id,
        Subscription.is_active == True,
        Subscription.end_date > datetime.now(timezone.utc)
    )
    db_sub = await session.scalar(stmt)
    if not db_sub:
        raise HTTPException(status_code=403, detail="The owner doesn't have an active subscription")

    db_property = Property(**property_in.model_dump(), owner_id=current_user.id)
    session.add(db_property)
    await session.commit()
    await session.refresh(db_property)
    
    await check_property_matches(db_property, session, background_tasks)
    
    return db_property

@router.post("/{id}/images", response_model=PropertyImageRead, status_code=status.HTTP_201_CREATED)
async def add_property_image(
    *,
    session: SessionDep,
    property: Annotated[Property, Depends(get_owned_property)],
    image_in: PropertyImageCreate,
) -> Any:
    """
    Add image URL to a property.
    Verifica mediante la dependencia get_owned_property que el usuario sea el OWNER
    y dueño legítimo de la propiedad.
    """
    db_image = PropertyImage(
        property_id=property.id,
        image_url=image_in.image_url,
    )
    session.add(db_image)
    await session.commit()
    await session.refresh(db_image)
    return db_image

@router.get("/", response_model=List[PropertyRead])
async def read_properties(
    session: SessionDep,
    property_type: Optional[str] = None,
    neighborhood: Optional[str] = None,
    min_bedrooms: Optional[int] = None,
    max_price: Optional[float] = None,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve properties with dynamic filters. Publicly accessible.
    """
    query = select(Property)

    if property_type and property_type.strip():
        query = query.where(Property.property_type.ilike(f"%{property_type.strip()}%"))
    if neighborhood and neighborhood.strip():
        query = query.where(Property.neighborhood.ilike(f"%{neighborhood.strip()}%"))
    if min_bedrooms is not None:
        query = query.where(Property.bedrooms >= min_bedrooms)
    if max_price is not None:
        query = query.where(Property.price <= max_price)

    query = query.order_by(Property.created_at.desc()).offset(skip).limit(limit)
    result = await session.scalars(query)
    return result.all()

@router.get("/{id}", response_model=PropertyRead)
async def read_property(
    *,
    session: SessionDep,
    id: int,
) -> Any:
    """
    Get property by ID. Publicly accessible.
    """
    property = await session.get(Property, id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property

