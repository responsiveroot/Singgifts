import os
import logging

logger = logging.getLogger(__name__)

EMAIL_ENABLED = os.environ.get('EMAIL_ENABLED', 'false').lower() == 'true'
EMAIL_FROM = os.environ.get('EMAIL_FROM', 'noreply@singgifts.sg')

async def send_order_confirmation_email(user_email, order_id, total_amount, currency):
    """Send order confirmation email"""
    if not EMAIL_ENABLED:
        logger.info(f"[MOCK EMAIL] Order confirmation to {user_email}")
        logger.info(f"  Order ID: {order_id}")
        logger.info(f"  Total: {currency} {total_amount}")
        return True
    
    # TODO: Integrate with SendGrid/Mailgun/SES
    # For now, just log
    logger.info(f"Would send order confirmation email to {user_email}")
    return True

async def send_welcome_email(user_email, user_name):
    """Send welcome email to new users"""
    if not EMAIL_ENABLED:
        logger.info(f"[MOCK EMAIL] Welcome email to {user_email}")
        logger.info(f"  Name: {user_name}")
        return True
    
    logger.info(f"Would send welcome email to {user_email}")
    return True

async def send_shipping_update_email(user_email, order_id, tracking_number):
    """Send shipping update email"""
    if not EMAIL_ENABLED:
        logger.info(f"[MOCK EMAIL] Shipping update to {user_email}")
        logger.info(f"  Order ID: {order_id}")
        logger.info(f"  Tracking: {tracking_number}")
        return True
    
    logger.info(f"Would send shipping update email to {user_email}")
    return True
