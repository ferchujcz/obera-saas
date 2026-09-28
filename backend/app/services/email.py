import logging
from email.message import EmailMessage
import aiosmtplib

from app.core.config import settings

logger = logging.getLogger(__name__)

async def send_match_notification(email_to: str, property_title: str) -> None:
    """
    Envía una notificación por correo electrónico a un inquilino cuando una nueva propiedad
    coincide con sus alertas guardadas.
    """
    subject = f"¡Alerta de propiedad! Nuevo inmueble: {property_title}"

    # Construcción del correo MIME
    message = EmailMessage()
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = email_to
    message["Subject"] = subject

    body_plain = (
        f"Hola,\n\n"
        f"Hemos encontrado una nueva propiedad que coincide con tus criterios de búsqueda en Oberá:\n"
        f"'{property_title}'\n\n"
        f"Ingresa a la plataforma para ver más fotos, detalles y contactar al propietario.\n\n"
        f"Saludos,\nEquipo de SaaS Inmobiliario Oberá"
    )

    body_html = f"""
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>{subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #2563eb; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px;">SaaS Inmobiliario Oberá</h1>
          </div>
          <div style="padding: 24px;">
            <h2 style="color: #1e293b; margin-top: 0; font-size: 18px;">¡Nueva propiedad coincidente con tu alerta!</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.5;">
              Hola, un propietario acaba de publicar un inmueble que coincide con tus preferencias guardadas:
            </p>
            <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #1e293b;">{property_title}</p>
            </div>
            <p style="color: #475569; font-size: 15px; line-height: 1.5;">
              Accede a la plataforma para ver las fotos completas y comunicarte directamente con el dueño antes de que sea reservado.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8; margin: 0; text-align: center;">
              Recibes este email porque activaste una alerta de búsqueda en SaaS Inmobiliario Oberá.
            </p>
          </div>
        </div>
      </body>
    </html>
    """

    message.set_content(body_plain)
    message.add_alternative(body_html, subtype="html")

    # Si no se configuraron credenciales SMTP, se simula el envío (útil para desarrollo/MVP)
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning(
            f"[SMTP SIMULADO] Email enviado a '{email_to}' para la propiedad '{property_title}'. "
            f"(Para envíos reales configura SMTP_USER y SMTP_PASSWORD en .env)"
        )
        return

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=settings.SMTP_TLS,
        )
        logger.info(f"[SMTP REAL] Correo enviado exitosamente a {email_to}")
    except Exception as exc:
        logger.error(f"[SMTP ERROR] Falló el envío de correo a {email_to}: {exc}")
