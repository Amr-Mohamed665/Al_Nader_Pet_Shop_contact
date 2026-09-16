import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import type { Order } from '../types';

// Lazy initialization of transporter so SMTP configuration errors don't crash startup
let transporter: Mail | null = null;

interface SmtpTransporter {
  sendMail(options: Mail.Options): Promise<{ messageId: string }>;
}

function getTransporter(): SmtpTransporter | null {
  if (transporter !== null) return transporter as unknown as SmtpTransporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ?? '587';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true';

  if (!host || !user || !pass) {
    console.warn('⚠️ SMTP credentials not fully configured in .env. Emails will be logged to console only.');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure,
      auth: { user, pass },
    });
    return transporter as unknown as SmtpTransporter;
  } catch (err: unknown) {
    console.error('❌ Failed to create SMTP transporter:', (err as Error).message);
    return null;
  }
}

interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface MailResult {
  success: boolean;
  mock?: boolean;
  messageId?: string;
  error?: string;
}

export async function sendMail({ to, subject, text, html }: SendMailOptions): Promise<MailResult> {
  const mailTransporter = getTransporter();
  const from = `"Al Nader Pets" <${process.env.SMTP_USER ?? 'alnaderpetshop@gmail.com'}>`;

  if (!mailTransporter) {
    console.log('=========================================');
    console.log(`✉️ MOCK EMAIL SENT`);
    console.log(`FROM: ${from}`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`TEXT CONTENT:\n${text}`);
    console.log('=========================================');
    return { mock: true, success: true };
  }

  try {
    const info = await mailTransporter.sendMail({ from, to, subject, text, html });
    console.log(`✉️ Email successfully sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: unknown) {
    console.error('❌ Error sending email:', (err as Error).message);
    return { success: false, error: (err as Error).message };
  }
}

// Extended Order type with full delivery address for mailer
interface OrderDeliveryAddress {
  building: string;
  street: string;
  floor?: string;
  apartment?: string;
  area: string;
  emirate: string;
  landmark?: string;
  instructions?: string;
}

interface OrderCustomerInfo {
  fullName: string;
  phone: string;
  email: string;
}

interface FullOrder extends Omit<Order, 'items' | 'deliveryAddress' | 'customer'> {
  customer: OrderCustomerInfo;
  deliveryAddress: OrderDeliveryAddress;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod?: string;
  items: Array<{
    id?: string;
    menuItemId?: string;
    name: string;
    price: number;
    quantity: number;
    lineTotal?: number;
  }>;
}

export async function sendOrderNotificationEmail(order: FullOrder): Promise<MailResult> {
  const adminEmail = process.env.NOTIFICATION_EMAIL ?? 'alnaderpetshop@gmail.com';
  const subject = `🎉 New Order Placed: #${order.id}`;

  const itemsList = order.items
    .map((item) => `- ${item.name} x ${item.quantity} (AED ${item.price} each)`)
    .join('\n');

  const address = order.deliveryAddress;
  const addressStr = `${address.building}, ${address.street}${address.floor ? `, Floor ${address.floor}` : ''}${address.apartment ? `, Apt ${address.apartment}` : ''}, ${address.area}, ${address.emirate}`;

  const text = `
Hi Admin,

A new order has been placed on Al Nader Pets.

Order Details:
----------------------------------------
Order ID: #${order.id}
Placed On: ${new Date(order.createdAt).toLocaleString()}
Grand Total: AED ${order.total}

Customer Details:
----------------------------------------
Name: ${order.customer.fullName}
Phone: ${order.customer.phone}
Email: ${order.customer.email}

Delivery Address:
----------------------------------------
Address: ${addressStr}
Landmark: ${address.landmark ?? 'N/A'}
Instructions: ${address.instructions ?? 'None'}

Order Items:
----------------------------------------
${itemsList}

Special Notes:
----------------------------------------
${order.orderNotes ?? 'None'}

Please log in to the admin dashboard to manage and update this order.
`;

  const html = `
    <h3>Hi Admin,</h3>
    <p>A new order has been placed on <strong>Al Nader Pets</strong>.</p>
    
    <h4>Order Summary</h4>
    <ul>
      <li><strong>Order ID:</strong> #${order.id}</li>
      <li><strong>Placed On:</strong> ${new Date(order.createdAt).toLocaleString()}</li>
      <li><strong>Grand Total:</strong> AED ${order.total}</li>
    </ul>

    <h4>Customer Details</h4>
    <ul>
      <li><strong>Name:</strong> ${order.customer.fullName}</li>
      <li><strong>Phone:</strong> ${order.customer.phone}</li>
      <li><strong>Email:</strong> ${order.customer.email}</li>
    </ul>

    <h4>Delivery Address</h4>
    <p>${addressStr}<br/>
       <strong>Landmark:</strong> ${address.landmark ?? 'N/A'}<br/>
       <strong>Instructions:</strong> ${address.instructions ?? 'None'}</p>

    <h4>Order Items</h4>
    <ul>
      ${order.items.map((item) => `<li><strong>${item.name}</strong> x ${item.quantity} - AED ${item.lineTotal}</li>`).join('')}
    </ul>

    ${order.orderNotes ? `<h4>Special Notes</h4><p><em>"${order.orderNotes}"</em></p>` : ''}

    <p><a href="http://localhost:3000/admin/orders/${order.id}">View Order Details in Admin Dashboard</a></p>
  `;

  return sendMail({ to: adminEmail, subject, text, html });
}

export async function sendCustomerOrderConfirmationEmail(order: FullOrder): Promise<MailResult> {
  const customerEmail = order.customer?.email;
  if (!customerEmail) return { success: false, error: 'Customer email missing' };

  const subject = `🐾 Order Confirmation: #${order.id} - Al Nader Pets`;

  const itemsList = order.items
    .map((item) => `- ${item.name} x ${item.quantity} (AED ${item.price} each)`)
    .join('\n');

  const payMethod = (order.paymentMethod || 'cod').toUpperCase();

  const text = `
Dear ${order.customer.fullName},

Thank you for your order with Al Nader Pets! We have received your order and are processing it now.

Order Summary:
----------------------------------------
Order ID: #${order.id}
Placed On: ${new Date(order.createdAt).toLocaleString()}
Total Amount: AED ${order.total}
Payment Method: ${payMethod}

Items Ordered:
----------------------------------------
${itemsList}

We will contact you shortly regarding delivery. If you have any questions, feel free to reply to this email or contact us.

Best regards,
Al Nader Pets & Accessories Team
`;

  const html = `
    <h3>Dear ${order.customer.fullName},</h3>
    <p>Thank you for your order with <strong>Al Nader Pets</strong>! We have received your order and are currently processing it.</p>
    
    <h4>Order Summary</h4>
    <ul>
      <li><strong>Order ID:</strong> #${order.id}</li>
      <li><strong>Placed On:</strong> ${new Date(order.createdAt).toLocaleString()}</li>
      <li><strong>Total Amount:</strong> AED ${order.total}</li>
      <li><strong>Payment Method:</strong> ${payMethod}</li>
    </ul>

    <h4>Items Ordered</h4>
    <ul>
      ${order.items.map((item) => `<li><strong>${item.name}</strong> x ${item.quantity} - AED ${item.lineTotal || item.price * item.quantity}</li>`).join('')}
    </ul>

    <p>We will contact you shortly for delivery updates.</p>
    <p>Best regards,<br/><strong>Al Nader Pets & Accessories Team</strong></p>
  `;

  return sendMail({ to: customerEmail, subject, text, html });
}

interface ContactEmailOptions {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactEmail({ name, email, subject: msgSubject, message }: ContactEmailOptions): Promise<MailResult> {
  const adminEmail = process.env.NOTIFICATION_EMAIL ?? 'alnaderpetshop@gmail.com';
  const subject = `✉️ New Contact Form Submission: ${msgSubject}`;

  const text = `
Hi Admin,

You have received a new message from the contact form on Al Nader Pets.

Contact Details:
----------------------------------------
Name: ${name}
Email: ${email}
Subject: ${msgSubject}

Message:
----------------------------------------
${message}
`;

  const html = `
    <h3>Hi Admin,</h3>
    <p>You have received a new contact form query.</p>
    
    <h4>Details</h4>
    <ul>
      <li><strong>Name:</strong> ${name}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Subject:</strong> ${msgSubject}</li>
    </ul>

    <h4>Message</h4>
    <p style="white-space: pre-wrap; padding: 15px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">${message}</p>
  `;

  return sendMail({ to: adminEmail, subject, text, html });
}
