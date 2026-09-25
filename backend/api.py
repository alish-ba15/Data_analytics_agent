import os
import sys
from typing import Optional
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

# Ensure project root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from backend.main import run_full_analysis_pipeline

app = FastAPI(
    title="AI Data Analyst Agent API",
    description="Groq-powered multi-agent data profiling, cleaning, analysis, chart generation, and PDF report export API.",
    version="1.0.0"
)

# Enable CORS for frontend flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "data"
GENERATED_DIR = "generated"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(GENERATED_DIR, exist_ok=True)


@app.post("/api/analyze")
async def analyze_data(
    query: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    """
    Executes complete 7-stage autonomous AI Data Analyst pipeline:
    Profiler -> Cleaning -> Validation -> Analysis -> Code Execution -> Answer Agent -> Report & PDF Export.
    """
    dataset_path = "data/retail_store_sales.csv"

    # Save uploaded CSV file if provided
    if file and file.filename:
        filename = file.filename
        if not filename.endswith(".csv"):
            raise HTTPException(status_code=400, detail="Only CSV files are supported.")
        save_path = os.path.join(UPLOAD_DIR, f"upload_{filename}")
        content = await file.read()
        with open(save_path, "wb") as f:
            f.write(content)
        dataset_path = save_path

    if not os.path.exists(dataset_path):
        raise HTTPException(status_code=404, detail=f"Dataset file not found: {dataset_path}")

    try:
        pipeline_res = run_full_analysis_pipeline(
            csv_path=dataset_path,
            user_query=query,
            verbose=True
        )

        chart_exists = bool(pipeline_res.get("chart_path") and os.path.exists(pipeline_res["chart_path"]))
        pdf_exists = bool(pipeline_res.get("pdf_path") and os.path.exists(pipeline_res["pdf_path"]))

        response_data = {
            "status": pipeline_res.get("status"),
            "user_query": pipeline_res.get("user_query"),
            "provider": pipeline_res.get("provider"),
            "initial_profile": pipeline_res.get("initial_profile"),
            "clean_validation": pipeline_res.get("clean_validation"),
            "cleaning_code": pipeline_res.get("cleaning_code"),
            "analysis_code": pipeline_res.get("analysis_code"),
            "analysis_explanation": pipeline_res.get("analysis_explanation"),
            "execution_result": pipeline_res.get("execution_result"),
            "result_type": pipeline_res.get("result_type"),
            "final_answer": pipeline_res.get("final_answer"),
            "chart_available": chart_exists,
            "chart_url": "/api/chart" if chart_exists else None,
            "pdf_available": pdf_exists,
            "pdf_url": "/api/download-pdf" if pdf_exists else None,
            "report_url": "/api/download-report",
            "report_content": pipeline_res.get("report_content"),
        }
        return JSONResponse(content=response_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution error: {str(e)}")


@app.get("/api/chart")
@app.get("/analysis_chart.png")
async def get_chart():
    """Serves the generated chart PNG image."""
    chart_path = os.path.abspath(os.path.join(GENERATED_DIR, "analysis_chart.png"))
    if not os.path.exists(chart_path):
        raise HTTPException(status_code=404, detail="Chart image not found.")
    return FileResponse(chart_path, media_type="image/png")



@app.get("/api/download-pdf")
async def download_pdf():
    """Downloads the generated PDF analysis report."""
    pdf_path = os.path.abspath(os.path.join(GENERATED_DIR, "analysis_report.pdf"))
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF report not found.")
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename="AI_Data_Analyst_Report.pdf"
    )


@app.get("/api/download-report")
async def download_report():
    """Downloads the generated Markdown analysis report."""
    report_path = os.path.abspath(os.path.join(GENERATED_DIR, "analysis_report.md"))
    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="Markdown report not found.")
    return FileResponse(
        report_path,
        media_type="text/markdown",
        filename="analysis_report.md"
    )


# Serve frontend static files if present (prefer compiled React build in dist/)
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="frontend")
elif os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

