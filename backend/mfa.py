import pyotp
import qrcode
import io
import base64

def generate_totp_secret() -> str:
    """Create a new base32 secret for TOTP authentication."""
    return pyotp.random_base32()

def get_totp_uri(secret: str, username: str, issuer_name: str = "PathoAI") -> str:
    """Generate the otpauth URI used by authenticator apps.
    Example: otpauth://totp/PathoAI:alice@example.com?secret=ABCDEF&issuer=PathoAI
    """
    return pyotp.totp.TOTP(secret).provisioning_uri(name=username, issuer_name=issuer_name)

def generate_qr_code_data_uri(uri: str) -> str:
    """Create a PNG QR code image for the given URI and return it as a data URI string."""
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M)
    qr.add_data(uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    base64_png = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{base64_png}"

def totp_from_secret(secret: str) -> pyotp.TOTP:
    return pyotp.TOTP(secret)

