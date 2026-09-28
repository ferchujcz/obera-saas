import logging
from typing import Optional
from fastapi import BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.property import Property
from app.models.alert import Alert
from app.services.email import send_match_notification

logger = logging.getLogger(__name__)

async def check_property_matches(
    property: Property,
    session: AsyncSession,
    background_tasks: Optional[BackgroundTasks] = None,
) -> None:
    """
    Verifica si una nueva propiedad coincide con alertas activas.
    Cuando hay coincidencia, obtiene el email del inquilino y encola
    la notificación por correo mediante BackgroundTasks.
    """
    stmt = (
        select(Alert)
        .options(selectinload(Alert.tenant))
        .where(
            Alert.is_active == True,
            Alert.neighborhood == property.neighborhood,
            Alert.max_price >= property.price,
            Alert.min_bedrooms <= property.bedrooms,
        )
    )
    result = await session.scalars(stmt)
    alerts = result.all()

    for alert in alerts:
        tenant_email = alert.tenant.email if alert.tenant else None
        logger.warning(
            f"MATCH ENCONTRADO: Propiedad {property.id} ('{property.title}') coincide con Alerta {alert.id} "
            f"para Inquilino {alert.tenant_id} (email: {tenant_email})"
        )

        if tenant_email:
            if background_tasks is not None:
                background_tasks.add_task(
                    send_match_notification,
                    email_to=tenant_email,
                    property_title=property.title,
                )
                logger.info(f"Notificación encolada en BackgroundTasks para {tenant_email}")
            else:
                # Fallback directo si no se pasó background_tasks
                await send_match_notification(email_to=tenant_email, property_title=property.title)

