import io
import os
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Custom canvas that computes total pages and draws page footers."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count: int):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Footer text
        footer_left = "SAGAR DRISHTI — SEE. TRACE. ATTRIBUTE.  |  MARITIME ENVIRONMENTAL INTELLIGENCE"
        footer_right = f"Page {self._pageNumber} of {page_count}"
        
        self.drawString(36, 20, footer_left)
        self.drawRightString(612 - 36, 20, footer_right)
        
        # Line divider
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(36, 32, 612 - 36, 32)
        
        self.restoreState()


def generate_pdf_report(incident: Dict[str, Any]) -> bytes:
    """
    Generates a professional, publication-quality Maritime Oil-Spill Investigation Report
    in PDF format using ReportLab with embedded official Sagar Drishti logo artwork.
    """
    # 1. Verify Logo Asset Existence & Integrity before starting build
    logo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets", "sagar-drishti-logo.png"))
    if not os.path.exists(logo_path) or os.path.getsize(logo_path) == 0:
        raise RuntimeError(f"Required Sagar Drishti official logo asset missing or invalid at: {logo_path}")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=48
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette (Light Maritime Theme)
    NAVY = colors.HexColor('#0f172a')
    OCEAN_BLUE = colors.HexColor('#1e3a8a')
    TEAL = colors.HexColor('#0d9488')
    SLATE = colors.HexColor('#475569')
    LIGHT_BG = colors.HexColor('#f8fafc')
    BORDER_COLOR = colors.HexColor('#cbd5e1')

    # Custom Paragraph Styles
    h1_style = ParagraphStyle(
        'Heading1Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=NAVY,
        spaceBefore=10,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#334155')
    )

    bold_body_style = ParagraphStyle(
        'BoldBodyCustom',
        parent=body_style,
        fontName='Helvetica-Bold',
        textColor=NAVY
    )

    teal_bold_style = ParagraphStyle(
        'TealBoldCustom',
        parent=body_style,
        fontName='Helvetica-Bold',
        textColor=TEAL
    )

    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        leading=10,
        textColor=SLATE
    )

    right_title_style = ParagraphStyle(
        'RightTitle',
        parent=body_style,
        alignment=2,
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=NAVY
    )

    right_subtitle_style = ParagraphStyle(
        'RightSubtitle',
        parent=body_style,
        alignment=2,
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=TEAL
    )

    right_meta_style = ParagraphStyle(
        'RightMeta',
        parent=body_style,
        alignment=2,
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=SLATE
    )

    elements = []

    # Extract Canonical Data Fields
    inc_id = incident.get("incident_id", "SD-001")
    inc_title = incident.get("title", "Arabian Sea Offshore Spill — Mumbai High Sector")
    location = incident.get("location_name", "Arabian Sea (18.523° N, 72.812° E)")
    timestamp = incident.get("detection_timestamp", "2025-09-08T10:30:00Z")
    
    detection = incident.get("detection", {})
    spill_area = detection.get("area_km2", 41.86)
    confidence = detection.get("confidence", 88.8)
    release_window = detection.get("estimated_release_window", {})
    start_win = release_window.get("start", "08:00 UTC")
    end_win = release_window.get("end", "10:00 UTC")

    report_type_label = "DEMONSTRATION REPORT" if inc_id.startswith("SD-") else "ANALYSIS GENERATED"
    status_label = "DEMONSTRATION ANALYSIS" if inc_id.startswith("SD-") else "ANALYSIS GENERATED"

    # Document Header Banner with Official Sagar Drishti Logo Artwork
    # Width: 180pt, Height: 72pt (aspect ratio 2.5:1)
    logo_image = Image(logo_path, width=180, height=72)

    header_right_cell = [
        Paragraph("MARITIME OIL-SPILL INVESTIGATION REPORT", right_title_style),
        Spacer(1, 2),
        Paragraph(report_type_label, right_subtitle_style),
        Spacer(1, 2),
        Paragraph(f"INCIDENT REF: {inc_id}", right_meta_style)
    ]

    header_data = [
        [
            logo_image,
            header_right_cell
        ]
    ]
    header_table = Table(header_data, colWidths=[240, 300])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(header_table)
    elements.append(HRFlowable(width="100%", thickness=1.5, color=OCEAN_BLUE, spaceBefore=4, spaceAfter=10))

    # 1. EXECUTIVE INCIDENT SUMMARY
    elements.append(Paragraph("1. EXECUTIVE INCIDENT SUMMARY", h1_style))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=SLATE, spaceBefore=1, spaceAfter=4))
    
    exec_summary_text = (
        f"This dossier summarizes satellite SAR detection, hydrodynamic advection drift modeling, and AIS vessel correlation "
        f"for Incident {inc_id} ({inc_title}). Satellite imagery acquired at {timestamp} isolated a potential "
        f"oil slick measuring {spill_area} km². Drift hindcasting reconstructed a Probable Origin Zone centered at "
        f"18.558° N, 72.846° E (±2.0 km uncertainty) between {start_win} and {end_win}. AIS telemetry correlation "
        f"identified candidate vessel MT OCEAN STAR (MMSI: 419001892) as the primary lead with a correlation score of 91.0 / 100."
    )
    elements.append(Paragraph(exec_summary_text, body_style))
    elements.append(Spacer(1, 6))

    # 2. INCIDENT OVERVIEW
    elements.append(Paragraph("2. INCIDENT OVERVIEW", h1_style))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=SLATE, spaceBefore=1, spaceAfter=4))
    
    meta_table_data = [
        [
            Paragraph("Investigation ID:", bold_body_style), Paragraph(inc_id, bold_body_style),
            Paragraph("Incident Title:", bold_body_style), Paragraph(inc_title, body_style)
        ],
        [
            Paragraph("Geographic Sector:", bold_body_style), Paragraph(location, body_style),
            Paragraph("Detection Time:", bold_body_style), Paragraph(timestamp, body_style)
        ],
        [
            Paragraph("Slick Surface Area:", bold_body_style), Paragraph(f"{spill_area} km²", bold_body_style),
            Paragraph("Detection Confidence:", bold_body_style), Paragraph(f"{confidence}% (Potential Oil Slick)", body_style)
        ],
        [
            Paragraph("Estimated Discharge:", bold_body_style), Paragraph(f"{start_win} – {end_win}", body_style),
            Paragraph("Investigation Status:", bold_body_style), Paragraph(status_label, teal_bold_style)
        ]
    ]

    meta_table = Table(meta_table_data, colWidths=[105, 165, 105, 165])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_BG),
        ('BOX', (0, 0), (-1, -1), 0.75, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 6))

    # 3. SATELLITE OIL-SLICK ANALYSIS
    elements.append(Paragraph("3. SATELLITE OIL-SLICK ANALYSIS", h1_style))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=SLATE, spaceBefore=1, spaceAfter=4))
    
    sat_text = (
        "Synthetic Aperture Radar (SAR) imagery captured by Sentinel-1 C-Band in VV polarization was processed using adaptive "
        "thresholding and UNet semantic segmentation. Dark backscatter attenuation anomalies were confirmed to represent a surface slick."
    )
    elements.append(Paragraph(sat_text, body_style))
    elements.append(Spacer(1, 4))

    # 4. SPILL CHARACTERISTICS
    elements.append(Paragraph("4. SPILL CHARACTERISTICS", h1_style))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=SLATE, spaceBefore=1, spaceAfter=4))
    
    spill_char_data = [
        [Paragraph("Slick Area:", bold_body_style), Paragraph(f"{spill_area} km²", body_style), Paragraph("Perimeter:", bold_body_style), Paragraph(f"{detection.get('perimeter_km', 29.36)} km", body_style)],
        [Paragraph("Length × Width:", bold_body_style), Paragraph(f"{detection.get('length_km', 10.15)} × {detection.get('width_km', 7.9)} km", body_style), Paragraph("Compactness Ratio:", bold_body_style), Paragraph(f"{detection.get('compactness', 0.548)} (Elongated Trail)", body_style)],
        [Paragraph("Classification:", bold_body_style), Paragraph("Potential Marine Oil Slick", body_style), Paragraph("Look-alike Risk:", bold_body_style), Paragraph("Low (Surface Wind > 12 km/h)", body_style)]
    ]
    spill_table = Table(spill_char_data, colWidths=[110, 160, 110, 160])
    spill_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#f1f5f9')),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(spill_table)
    elements.append(Spacer(1, 6))

    # 5. ENVIRONMENTAL CONDITIONS
    elements.append(Paragraph("5. ENVIRONMENTAL CONDITIONS", h1_style))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=SLATE, spaceBefore=1, spaceAfter=4))
    
    env = incident.get("environmental", {})
    env_data = [
        [Paragraph("Surface Wind Velocity:", bold_body_style), Paragraph(f"{env.get('wind_speed_kmh', 18)} km/h ({env.get('wind_direction_label', 'NE')} {env.get('wind_direction_deg', 45)}°)", body_style), Paragraph("Ocean Current Velocity:", bold_body_style), Paragraph(f"{env.get('current_speed_ms', 0.42)} m/s ({env.get('current_direction_label', 'SW')} {env.get('current_direction_deg', 225)}°)", body_style)],
        [Paragraph("Net Advection Speed:", bold_body_style), Paragraph("2.14 km/h (SW Drift)", body_style), Paragraph("Sea State:", bold_body_style), Paragraph(f"{env.get('sea_state', 'Slight / Code 3')}", body_style)]
    ]
    env_table = Table(env_data, colWidths=[110, 160, 110, 160])
    env_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#f1f5f9')),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(env_table)
    elements.append(Spacer(1, 6))

    # 6. PROBABLE ORIGIN & DRIFT RECONSTRUCTION
    elements.append(Paragraph("6. PROBABLE ORIGIN & DRIFT RECONSTRUCTION", h1_style))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=SLATE, spaceBefore=1, spaceAfter=4))
    
    drift_info = incident.get("drift", {}).get("backcast", {})
    origin_info = drift_info.get("probable_origin", {})

    drift_text = (
        f"A 2.5-hour backward advection model combining 100% current vector and 3.5% wind drag reconstructed the release path. "
        f"The Probable Origin Zone is centered at {origin_info.get('lat', 18.558)}° N, {origin_info.get('lon', 72.846)}° E "
        f"with a ±{origin_info.get('uncertainty_radius_km', 2.0)} km uncertainty radius during release window {start_win}–{end_win}."
    )
    elements.append(Paragraph(drift_text, body_style))
    elements.append(Spacer(1, 6))

    # 7. AIS VESSEL ANALYSIS
    elements.append(Paragraph("7. AIS VESSEL ANALYSIS (FUNNEL FILTERING)", h1_style))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=SLATE, spaceBefore=1, spaceAfter=4))

    ais_stats = incident.get("ais_summary", {})
    funnel_text = (
        f"Raw sector AIS feed tracked {ais_stats.get('total_in_region', 126)} vessels. "
        f"Spatial buffer filtering narrowed candidates to {ais_stats.get('spatially_relevant', 32)} vessels, "
        f"temporal matching identified {ais_stats.get('present_in_release_window', 11)} vessels present in the release window, "
        f"and multi-factor correlation prioritized {ais_stats.get('strongly_correlated', 5)} leads."
    )
    elements.append(Paragraph(funnel_text, body_style))
    elements.append(Spacer(1, 6))

    # 8. POTENTIALLY ASSOCIATED VESSEL RANKING
    elements.append(Paragraph("8. POTENTIALLY ASSOCIATED VESSEL RANKING", h1_style))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=SLATE, spaceBefore=1, spaceAfter=4))

    vessel_headers = [
        Paragraph("Rank", bold_body_style),
        Paragraph("Vessel Candidate", bold_body_style),
        Paragraph("Type", bold_body_style),
        Paragraph("Distance", bold_body_style),
        Paragraph("Time Match", bold_body_style),
        Paragraph("Traj Match", bold_body_style),
        Paragraph("Score", bold_body_style),
        Paragraph("Priority", bold_body_style)
    ]
    vessel_rows = [vessel_headers]

    ranked_vessels = incident.get("ranked_vessels", [])
    for idx, v in enumerate(ranked_vessels, 1):
        priority = v.get("investigation_priority", "LOW")
        score = v.get("correlation_score", 50.0)
        dist = v.get("min_distance_to_origin_km", 5.0)
        sb = v.get("score_breakdown", {})
        
        p_color = colors.HexColor("#e11d48") if priority == "HIGH" else (colors.HexColor("#d97706") if priority == "MEDIUM" else colors.HexColor("#64748b"))
        priority_cell_style = ParagraphStyle(
            f'PStyle_{idx}',
            parent=body_style,
            fontName='Helvetica-Bold',
            textColor=p_color
        )

        vessel_rows.append([
            Paragraph(str(idx), body_style),
            Paragraph(f"{v.get('vessel_name', 'UNKNOWN')}<br/>MMSI: {v.get('mmsi')}", body_style),
            Paragraph(v.get("vessel_type", "Tanker"), body_style),
            Paragraph(f"{dist} km", body_style),
            Paragraph(f"{int(sb.get('temporal', 80))}%", body_style),
            Paragraph(f"{int(sb.get('trajectory', 75))}%", body_style),
            Paragraph(f"{score} / 100", bold_body_style),
            Paragraph(priority, priority_cell_style)
        ])

    v_table = Table(vessel_rows, colWidths=[30, 130, 80, 55, 60, 60, 60, 65])
    v_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), LIGHT_BG),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 4),
        ('TOPPADDING', (0, 0), (-1, 0), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(v_table)
    elements.append(Spacer(1, 6))

    # 9. PRIMARY INVESTIGATION LEAD
    if ranked_vessels:
        lead = ranked_vessels[0]
        elements.append(Paragraph("9. PRIMARY INVESTIGATION LEAD EVIDENCE", h1_style))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=SLATE, spaceBefore=1, spaceAfter=4))

        lead_summary = f"Primary Lead: {lead.get('vessel_name')} ({lead.get('vessel_type')}) — Score: {lead.get('correlation_score')} / 100 ({lead.get('investigation_priority')} PRIORITY)\n"
        lead_summary += f"{lead.get('explainable_summary', '')}"
        elements.append(Paragraph(lead_summary, body_style))
        elements.append(Spacer(1, 4))

        checklist = lead.get("evidence_checklist", [])
        evidence_items = []
        for item in checklist:
            mark = "[MATCH]" if item.get("fulfilled") else "[NO MATCH]"
            m_color = colors.HexColor("#0d9488") if item.get("fulfilled") else colors.HexColor("#94a3b8")
            mark_style = ParagraphStyle(
                'MarkStyle',
                parent=body_style,
                fontName='Helvetica-Bold',
                textColor=m_color
            )
            evidence_items.append([
                Paragraph(mark, mark_style),
                Paragraph(item.get("text", ""), body_style),
                Paragraph(f"Score: +{item.get('score', 0)} pts", body_style)
            ])
        
        if evidence_items:
            ev_table = Table(evidence_items, colWidths=[60, 390, 90])
            ev_table.setStyle(TableStyle([
                ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#f1f5f9')),
                ('PADDING', (0, 0), (-1, -1), 3),
            ]))
            elements.append(ev_table)

    elements.append(Spacer(1, 6))

    # 10. CHRONOLOGICAL INCIDENT TIMELINE
    elements.append(Paragraph("10. CHRONOLOGICAL INCIDENT TIMELINE", h1_style))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=SLATE, spaceBefore=1, spaceAfter=4))

    timeline_data = [[
        Paragraph("Time (UTC)", bold_body_style),
        Paragraph("Event Title", bold_body_style),
        Paragraph("Event Description", bold_body_style),
        Paragraph("Vessel Association", bold_body_style)
    ]]
    for evt in incident.get("timeline", []):
        v_mmsi = f"MMSI {evt.get('vessel_mmsi')}" if evt.get('vessel_mmsi') else "N/A"
        timeline_data.append([
            Paragraph(evt.get("time", ""), body_style),
            Paragraph(evt.get('title', ''), bold_body_style),
            Paragraph(evt.get("description", ""), body_style),
            Paragraph(v_mmsi, body_style)
        ])
    
    t_table = Table(timeline_data, colWidths=[70, 130, 250, 90])
    t_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), LIGHT_BG),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(t_table)
    elements.append(Spacer(1, 6))

    # 11. METHODOLOGY
    elements.append(Paragraph("11. METHODOLOGY", h1_style))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=SLATE, spaceBefore=1, spaceAfter=4))
    method_text = (
        "Sagar Drishti employs a 8-stage framework combining satellite SAR UNet segmentation, 2D advection hydrodynamic "
        "drift physics (current + 3.5% wind drag), AIS spatial-temporal filtering, and multi-factor correlation scoring."
    )
    elements.append(Paragraph(method_text, body_style))
    elements.append(Spacer(1, 6))

    # 12. LIMITATIONS
    elements.append(Paragraph("12. LIMITATIONS", h1_style))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=SLATE, spaceBefore=1, spaceAfter=4))
    lim_text = (
        "1. Satellite SAR look-alikes may occur during low wind conditions (<3 m/s).\n"
        "2. Vessels operating with disabled AIS transponders cannot be tracked via AIS telemetry.\n"
        "3. Surface current vectors assume spatial uniformity across the 50 km sector."
    )
    elements.append(Paragraph(lim_text, body_style))
    elements.append(Spacer(1, 8))

    # 13. INVESTIGATION DISCLAIMER
    elements.append(Paragraph("13. INVESTIGATION DISCLAIMER", h1_style))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=SLATE, spaceBefore=1, spaceAfter=4))
    disclaimer_text = (
        "NON-ATTRIBUTION LEGAL NOTICE: Correlation scores and vessel rankings generated by Sagar Drishti represent "
        "investigative prioritization indicators based on multi-factor telemetry analysis. They do not establish legal responsibility "
        "or constitute conclusive legal proof of liability. Physical sampling and Coast Guard verification are required for official enforcement."
    )
    elements.append(Paragraph(disclaimer_text, disclaimer_style))

    # Build document with NumberedCanvas for dynamic "Page X of Y" footers
    doc.build(elements, canvasmaker=NumberedCanvas)
    buffer.seek(0)
    return buffer.getvalue()


def generate_csv_report(incident: Dict[str, Any]) -> str:
    """Generates a structured CSV report of vessel correlation leads."""
    lines = [
        "MMSI,VesselName,VesselType,Flag,CorrelationScore,Priority,MinDistanceOriginKm,ClosestTimestamp,SpeedAnomaly,AISGapMinutes,ExplainableSummary"
    ]
    for v in incident.get("ranked_vessels", []):
        anom = v.get("anomalies", {})
        line = f'{v.get("mmsi")},"{v.get("vessel_name")}","{v.get("vessel_type")}","{v.get("flag","N/A")}",{v.get("correlation_score")},{v.get("investigation_priority")},{v.get("min_distance_to_origin_km")},"{v.get("closest_timestamp")}",{anom.get("has_speed_anomaly", False)},{anom.get("max_ais_gap_minutes", 0)},"{v.get("explainable_summary","")}"'
        lines.append(line)
    return "\n".join(lines)
