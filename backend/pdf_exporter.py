from datetime import datetime
import os
import re
from typing import Any, Dict, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    HRFlowable,
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


class PDFExporter:
    """
    Converts Markdown reports and embedded chart graphics into professionally
    formatted PDF documents using ReportLab.
    """

    def export_pdf(
        self,
        markdown_text: str,
        chart_path: Optional[str] = None,
        output_dir: str = "generated",
        filename: str = "analysis_report.pdf"
    ) -> Dict[str, Any]:
        """
        Converts Markdown report string to PDF file.

        :param markdown_text: Raw Markdown report content
        :param chart_path: Path to rendered chart PNG image
        :param output_dir: Directory where PDF is saved
        :param filename: Output PDF filename
        :return: Dict containing status, pdf_path, and timestamped_pdf_path
        """
        os.makedirs(output_dir, exist_ok=True)
        pdf_path = os.path.abspath(os.path.join(output_dir, filename))

        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        timestamped_filename = f"report_{timestamp_str}.pdf"
        timestamped_path = os.path.abspath(os.path.join(output_dir, timestamped_filename))

        try:
            doc = SimpleDocTemplate(
                pdf_path,
                pagesize=letter,
                leftMargin=40,
                rightMargin=40,
                topMargin=40,
                bottomMargin=40,
            )

            styles = getSampleStyleSheet()

            # Custom ReportLab Paragraph Styles
            title_style = ParagraphStyle(
                "DocTitle",
                parent=styles["Title"],
                fontName="Helvetica-Bold",
                fontSize=22,
                leading=26,
                textColor=colors.HexColor("#1e1e2f"),
                alignment=0,
                spaceAfter=15,
            )

            h1_style = ParagraphStyle(
                "SectionH1",
                parent=styles["Heading1"],
                fontName="Helvetica-Bold",
                fontSize=14,
                leading=18,
                textColor=colors.HexColor("#2b5c8f"),
                spaceBefore=14,
                spaceAfter=8,
            )

            h2_style = ParagraphStyle(
                "SectionH2",
                parent=styles["Heading2"],
                fontName="Helvetica-Bold",
                fontSize=12,
                leading=16,
                textColor=colors.HexColor("#333333"),
                spaceBefore=10,
                spaceAfter=6,
            )

            body_style = ParagraphStyle(
                "DocBody",
                parent=styles["Normal"],
                fontName="Helvetica",
                fontSize=10,
                leading=14,
                textColor=colors.HexColor("#222222"),
                spaceAfter=8,
            )

            code_style = ParagraphStyle(
                "DocCode",
                parent=styles["Code"],
                fontName="Courier",
                fontSize=8.5,
                leading=11,
                textColor=colors.HexColor("#d63384"),
                backColor=colors.HexColor("#f8f9fa"),
                borderColor=colors.HexColor("#e9ecef"),
                borderWidth=0.5,
                borderPadding=6,
                spaceBefore=6,
                spaceAfter=8,
            )

            story = []

            # Document Title Header
            story.append(Paragraph("📊 AI Data Analyst - Executive Analysis Report", title_style))
            story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2b5c8f"), spaceAfter=15))

            # Embed Chart Image at top if available
            if chart_path and os.path.exists(chart_path):
                try:
                    img = Image(chart_path, width=520, height=275)
                    story.append(img)
                    story.append(Spacer(1, 12))
                except Exception as img_err:
                    print(f"[PDFExporter Warning] Could not embed chart image: {img_err}")

            # Parse Markdown lines into ReportLab elements
            lines = markdown_text.split("\n")
            in_code_block = False
            code_buffer = []

            for line in lines:
                stripped = line.strip()

                if stripped.startswith("```"):
                    if in_code_block:
                        in_code_block = False
                        code_str = "\n".join(code_buffer)
                        story.append(Paragraph(self._escape_text(code_str), code_style))
                        code_buffer = []
                    else:
                        in_code_block = True
                        code_buffer = []
                    continue

                if in_code_block:
                    code_buffer.append(line)
                    continue

                if not stripped:
                    story.append(Spacer(1, 4))
                    continue

                if stripped.startswith("# "):
                    story.append(Paragraph(self._clean_md_format(stripped[2:]), title_style))
                elif stripped.startswith("## "):
                    story.append(Paragraph(self._clean_md_format(stripped[3:]), h1_style))
                elif stripped.startswith("### "):
                    story.append(Paragraph(self._clean_md_format(stripped[4:]), h2_style))
                elif stripped.startswith("- ") or stripped.startswith("* "):
                    bullet_text = f"• {self._clean_md_format(stripped[2:])}"
                    story.append(Paragraph(bullet_text, body_style))
                else:
                    story.append(Paragraph(self._clean_md_format(stripped), body_style))

            # Build PDF Document
            doc.build(story)

            # Copy to timestamped path
            with open(pdf_path, "rb") as f_src:
                pdf_data = f_src.read()
            with open(timestamped_path, "wb") as f_dst:
                f_dst.write(pdf_data)

            return {
                "status": "success",
                "pdf_path": pdf_path,
                "timestamped_pdf_path": timestamped_path,
            }

        except Exception as e:
            print(f"[PDFExporter Error] Failed to generate PDF report: {e}")
            return {
                "status": "error",
                "pdf_path": None,
                "timestamped_pdf_path": None,
                "error": str(e),
            }

    def _clean_md_format(self, text: str) -> str:
        """Converts basic Markdown bold, italic, and code formatting to ReportLab XML tags."""
        text = self._escape_text(text)
        # Convert **bold** -> <b>bold</b>
        text = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", text)
        # Convert *italic* -> <i>italic</i>
        text = re.sub(r"\*(.*?)\*", r"<i>\1</i>", text)
        # Convert `code` -> <font name="Courier">\1</font>
        text = re.sub(r"`(.*?)`", r'<font name="Courier" color="#d63384">\1</font>', text)
        return text

    def _escape_text(self, text: str) -> str:
        """Escapes XML special characters for ReportLab compatibility."""
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
