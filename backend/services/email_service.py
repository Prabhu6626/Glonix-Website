import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import os
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@glonix.in")
        
    def send_email(
        self,
        to_emails: List[str],
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        attachments: Optional[List[str]] = None
    ) -> bool:
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = ', '.join(to_emails)
            msg['Subject'] = subject
            
            # Add text part
            text_part = MIMEText(body, 'plain')
            msg.attach(text_part)
            
            # Add HTML part if provided
            if html_body:
                html_part = MIMEText(html_body, 'html')
                msg.attach(html_part)
            
            # Add attachments if provided
            if attachments:
                for file_path in attachments:
                    if os.path.isfile(file_path):
                        with open(file_path, "rb") as attachment:
                            part = MIMEBase('application', 'octet-stream')
                            part.set_payload(attachment.read())
                        
                        encoders.encode_base64(part)
                        part.add_header(
                            'Content-Disposition',
                            f'attachment; filename= {os.path.basename(file_path)}'
                        )
                        msg.attach(part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                if self.smtp_username and self.smtp_password:
                    server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_emails}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False
    
    def send_order_confirmation(self, user_email: str, order_data: dict) -> bool:
        subject = f"Order Confirmation - {order_data['order_number']}"
        
        body = f"""
        Dear {order_data.get('customer_name', 'Customer')},
        
        Thank you for your order! We've received your order and are processing it.
        
        Order Details:
        Order Number: {order_data['order_number']}
        Total Amount: ${order_data['total']:.2f}
        Estimated Delivery: {order_data.get('estimated_delivery', 'TBD')}
        
        We'll send you another email when your order ships.
        
        Best regards,
        Glonix Electronics Team
        """
        
        html_body = f"""
        <html>
        <body>
            <h2>Order Confirmation</h2>
            <p>Dear {order_data.get('customer_name', 'Customer')},</p>
            <p>Thank you for your order! We've received your order and are processing it.</p>
            
            <h3>Order Details:</h3>
            <ul>
                <li><strong>Order Number:</strong> {order_data['order_number']}</li>
                <li><strong>Total Amount:</strong> ${order_data['total']:.2f}</li>
                <li><strong>Estimated Delivery:</strong> {order_data.get('estimated_delivery', 'TBD')}</li>
            </ul>
            
            <p>We'll send you another email when your order ships.</p>
            
            <p>Best regards,<br>Glonix Electronics Team</p>
        </body>
        </html>
        """
        
        return self.send_email([user_email], subject, body, html_body)
    
    def send_quote_response(self, user_email: str, quote_data: dict) -> bool:
        subject = f"Quote Response - {quote_data['quote_number']}"
        
        body = f"""
        Dear {quote_data.get('customer_name', 'Customer')},
        
        Thank you for your quote request. We've prepared a quote for your project.
        
        Quote Details:
        Quote Number: {quote_data['quote_number']}
        Project: {quote_data['project_description']}
        Quote Amount: ${quote_data['quote_amount']:.2f}
        Valid Until: {quote_data['valid_until']}
        
        Please contact us if you have any questions.
        
        Best regards,
        Glonix Electronics Team
        """
        
        return self.send_email([user_email], subject, body)

# Initialize email service
email_service = EmailService()
