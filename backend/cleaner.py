from typing import Any, Dict, Optional
import pandas as pd

from backend.code_executor import CodeExecutor
from backend.llm import LLMHandler
from backend.profiler import DatasetProfiler


class DataCleaner:
    """
    Orchestrates automated dataset cleaning using Groq LLM cleaning code generation,
    executes cleaning code via CodeExecutor, and validates the clean DataFrame.
    """

    def __init__(self, llm_handler: Optional[LLMHandler] = None):
        self.llm_handler = llm_handler or LLMHandler()
        self.profiler = DatasetProfiler()
        self.executor = CodeExecutor()

    def clean_dataset(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Executes complete cleaning & validation workflow.

        :param df: Raw input pandas DataFrame
        :return: Dict containing clean_df, cleaning_code, explanation, initial_profile, and validation_status
        """
        if not isinstance(df, pd.DataFrame):
            raise ValueError("Input must be a valid pandas DataFrame.")

        # Step 1: Profile initial dataset
        initial_profile = self.profiler.profile(df)
        sample_data = df.head(5).to_dict(orient="records")

        # Step 2: Generate cleaning code via Groq Cleaning Agent
        cleaning_res = self.llm_handler.generate_cleaning_code(initial_profile, sample_data)
        cleaning_code = cleaning_res.get("code", "")
        explanation = cleaning_res.get("explanation", "")

        # Fallback cleaning code if LLM didn't produce code
        if not cleaning_code or not cleaning_code.strip():
            cleaning_code = "result = df.drop_duplicates().copy()"
            explanation = "Fallback cleaning: Dropped duplicate rows."

        # Step 3: Execute cleaning code against DataFrame
        exec_res = self.executor.execute(cleaning_code, df)

        if exec_res.get("status") != "success":
            print(f"[DataCleaner Warning] Executing generated cleaning code failed: {exec_res.get('error')}. Applying default fallback cleaning.")
            clean_df = df.drop_duplicates().copy()
            cleaning_code = "result = df.drop_duplicates().copy()"
        else:
            raw_result = exec_res.get("result")
            # If executor sanitized result to dict records, convert back to DataFrame
            if isinstance(raw_result, list):
                clean_df = pd.DataFrame(raw_result)
            elif isinstance(exec_res.get("raw_result_type"), str) and exec_res.get("raw_result_type") == "DataFrame":
                # Fallback if raw result variable in executor execution scope was DataFrame
                clean_df = pd.DataFrame(raw_result)
            else:
                clean_df = df.drop_duplicates().copy()

        # Step 4: Validate Clean DataFrame
        cleaned_profile = self.profiler.profile(clean_df)

        validation_info = {
            "status": "validated",
            "initial_rows": initial_profile["total_rows"],
            "cleaned_rows": cleaned_profile["total_rows"],
            "rows_removed": initial_profile["total_rows"] - cleaned_profile["total_rows"],
            "initial_duplicates": initial_profile["duplicate_rows"],
            "cleaned_duplicates": cleaned_profile["duplicate_rows"],
            "initial_nulls": sum(initial_profile["missing_counts"].values()),
            "cleaned_nulls": sum(cleaned_profile["missing_counts"].values()),
        }

        return {
            "status": "success",
            "clean_df": clean_df,
            "cleaning_code": cleaning_code,
            "explanation": explanation,
            "initial_profile": initial_profile,
            "cleaned_profile": cleaned_profile,
            "validation": validation_info,
            "provider": cleaning_res.get("provider"),
        }
