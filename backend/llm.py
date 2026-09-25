import os
import re
from typing import Dict, Any, Optional
from dotenv import load_dotenv

from backend.prompts import (
    SYSTEM_PROMPT,
    build_analysis_prompt,
    build_cleaning_prompt,
    build_correction_prompt,
    build_final_summary_prompt,
    build_report_prompt,
    build_chart_code_prompt
)

# Load environment variables from .env file
load_dotenv()


class LLMHandler:
    def __init__(
        self,
        provider: Optional[str] = None,
        model_name: Optional[str] = None,
        api_key: Optional[str] = None,
        temperature: float = 0.1,
    ):
        self.temperature = temperature
        self.provider = provider
        self.model_name = model_name
        self.api_key = api_key
        self.llm = None

        self._initialize_provider()

    def _initialize_provider(self):
        # Check explicit environment variable LLM_PROVIDER or PROVIDER
        env_provider = os.getenv("LLM_PROVIDER") or os.getenv("PROVIDER")
        target_provider = (self.provider or env_provider or "").lower()

        gemini_key = self.api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        openai_key = self.api_key or os.getenv("OPENAI_API_KEY")
        groq_key = self.api_key or os.getenv("GROQ_API_KEY")

        if target_provider == "mock":
            self._setup_mock_provider()
            return

        if target_provider == "groq":
            if groq_key and self._setup_groq_provider(groq_key):
                return

        if target_provider == "gemini":
            if gemini_key and self._setup_gemini_provider(gemini_key):
                return

        if target_provider == "openai":
            if openai_key and self._setup_openai_provider(openai_key):
                return

        # Auto-detect available keys (prefer Groq, then Gemini, then OpenAI)
        if groq_key and self._setup_groq_provider(groq_key):
            return

        if gemini_key and self._setup_gemini_provider(gemini_key):
            return

        if openai_key and self._setup_openai_provider(openai_key):
            return

        # Fallback to mock provider if no API keys are found or initialization failed
        print("[LLMHandler Info] No active LLM API keys found or provider setup failed. Using fallback mock code generator.")
        self._setup_mock_provider()

    def _setup_mock_provider(self):
        """Set provider to mock."""
        self.provider = "mock"
        self.llm = None

    def _setup_gemini_provider(self, api_key: str) -> bool:
        """Initialize Google Gemini via LangChain or google-generativeai."""
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            model = self.model_name or "gemini-3.6-flash"
            self.llm = ChatGoogleGenerativeAI(
                model=model,
                google_api_key=api_key,
                temperature=self.temperature
            )
            self.provider = "gemini"
            return True
        except Exception as e:
            print(f"[LLMHandler Warning] Failed to initialize Gemini provider: {e}")
            return False

    def _setup_openai_provider(self, api_key: str) -> bool:
        """Initialize OpenAI via LangChain."""
        try:
            from langchain_openai import ChatOpenAI
            model = self.model_name or "gpt-4o-mini"
            self.llm = ChatOpenAI(
                model=model,
                openai_api_key=api_key,
                temperature=self.temperature
            )
            self.provider = "openai"
            return True
        except Exception as e:
            print(f"[LLMHandler Warning] Failed to initialize OpenAI provider: {e}")
            return False

    def _setup_groq_provider(self, api_key: str) -> bool:
        """Initialize Groq provider via ChatGroq."""
        model = self.model_name or os.getenv("GROQ_MODEL") or "openai/gpt-oss-120b"
        try:
            from langchain_groq import ChatGroq
            self.llm = ChatGroq(
                model=model,
                groq_api_key=api_key,
                temperature=self.temperature
            )
            self.provider = "groq"
            return True
        except Exception as e:
            try:
                from langchain_groq import ChatGroq
                self.llm = ChatGroq(
                    model="qwen/qwen3.8-27b",
                    groq_api_key=api_key,
                    temperature=self.temperature
                )
                self.provider = "groq"
                return True
            except Exception as e2:
                print(f"[LLMHandler Warning] Failed to initialize Groq provider: {e} | {e2}")
                return False


    def generate_code(self, schema_info: dict, sample_data: list, user_query: str) -> Dict[str, Any]:
        user_prompt = build_analysis_prompt(schema_info, sample_data, user_query)

        if self.provider == "mock" or self.llm is None:
            raw_response = self._generate_mock_response(schema_info, user_query)
        else:
            raw_response = self._invoke_llm(user_prompt)

        parsed_output = self.extract_code_and_explanation(raw_response)
        parsed_output["raw_response"] = raw_response
        parsed_output["provider"] = self.provider
        return parsed_output

    def generate_cleaning_code(self, profile_info: dict, sample_data: list) -> Dict[str, Any]:
        """
        Generate Python data cleaning code based on dataset profiler report.
        """
        cleaning_prompt = build_cleaning_prompt(profile_info, sample_data)

        if self.provider == "mock" or self.llm is None:
            raw_response = """### Explanation
Data cleaning script removing duplicates and handling missing values.

```python
result = df.drop_duplicates().copy()
```
"""
        else:
            raw_response = self._invoke_llm(cleaning_prompt)

        parsed_output = self.extract_code_and_explanation(raw_response)
        parsed_output["raw_response"] = raw_response
        parsed_output["provider"] = self.provider
        return parsed_output

    def generate_chart_code(self, schema_info: dict, sample_data: list, user_query: str) -> Dict[str, Any]:
        """
        Generate Matplotlib/Seaborn visualization code directly via LLM.
        """
        chart_prompt = build_chart_code_prompt(schema_info, sample_data, user_query)

        if self.provider == "mock" or self.llm is None:
            raw_response = """### Explanation
Generate standard visualization for query.

```python
import matplotlib.pyplot as plt
import seaborn as sns

fig, ax = plt.subplots(figsize=(10, 5.5), dpi=150)
if len(df.columns) >= 2:
    sns.barplot(data=df, x=df.columns[0], y=df.columns[1], ax=ax)
plt.title(user_query)
plt.tight_layout()
plt.savefig('generated/analysis_chart.png', bbox_inches='tight', dpi=150)
plt.close()
```
"""
        else:
            raw_response = self._invoke_llm(chart_prompt)

        parsed_output = self.extract_code_and_explanation(raw_response)
        parsed_output["raw_response"] = raw_response
        parsed_output["provider"] = self.provider
        return parsed_output


    def generate_corrected_code(
        self,
        schema_info: dict,
        sample_data: list,
        user_query: str,
        failed_code: str,
        error_msg: str,
        traceback_str: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate corrected Python code when previous execution encountered an error.
        """
        correction_prompt = build_correction_prompt(
            schema_info=schema_info,
            sample_data=sample_data,
            user_query=user_query,
            failed_code=failed_code,
            error_msg=error_msg,
            traceback_str=traceback_str
        )

        if self.provider == "mock" or self.llm is None:
            raw_response = self._generate_mock_response(schema_info, user_query)
        else:
            raw_response = self._invoke_llm(correction_prompt)

        parsed_output = self.extract_code_and_explanation(raw_response)
        parsed_output["raw_response"] = raw_response
        parsed_output["provider"] = self.provider
        return parsed_output

    def generate_final_summary(
        self,
        user_query: str,
        code: str,
        execution_result: Any
    ) -> str:
        """
        Generate natural language summary / answer based on user query and execution output data.
        """
        summary_prompt = build_final_summary_prompt(user_query, code, execution_result)

        if self.provider == "mock" or self.llm is None:
            return f"Analysis result for '{user_query}': Query executed successfully returning data."

        try:
            return self._invoke_llm(summary_prompt)
        except Exception as e:
            print(f"[LLMHandler Warning] Final summary generation failed: {e}")
            return f"The query '{user_query}' was processed successfully and returned results."

    def generate_full_report(self, pipeline_result: dict) -> str:
        """
        Generate comprehensive Markdown Data Analysis Report for the entire pipeline run.
        """
        report_prompt = build_report_prompt(pipeline_result)

        if self.provider == "mock" or self.llm is None:
            user_query = pipeline_result.get("user_query", "")
            return f"# 📊 Data Analysis Report\n\n## Executive Summary\nProcessed query: '{user_query}'.\n"

        try:
            return self._invoke_llm(report_prompt)
        except Exception as e:
            print(f"[LLMHandler Warning] Full report generation failed: {e}")
            return f"# 📊 Data Analysis Report\n\n## Executive Summary\n{pipeline_result.get('final_answer', '')}\n"

    def _invoke_llm(self, user_prompt: str) -> str:
        """Invoke configured LangChain LLM instance with system prompt and user prompt."""
        try:
            from langchain_core.messages import SystemMessage, HumanMessage
            messages = [
                SystemMessage(content=SYSTEM_PROMPT),
                HumanMessage(content=user_prompt)
            ]
            response = self.llm.invoke(messages)
            content = getattr(response, "content", response)
            if isinstance(content, list):
                text_parts = []
                for item in content:
                    if isinstance(item, str):
                        text_parts.append(item)
                    elif isinstance(item, dict) and "text" in item:
                        text_parts.append(item["text"])
                    elif hasattr(item, "text"):
                        text_parts.append(getattr(item, "text"))
                    else:
                        text_parts.append(str(item))
                return "\n".join(text_parts)
            return str(content)
        except Exception as e:
            print(f"[LLMHandler Error] LLM invocation failed: {e}. Falling back to mock generator.")
            return self._generate_mock_response({}, "Fallback query due to LLM invocation error")

    def _generate_mock_response(self, schema_info: dict, user_query: str) -> str:
        """Generate mock response for offline/testing purposes."""
        columns = schema_info.get("columns", [])
        col_ref = f"['{columns[0]}']" if columns else ""
        
        return f"""### Explanation
This is generated analysis code based on your query: "{user_query}".
It filters and summarizes the loaded DataFrame `df` storing the output in `result`.

```python
# Analysis generated for: {user_query}
result = df.describe() if {bool(columns)} else df.head()
```
"""

    @staticmethod
    def extract_code_and_explanation(response_text: Any) -> Dict[str, str]:
        """
        Extract clean Python code and explanation from the LLM's response string.
        
        :param response_text: Raw markdown response from LLM
        :return: Dict with keys 'code' and 'explanation'
        """
        if not isinstance(response_text, str):
            if isinstance(response_text, list):
                response_text = "\n".join(str(item) for item in response_text)
            else:
                response_text = str(response_text)

        explanation = ""
        code = ""

        # Extract explanation block if present
        explanation_match = re.search(r"### Explanation\s*\n(.*?)(?=```|\Z)", response_text, re.DOTALL | re.IGNORECASE)
        if explanation_match:
            explanation = explanation_match.group(1).strip()

        # Extract python code block inside ```python ... ``` or ``` ... ```
        code_match = re.search(r"```(?:python)?\s*\n(.*?)```", response_text, re.DOTALL | re.IGNORECASE)
        if code_match:
            code = code_match.group(1).strip()
        else:
            # Fallback if model didn't use backticks properly: use text after explanation or raw text
            if "### Explanation" in response_text:
                parts = response_text.split("### Explanation")
                if len(parts) > 1:
                    lines = parts[1].strip().split("\n")
                    # Try to separate prose from code
                    code_lines = [l for l in lines if not l.startswith("#") and ("=" in l or "." in l)]
                    code = "\n".join(code_lines) if code_lines else response_text
            else:
                code = response_text.strip()

        # Remove any lingering fence markers
        code = re.sub(r"^```python\s*", "", code, flags=re.IGNORECASE)
        code = re.sub(r"^```\s*", "", code)
        code = re.sub(r"\s*```$", "", code).strip()

        if not explanation and not code_match:
            explanation = "Code generated directly from natural language query."

        return {
            "code": code,
            "explanation": explanation
        }
