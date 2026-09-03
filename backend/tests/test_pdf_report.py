import sys
import os
import zlib
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_pdf_report_endpoint():
    """Verifies that the /api/report/pdf endpoint serves a valid PDF file with embedded image objects and clean formatting."""
    response = client.get("/api/report/pdf")
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    # 1. Verify Content-Type
    content_type = response.headers.get("content-type", "")
    assert "application/pdf" in content_type, f"Expected application/pdf in {content_type}"
    
    # 2. Verify Content-Disposition header and filename
    content_disp = response.headers.get("content-disposition", "")
    assert "Sagar_Drishti_Investigation_Report_SD-001.pdf" in content_disp, f"Expected filename in {content_disp}"
    
    # 3. Verify PDF Magic Number Signature (%PDF-)
    content_bytes = response.content
    assert len(content_bytes) > 0, "PDF response body is empty"
    assert content_bytes.startswith(b"%PDF-"), f"Invalid PDF signature: {content_bytes[:10]}"
    
    # 4. Verify embedded Image Objects (Confirming Sagar Drishti logo graphic artwork is embedded)
    assert b"/Image" in content_bytes or b"/XObject" in content_bytes, "PDF does not contain an embedded image object for logo"
    
    # 5. Verify Absence of Misleading Labels
    assert b"CONFIDENTIAL / OFFICIAL USE ONLY" not in content_bytes, "Found unwanted CONFIDENTIAL label in PDF"

    print("PASS: test_pdf_report_endpoint (PDF signature, embedded image artwork, and clean formatting verified!)")


def test_csv_report_endpoint():
    """Verifies that the /api/report/csv endpoint serves valid CSV evidence."""
    response = client.get("/api/report/csv")
    
    assert response.status_code == 200
    assert "text/csv" in response.headers.get("content-type", "")
    assert "Sagar_Drishti_Evidence_SD-001.csv" in response.headers.get("content-disposition", "")
    assert len(response.text) > 0
    assert "MMSI,VesselName,VesselType" in response.text
    print("PASS: test_csv_report_endpoint")


if __name__ == "__main__":
    test_pdf_report_endpoint()
    test_csv_report_endpoint()
    print("ALL BACKEND PDF/CSV TESTS PASSED SUCCESSFULLY!")
