from datetime import datetime
import os
from typing import Any, Dict, Optional

from backend.llm import LLMHandler


class ReportGenerator:
    """
    Synthesizes complete pipeline findings (dataset profile, cleaning log, analysis code,
    executed data, and final answer) into a professional Markdown analysis report file.
    """

    def __init__(self, llm_handler: Optional[LLMHandler] = None):
        self.llm_handler = llm_handler or LLMHandler()

    def generate_report(
        self,
        pipeline_result: Dict[str, Any],
        output_dir: str = "generated",
        filename: str = "analysis_report.md"
    ) -> Dict[str, Any]:
        """
        Generates and saves the Markdown Data Analysis Report.

        :param pipeline_result: Dictionary output from run_full_analysis_pipeline
        :param output_dir: Directory where reports will be saved
        :param filename: Target report filename
        :return: Dict containing report_path and report_content
        """
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)

        # Generate report content via Groq Report Agent
        report_content = self.llm_handler.generate_full_report(pipeline_result)

        # Target file path
        report_path = os.path.abspath(os.path.join(output_dir, filename))

        # Write report content to file
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(report_content)

        # Also write a timestamped copy for record keeping
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        timestamped_filename = f"report_{timestamp_str}.md"
        timestamped_path = os.path.abspath(os.path.join(output_dir, timestamped_filename))

        with open(timestamped_path, "w", encoding="utf-8") as f:
            f.write(report_content)

        return {
            "status": "success",
            "report_path": report_path,
            "timestamped_report_path": timestamped_path,
            "report_content": report_content,
        }
