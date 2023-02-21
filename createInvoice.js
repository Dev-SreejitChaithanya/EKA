// createInvoice.js

const fs = require('fs');

const PDFDocument = require('pdfkit');
const moment=require('moment');

function createInvoice(invoice, paths) {
	let doc = new PDFDocument({ margin: 50 });

	generateHeader(doc); // Invoke `generateHeader` function.
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice);
	
	doc.pipe(fs.createWriteStream(paths));
    doc.end();
}



function generateHeader(doc) {
	doc.image('logo.png', 30, 15, { width: 100 })
		.fillColor('#444444')
		.fontSize(15)
        .text('EKA Pvt. Ltd.', 200, 45, { align: 'right' })
		.fontSize(11)
		.text('Panthakkal Road', 150, 65, { align: 'right' })
		.text('Pattambi,Kerala,India 679303', 150, 80, { align: 'right' })
		.moveDown();
}
function generateCustomerInformation(doc, invoice) {
    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("Invoice", 50, 160);
  
    generateHr(doc, 185);
  
    const customerInformationTop = 200;
  
    doc
      .fontSize(10)
      .text("Invoice Number:", 50, customerInformationTop)
      .font("Helvetica-Bold")
      .text(invoice.invoice_nr, 150, customerInformationTop)
      .font("Helvetica")
      .text("Invoice Date:", 50, customerInformationTop + 15)
      .text(formatDate(new Date()), 150, customerInformationTop + 15)
  
      .font("Helvetica-Bold")
      .text(invoice.shipping.name, 300, customerInformationTop)
      .font("Helvetica")
      .text(invoice.shipping.address, 300, customerInformationTop + 15)
      .text(
        invoice.shipping.city +
          ", " +
          invoice.shipping.state +
          ", " +
          invoice.shipping.country,
        300,
        customerInformationTop + 30
      )
      .moveDown();
  
    generateHr(doc, 252);
  }
  
  function generateInvoiceTable(doc, invoice) {
    let i;
    const invoiceTableTop = 330;
  
    doc.font("Helvetica-Bold");
    generateTableRow(
      doc,
      invoiceTableTop,
      "Item",
      "Description",
      "Unit Cost",
      "Quantity",
      "Line Total"
    );
    generateHr(doc, invoiceTableTop + 20);
    doc.font("Helvetica");
  
    for (i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      const position = invoiceTableTop + (i + 1) * 30;
      generateTableRow(
        doc,
        position,
        item.item,
        item.description,
        formatCurrency(item.amount / item.quantity),
        item.quantity,
        formatCurrency(item.amount)
      );
  
      generateHr(doc, position + 20);
    }
  
    const subtotalPosition = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      subtotalPosition,
      "",
      "",
      "Subtotal",
      "",
      formatCurrency(invoice.subtotal)
    );
  
  }
  

  function generateTableRow(
    doc,
    y,
    item,
    description,
    unitCost,
    quantity,
    lineTotal
  ) {
    doc
      .fontSize(10)
      .text(item, 50, y)
      .text(description, 150, y)
      .text(unitCost, 280, y, { width: 90, align: "right" })
      .text(quantity, 370, y, { width: 90, align: "right" })
      .text(lineTotal, 0, y, { align: "right" });
  }
  
  function generateHr(doc, y) {
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }
  
  function formatCurrency(cents) {
    return "Rs." + (cents / 100).toFixed(2);
  }
  
  function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
  
    return year + "/" + month + "/" + day;
  }
  
  module.exports = {
    createInvoice
  };