import re
import random
import string

def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    return text

def generate_sku() -> str:
    """Generate random SKU"""
    return 'SG-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def generate_otp() -> str:
    """Generate 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))