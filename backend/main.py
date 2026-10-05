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

from typing import Any, Dict, Optional, TypedDict
from langgraph.graph import StateGraph, END



class PipelineState(TypedDict, total=False):
    csv_path: str
    user_query: str
    raw_df: Any
    clean_df: Any
    initial_profile: dict
    cleaning_code: str
    cleaning_explanation: str
    validation: dict
    schema_info: dict
    sample_data: list
    code: str
    explanation: str
    exec_result: dict
    attempts_history: list
    final_answer: str
    pipeline_summary: dict


def build_graph(llm: LLMHandler, max_retries: int = 3):
    executor = CodeExecutor()

    def profile_node(state):
        print("\n[Node: profile] Loading and profiling dataset...")
        dh = DataHandler()
        dh.load_csv(state["csv_path"])
        return {"raw_df": dh.df, "initial_profile": DatasetProfiler().profile(dh.df)}

    def clean_node(state):
        print("[Node: clean] Cleaning agent running...")
        res = DataCleaner(llm_handler=llm).clean_dataset(state["raw_df"])
        dh = DataHandler()
        dh.df = res["clean_df"]
        return {
            "clean_df": res["clean_df"],
            "cleaning_code": res["cleaning_code"],
            "cleaning_explanation": res["explanation"],
            "validation": res["validation"],
            "schema_info": dh.data_info(),
            "sample_data": dh.get_sample(n=5),
            "attempts_history": [],
        }

    def generate_node(state):
        history = state["attempts_history"]
        if not history:
            print("[Node: generate] Writing analysis code...")
            r = llm.generate_code(
                schema_info=state["schema_info"],
                sample_data=state["sample_data"],
                user_query=state["user_query"],
            )
        else:
            prev = history[-1]
            print(f"[Node: generate] Correcting code (attempt {len(history) + 1})...")
            r = llm.generate_corrected_code(
                schema_info=state["schema_info"],
                sample_data=state["sample_data"],
                user_query=state["user_query"],
                failed_code=prev["code"],
                error_msg=prev["error"],
                traceback_str=prev.get("traceback"),
            )
        return {"code": r.get("code", ""), "explanation": r.get("explanation", "")}

    def execute_node(state):
        print("[Node: execute] Running code on clean dataframe...")
        res = executor.execute(state["code"], state["clean_df"])
        record = {
            "attempt": len(state["attempts_history"]) + 1,
            "code": state["code"],
            "explanation": state["explanation"],
            "status": res.get("status"),
            "result": res.get("result"),
            "error": res.get("error"),
            "traceback": res.get("traceback"),
        }
        return {"exec_result": res, "attempts_history": state["attempts_history"] + [record]}

    def route_after_execute(state):
        if state["exec_result"].get("status") == "success":
            return "answer"
        if len(state["attempts_history"]) >= max_retries:
            return "answer"
        return "generate"          # loop back = self-correction

    def answer_node(state):
        print("[Node: answer] Synthesizing final answer...")
        res = state["exec_result"]
        if res.get("status") == "success":
            ans = llm.generate_final_summary(
                user_query=state["user_query"],
                code=state["code"],
                execution_result=res.get("result"),
            )
        else:
            ans = (f"Analysis failed after {len(state['attempts_history'])} attempts. "
                   f"Last error: {res.get('error')}")
        return {"final_answer": ans}

    def report_node(state):
        print("[Node: report] Chart, report and PDF...")
        res = state["exec_result"]
        chart_res = ChartGenerator(llm_handler=llm).generate_chart(
            res.get("result"), state["user_query"], llm_handler=llm
        )
        chart_path = chart_res.get("chart_path")

        summary = {
            "status": res.get("status", "error"),
            "user_query": state["user_query"],
            "initial_profile": state["initial_profile"],
            "cleaning_code": state["cleaning_code"],
            "clean_validation": state["validation"],
            "analysis_code": state["code"],
            "analysis_explanation": state["explanation"],
            "execution_result": res.get("result"),
            "result_type": res.get("result_type"),
            "final_answer": state["final_answer"],
            "attempts": len(state["attempts_history"]),
            "attempts_history": state["attempts_history"],
            "provider": llm.provider,
            "chart_path": chart_path,
            "chart_type": chart_res.get("chart_type"),
        }

        rep = ReportGenerator(llm_handler=llm).generate_report(summary)
        report_path = rep.get("report_path", "")
        md = rep.get("report_content", "")
        embed = chart_res.get("markdown_embed", "")
        if embed and "![Analysis Chart]" not in md:
            md += embed
            with open(report_path, "w", encoding="utf-8") as f:
                f.write(md)

        pdf_path = PDFExporter().export_pdf(md, chart_path=chart_path).get("pdf_path", "")
        summary.update(report_path=report_path, pdf_path=pdf_path, report_content=md)
        return {"pipeline_summary": summary}

    g = StateGraph(PipelineState)
    g.add_node("profile", profile_node)
    g.add_node("clean", clean_node)
    g.add_node("generate", generate_node)
    g.add_node("execute", execute_node)
    g.add_node("answer", answer_node)
    g.add_node("report", report_node)

    g.set_entry_point("profile")
    g.add_edge("profile", "clean")
    g.add_edge("clean", "generate")
    g.add_edge("generate", "execute")
    g.add_conditional_edges("execute", route_after_execute,
                            {"generate": "generate", "answer": "answer"})
    g.add_edge("answer", "report")
    g.add_edge("report", END)
    return g.compile()


def run_full_analysis_pipeline(csv_path, user_query, provider=None,
                               model_name=None, max_retries=3, verbose=True):
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset file not found at path: {csv_path}")
    llm = LLMHandler(provider=provider, model_name=model_name)
    graph = build_graph(llm, max_retries=max_retries)
    final = graph.invoke({"csv_path": csv_path, "user_query": user_query})
    return final["pipeline_summary"]

def main(query: Optional[str] = None):
    dataset_path = "data/retail_store_sales.csv"
    if not query:
        query = input("Enter your data analysis query: ")
    
    run_full_analysis_pipeline(dataset_path, query, verbose=True)


if __name__ == "__main__":
    main()