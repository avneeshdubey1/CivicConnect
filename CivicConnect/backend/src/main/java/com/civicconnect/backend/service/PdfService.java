package com.civicconnect.backend.service;

import com.civicconnect.backend.model.Grievance; // <--- UPDATED
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.kernel.colors.ColorConstants;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    // Changed method signature to accept Grievance
    public byte[] generateGrievancePdf(Grievance grievance) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Add title
            Paragraph title = new Paragraph("GRIEVANCE RECEIPT") // Updated Title
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(title);

            // Add subtitle
            Paragraph subtitle = new Paragraph("CivicConnect - Citizen Grievance Portal")
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(30)
                    .setFontColor(ColorConstants.GRAY);
            document.add(subtitle);

            // Create table
            Table table = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
                    .useAllAvailableWidth();

            // Add details
            addTableRow(table, "Grievance ID:", "#" + grievance.getId(), true);
            addTableRow(table, "Title:", grievance.getTitle(), false);
            addTableRow(table, "Category:", grievance.getCategory(), false); // Added Category
            addTableRow(table, "Priority:", grievance.getPriority(), false); // Added Priority
            addTableRow(table, "Location:", grievance.getLocation(), false); // Changed Area -> Location
            addTableRow(table, "Status:", grievance.getStatus(), false);
            
            if (grievance.getCreatedAt() != null) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
                addTableRow(table, "Submitted On:", grievance.getCreatedAt().format(formatter), false);
            }
            
            if (grievance.getUser() != null) {
                addTableRow(table, "Submitted By:", grievance.getUser().getUsername(), false);
                addTableRow(table, "Email:", grievance.getUser().getEmail(), false);
            }
            
            document.add(table);

            // Add description
            document.add(new Paragraph("\nDescription:")
                    .setBold()
                    .setMarginTop(20));
            
            document.add(new Paragraph(grievance.getDescription())
                    .setMarginBottom(20));

            // Add resolution remark
            if (grievance.getResolutionRemark() != null && !grievance.getResolutionRemark().isEmpty()) {
                document.add(new Paragraph("Resolution Remark:")
                        .setBold()
                        .setMarginTop(10));
                document.add(new Paragraph(grievance.getResolutionRemark())
                        .setFontColor(ColorConstants.DARK_GRAY));
            }

            // Add footer
            document.add(new Paragraph("\n\nThank you for using CivicConnect!")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(10)
                    .setFontColor(ColorConstants.GRAY)
                    .setMarginTop(30));

            document.add(new Paragraph("This is a computer-generated document and does not require a signature.")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(8)
                    .setFontColor(ColorConstants.LIGHT_GRAY));

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }
    }

    private void addTableRow(Table table, String label, String value, boolean isHeader) {
        Cell labelCell = new Cell().add(new Paragraph(label).setBold());
        Cell valueCell = new Cell().add(new Paragraph(value != null ? value : "N/A"));
        
        if (isHeader) {
            labelCell.setBackgroundColor(ColorConstants.LIGHT_GRAY);
            valueCell.setBackgroundColor(ColorConstants.LIGHT_GRAY).setBold();
        }
        
        table.addCell(labelCell);
        table.addCell(valueCell);
    }
}