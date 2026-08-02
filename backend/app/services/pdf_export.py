from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

from app.models import Project, Report


def _section(title: str, content: str, styles) -> list:
    elements = [
        Paragraph(title, styles["Heading2"]),
        Spacer(1, 0.1 * inch),
        Paragraph(content.replace("\n", "<br/>")[:5000], styles["Body"]),
        Spacer(1, 0.3 * inch),
    ]
    return elements


def generate_report_pdf(project: Project, report: Report) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.75 * inch, bottomMargin=0.75 * inch)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="Title2", parent=styles["Title"], textColor=colors.HexColor("#6366f1")))

    story = [
        Paragraph(f"Krew AI — Strategy Report", styles["Title2"]),
        Paragraph(project.business_name, styles["Heading1"]),
        Spacer(1, 0.2 * inch),
        Paragraph(f"Industry: {project.industry} | Budget: {project.budget} | Deadline: {project.deadline}", styles["Normal"]),
        Spacer(1, 0.4 * inch),
    ]

    sections = [
        ("Executive Summary", report.executive_summary),
        ("Market Analysis", report.market_analysis),
        ("Competitor Analysis", report.competitor_analysis),
        ("Business Strategy", report.business_strategy),
        ("Marketing Plan", report.marketing_plan),
        ("Financial Projection", report.financial_projection),
        ("Technical Architecture", report.technical_architecture),
        ("Roadmap", report.roadmap),
        ("Risks", report.risks),
        ("Recommendations", report.recommendations),
        ("Next Steps", report.next_steps),
    ]

    for title, content in sections:
        if content:
            story.extend(_section(title, content, styles))

    if report.scores:
        scores_text = " | ".join(f"{k.title()}: {v}" for k, v in report.scores.items())
        story.extend(_section("Scores", scores_text, styles))

    doc.build(story)
    return buffer.getvalue()
