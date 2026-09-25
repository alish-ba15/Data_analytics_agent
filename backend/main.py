import os
import sys
from typing import Any, Dict, Optional

# Ensure project root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from backend.chart_generator import ChartGenerator
from backend.cleaner import DataCleaner
from backend.code_executor import CodeExecutor
from backend.data_handler import DataHandler
from backend.llm import LLMHandler
from backend.pdf_exporter import PDFExporter
from backend.profiler import DatasetProfiler
from backend.report_generator import ReportGenerator


def run_full_analysis_pipeline(
    csv_path: str,
    user_query: str,
    provider: Optional[str] = None,
    model_name: Optional[str] = None,
    max_retries: int = 3,
    verbose: bool = True
) -> Dict[str, Any]:
    """
    Complete Multi-Agent Autonomous Architecture:
      1. Dataset Profiler
      2. Cleaning Agent (Groq)
      3. Code Executor & Validation -> Clean DataFrame
      4. User Question & Analysis Agent (Groq)
      5. Code Executor (with Self-Correction Loop) -> Actual Result
      6. Answer Agent (Groq) -> Final Answer
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset file not found at path: {csv_path}")

    if verbose:
        print("\n" + "=" * 75)
        print(" 📊 AI DATA ANALYST - AUTONOMOUS MULTI-AGENT PIPELINE")
        print("=" * 75)

    # --------------------------------------------------------------------------
    # STEP 1: Load Dataset & Run Dataset Profiler
    # --------------------------------------------------------------------------
    if verbose:
        print("\n[Step 1/6] 📁 Dataset Profiler: Analyzing raw dataset...")

    dh = DataHandler()
    dh.load_csv(csv_path)

    profiler = DatasetProfiler()
    initial_profile = profiler.profile(dh.df)

    if verbose:
        print(f"  • Raw Dataset Shape : {initial_profile['total_rows']} rows × {initial_profile['total_columns']} columns")
        print(f"  • Duplicate Rows    : {initial_profile['duplicate_rows']}")
        print(f"  • Detected Issues   : {len(initial_profile['detected_issues'])} issue(s)")
        for issue in initial_profile['detected_issues']:
            print(f"    - {issue}")

    # --------------------------------------------------------------------------
    # STEP 2 & 3: Cleaning Agent (Groq) -> Code Executor & Validation -> Clean DF
    # --------------------------------------------------------------------------
    if verbose:
        print("\n[Step 2/6] 🧹 Cleaning Agent (Groq): Generating cleaning strategy...")

    llm_handler = LLMHandler(provider=provider, model_name=model_name)
    cleaner = DataCleaner(llm_handler=llm_handler)
    clean_result = cleaner.clean_dataset(dh.df)

    clean_df = clean_result["clean_df"]
    cleaning_code = clean_result["cleaning_code"]
    validation = clean_result["validation"]

    if verbose:
        print(f"  • Cleaning Explanation:\n    {clean_result['explanation']}")
        print(f"  • Generated Cleaning Code:\n```python\n{cleaning_code}\n```")
        print("\n[Step 3/6] ⚙️ Code Executor & Validation: Validating Clean DataFrame...")
        print(f"  • Validation Status : {validation['status'].upper()}")
        print(f"  • Clean Dataset Shape: {clean_df.shape[0]} rows × {clean_df.shape[1]} columns (Rows removed: {validation['rows_removed']})")

    # --------------------------------------------------------------------------
    # STEP 4 & 5: Analysis Agent (Groq) -> Code Executor (Self-Correction Loop)
    # --------------------------------------------------------------------------
    if verbose:
        print(f"\n[Step 4/6] 🧠 Analysis Agent ({llm_handler.provider.upper()}): Generating analysis code for user query...")
        print(f"  • User Question: \"{user_query}\"")

    clean_dh = DataHandler()
    clean_dh.df = clean_df
    clean_schema_info = clean_dh.data_info()
    clean_sample_data = clean_dh.get_sample(n=5)

    executor = CodeExecutor()
    attempts_history = []
    current_code = ""
    current_explanation = ""
    exec_result = {}

    for attempt in range(1, max_retries + 1):
        if attempt == 1:
            llm_res = llm_handler.generate_code(
                schema_info=clean_schema_info,
                sample_data=clean_sample_data,
                user_query=user_query
            )
        else:
            prev_attempt = attempts_history[-1]
            if verbose:
                print(f"  • [Self-Correction Loop] Retrying attempt {attempt}/{max_retries} following error: {prev_attempt['error']}")
            llm_res = llm_handler.generate_corrected_code(
                schema_info=clean_schema_info,
                sample_data=clean_sample_data,
                user_query=user_query,
                failed_code=prev_attempt["code"],
                error_msg=prev_attempt["error"],
                traceback_str=prev_attempt.get("traceback")
            )

        current_code = llm_res.get("code", "")
        current_explanation = llm_res.get("explanation", "")

        # Execute code against clean DataFrame
        exec_result = executor.execute(current_code, clean_df)

        attempt_record = {
            "attempt": attempt,
            "code": current_code,
            "explanation": current_explanation,
            "status": exec_result.get("status"),
            "result": exec_result.get("result"),
            "error": exec_result.get("error"),
            "traceback": exec_result.get("traceback")
        }
        attempts_history.append(attempt_record)

        if exec_result.get("status") == "success":
            break

    if verbose:
        print(f"\n[Step 5/6] ⚡ Code Executor: Running analysis against Clean DataFrame...")
        print(f"  • Execution Status: {exec_result.get('status').upper()} (Attempts required: {len(attempts_history)})")
        print(f"  • Explanation:\n    {current_explanation}")
        print(f"  • Generated Pandas Code:\n```python\n{current_code}\n```")
        print(f"  • Actual Raw Output Data:\n    {exec_result.get('result')}")

    # --------------------------------------------------------------------------
    # STEP 6: Answer Agent (Groq) -> Final Answer Synthesis
    # --------------------------------------------------------------------------
    if verbose:
        print(f"\n[Step 6/7] 💬 Answer Agent ({llm_handler.provider.upper()}): Synthesizing final answer...")

    final_answer = None
    if exec_result.get("status") == "success":
        final_answer = llm_handler.generate_final_summary(
            user_query=user_query,
            code=current_code,
            execution_result=exec_result.get("result")
        )
    else:
        final_answer = f"Analysis failed after {len(attempts_history)} attempts. Last error: {exec_result.get('error')}"

    if verbose:
        print("\n" + "=" * 75)
        print(" 🎯 FINAL ANSWER")
        print("=" * 75)
        print(final_answer)
        print("=" * 75 + "\n")

    # --------------------------------------------------------------------------
    # STEP 7: Chart Generator, Report Generator & PDF Export
    # --------------------------------------------------------------------------
    if verbose:
        print(f"[Step 7/7] 🎨 Chart, Report & PDF Generator ({llm_handler.provider.upper()}): Creating visual charts, report & PDF...")

    # 1. Generate Chart Image via LLM Visualization Code Generator
    chart_gen = ChartGenerator(llm_handler=llm_handler)
    chart_res = chart_gen.generate_chart(exec_result.get("result"), user_query, llm_handler=llm_handler)
    chart_path = chart_res.get("chart_path")
    chart_embed = chart_res.get("markdown_embed", "")

    pipeline_summary = {
        "status": exec_result.get("status", "error"),
        "user_query": user_query,
        "initial_profile": initial_profile,
        "cleaning_code": cleaning_code,
        "clean_validation": validation,
        "analysis_code": current_code,
        "analysis_explanation": current_explanation,
        "execution_result": exec_result.get("result"),
        "result_type": exec_result.get("result_type"),
        "final_answer": final_answer,
        "attempts": len(attempts_history),
        "attempts_history": attempts_history,
        "provider": llm_handler.provider,
        "chart_path": chart_path,
        "chart_type": chart_res.get("chart_type")
    }

    # 2. Generate Markdown Report & Embed Chart
    report_gen = ReportGenerator(llm_handler=llm_handler)
    report_res = report_gen.generate_report(pipeline_summary)
    report_path = report_res.get("report_path", "")
    raw_md_content = report_res.get("report_content", "")

    # Combine markdown text with chart embed link if chart rendered
    if chart_embed and "![Analysis Chart]" not in raw_md_content:
        full_md_content = raw_md_content + chart_embed
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(full_md_content)
    else:
        full_md_content = raw_md_content

    # 3. Export PDF Report
    pdf_exporter = PDFExporter()
    pdf_res = pdf_exporter.export_pdf(full_md_content, chart_path=chart_path)
    pdf_path = pdf_res.get("pdf_path", "")

    if verbose:
        if chart_path:
            print(f"  • 📊 Chart Rendered To : {chart_path}")
        print(f"  • 📄 Markdown Report   : {report_path}")
        if pdf_path:
            print(f"  • 📕 PDF Report        : {pdf_path}\n")

    pipeline_summary["report_path"] = report_path
    pipeline_summary["pdf_path"] = pdf_path
    pipeline_summary["report_content"] = full_md_content
    return pipeline_summary


def main(query: Optional[str] = None):
    dataset_path = "data/retail_store_sales.csv"
    if not query:
        query = input("Enter your data analysis query: ")
    
    run_full_analysis_pipeline(dataset_path, query, verbose=True)


if __name__ == "__main__":
    main()