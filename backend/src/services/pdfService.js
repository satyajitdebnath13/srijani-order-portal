import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoicePDF = async (order, customer, items, address) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `invoice-${order.order_number}.pdf`;
      const filepath = path.join(__dirname, '../../uploads/invoices', filename);

      // Ensure directory exists
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text(process.env.COMPANY_NAME || 'Srijani', 50, 50);
      doc.fontSize(10).text('INVOICE', 50, 80);

      // Company details
      doc.fontSize(9)
        .text('Belgium Office:', 50, 110)
        .text(process.env.COMPANY_ADDRESS_BELGIUM || '', 50, 125)
        .text('India Office:', 50, 150)
        .text(process.env.COMPANY_ADDRESS_INDIA || '', 50, 165);

      // Invoice details
      doc.fontSize(10).text(`Invoice Number: ${order.order_number}`, 400, 110);
      doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 400, 125);
      doc.text(`Status: ${order.status.replace(/_/g, ' ')}`, 400, 140);

      // Customer details
      doc.fontSize(12).text('Bill To:', 50, 220);
      doc.fontSize(10)
        .text(customer.user.name, 50, 240)
        .text(customer.user.email, 50, 255);

      if (address) {
        doc.text(address.address_line1, 50, 270)
          .text(`${address.city}, ${address.postal_code}`, 50, 285)
          .text(address.country, 50, 300);
      }

      // Items table
      const tableTop = 350;
      doc.fontSize(10);

      // Table headers
      doc.font('Helvetica-Bold')
        .text('Item', 50, tableTop)
        .text('Qty', 300, tableTop)
        .text('Price', 370, tableTop)
        .text('Total', 450, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Table rows
      let position = tableTop + 25;
      doc.font('Helvetica');

      items.forEach((item) => {
        doc.text(item.product_name, 50, position, { width: 240 })
          .text(item.quantity.toString(), 300, position)
          .text(`€${parseFloat(item.unit_price).toFixed(2)}`, 370, position)
          .text(`€${parseFloat(item.subtotal).toFixed(2)}`, 450, position);

        if (item.size || item.color) {
          position += 15;
          doc.fontSize(8)
            .fillColor('#666')
            .text(`Size: ${item.size || 'N/A'}, Color: ${item.color || 'N/A'}`, 50, position);
          doc.fillColor('#000').fontSize(10);
        }

        position += 30;
      });

      // Total
      doc.moveTo(50, position).lineTo(550, position).stroke();
      position += 15;

      doc.font('Helvetica-Bold')
        .fontSize(12)
        .text('Total:', 370, position)
        .text(`€${parseFloat(order.total_amount).toFixed(2)}`, 450, position);

      // Payment info
      position += 50;
      doc.fontSize(9).font('Helvetica')
        .text(`Payment Method: ${order.payment_method || 'To be confirmed'}`, 50, position)
        .text(`Payment Status: ${order.payment_status}`, 50, position + 15);

      // Footer
      doc.fontSize(8)
        .text('Thank you for your business!', 50, 700, { align: 'center' })
        .text(`For questions, contact: ${process.env.COMPANY_EMAIL}`, 50, 715, { align: 'center' });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve({ filename, filepath });
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  generateInvoicePDF
};

