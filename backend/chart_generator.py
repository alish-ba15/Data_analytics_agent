from datetime import datetime
import os
from typing import Any, Dict, Optional
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for server/CLI compatibility
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

from backend.code_executor import CodeExecutor


class ChartGenerator:
    """
    Dynamically generates, styles, and exports high-resolution data visualizations
    using LLM-driven Matplotlib/Seaborn code generation with automated fallbacks.
    """

    def __init__(self, style_theme: str = "dark", llm_handler: Optional[Any] = None):
        self.style_theme = style_theme
        self.llm_handler = llm_handler
        self._set_style()

    def _set_style(self):
        """Applies modern aesthetic styling to matplotlib/seaborn charts."""
        plt.style.use("seaborn-v0_8-darkgrid" if "dark" in plt.style.available else "default")
        sns.set_palette("muted")
        plt.rcParams["font.family"] = "sans-serif"
        plt.rcParams["font.sans-serif"] = ["DejaVu Sans", "Segoe UI", "Arial"]
        plt.rcParams["axes.edgecolor"] = "#cccccc"
        plt.rcParams["axes.linewidth"] = 0.8

    def generate_chart(
        self,
        execution_result: Any,
        user_query: str,
        output_dir: str = "generated",
        filename: str = "analysis_chart.png",
        llm_handler: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Generates appropriate chart based on executed data results using LLM code generation.
        """
        os.makedirs(output_dir, exist_ok=True)
        chart_path = os.path.abspath(os.path.join(output_dir, filename))

        df = self._to_dataframe(execution_result)
        if df is None or df.empty or len(df.columns) < 2:
            return {
                "status": "skipped",
                "chart_path": None,
                "chart_type": None,
                "markdown_embed": "",
                "message": "Result data is scalar or insufficient for chart generation."
            }

        active_llm = llm_handler or self.llm_handler

        # 1. Attempt LLM-Driven Dynamic Chart Code Generation
        if active_llm and hasattr(active_llm, "generate_chart_code"):
            try:
                schema_info = {
                    "columns": df.columns.tolist(),
                    "dtypes": df.dtypes.apply(str).to_dict()
                }
                sample_data = df.head(5).to_dict(orient="records")

                llm_output = active_llm.generate_chart_code(schema_info, sample_data, user_query)
                chart_code = llm_output.get("code", "")

                if chart_code:
                    executor = CodeExecutor()
                    # Pre-inject output path into scope
                    additional_scope = {
                        "plt": plt,
                        "sns": sns,
                        "output_path": chart_path
                    }
                    exec_res = executor.execute(chart_code, df=df, additional_scope=additional_scope)

                    if exec_res.get("success") and os.path.exists(chart_path):
                        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
                        timestamped_filename = f"chart_{timestamp_str}.png"
                        timestamped_path = os.path.abspath(os.path.join(output_dir, timestamped_filename))

                        try:
                            import shutil
                            shutil.copy(chart_path, timestamped_path)
                        except Exception:
                            pass

                        return {
                            "status": "success",
                            "chart_path": chart_path,
                            "timestamped_path": timestamped_path,
                            "chart_type": "llm_generated",
                            "markdown_embed": f"\n\n![{user_query} Chart]({filename})\n\n",
                            "chart_code": chart_code
                        }
            except Exception as e:
                print(f"[ChartGenerator LLM Warning] LLM chart generation encountered error: {e}. Using intelligent fallback.")

        # 2. Heuristic Dynamic Fallback Rendering
        return self._render_fallback_chart(df, user_query, output_dir, filename)

    def _render_fallback_chart(
        self,
        df: pd.DataFrame,
        user_query: str,
        output_dir: str,
        filename: str
    ) -> Dict[str, Any]:
        """Renders standard Seaborn/Matplotlib graphic as a fallback."""
        chart_type, x_col, y_col = self._detect_chart_type(df, user_query)
        fig, ax = plt.subplots(figsize=(10, 5.5), dpi=150)
        fig.patch.set_facecolor("#1e1e2f")
        ax.set_facecolor("#282a36")

        try:
            if chart_type == "bar":
                bars = sns.barplot(
                    data=df, x=x_col, y=y_col, hue=x_col, legend=False, ax=ax, palette="Blues_r"
                )
                plt.xticks(rotation=30, ha="right", color="#f8f8f2")
                ax.bar_label(bars.containers[0], fmt="%.1f", padding=3, color="#f8f8f2", fontsize=9)

            elif chart_type == "horizontal_bar":
                bars = sns.barplot(
                    data=df, x=y_col, y=x_col, hue=x_col, legend=False, ax=ax, palette="Purples_r"
                )
                plt.yticks(color="#f8f8f2")
                ax.bar_label(bars.containers[0], fmt="%.1f", padding=3, color="#f8f8f2", fontsize=9)

            elif chart_type == "line":
                sns.lineplot(
                    data=df, x=x_col, y=y_col, ax=ax, marker="o", linewidth=2.5, color="#50fa7b"
                )
                plt.xticks(rotation=30, ha="right", color="#f8f8f2")

            elif chart_type == "pie":
                ax.pie(
                    df[y_col],
                    labels=df[x_col],
                    autopct="%1.1f%%",
                    startangle=140,
                    textprops={"color": "#f8f8f2"},
                    colors=sns.color_palette("pastel")
                )
            else:
                sns.barplot(data=df, x=x_col, y=y_col, ax=ax, palette="viridis")

            if chart_type != "pie":
                ax.set_title(user_query.strip("?").capitalize(), fontsize=13, fontweight="bold", color="#f8f8f2", pad=15)
                ax.set_xlabel(str(x_col).replace("_", " ").title(), fontsize=10, fontweight="bold", color="#8be9fd")
                ax.set_ylabel(str(y_col).replace("_", " ").title(), fontsize=10, fontweight="bold", color="#8be9fd")
                ax.tick_params(colors="#f8f8f2")
                ax.grid(True, linestyle="--", alpha=0.3, color="#6272a4")
            else:
                ax.set_title(user_query.strip("?").capitalize(), fontsize=13, fontweight="bold", color="#f8f8f2", pad=15)

            plt.tight_layout()

            chart_path = os.path.abspath(os.path.join(output_dir, filename))
            plt.savefig(chart_path, facecolor=fig.get_facecolor(), edgecolor="none")

            timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
            timestamped_filename = f"chart_{timestamp_str}.png"
            timestamped_path = os.path.abspath(os.path.join(output_dir, timestamped_filename))
            plt.savefig(timestamped_path, facecolor=fig.get_facecolor(), edgecolor="none")

            plt.close(fig)

            return {
                "status": "success",
                "chart_path": chart_path,
                "timestamped_path": timestamped_path,
                "chart_type": chart_type,
                "markdown_embed": f"\n\n![{user_query} Chart]({filename})\n\n"
            }

        except Exception as e:
            plt.close(fig)
            return {
                "status": "error",
                "chart_path": None,
                "chart_type": None,
                "markdown_embed": "",
                "message": str(e)
            }

    def _to_dataframe(self, execution_result: Any) -> Optional[pd.DataFrame]:
        """Converts varied execution result types into a standard 2D pandas DataFrame."""
        if isinstance(execution_result, list) and execution_result:
            if isinstance(execution_result[0], dict):
                return pd.DataFrame(execution_result)
        elif isinstance(execution_result, pd.DataFrame):
            return execution_result.reset_index()
        elif isinstance(execution_result, pd.Series):
            return execution_result.reset_index()
        return None

    def _detect_chart_type(self, df: pd.DataFrame, query: str) -> tuple:
        """Determines default chart style and returns (chart_type, x_col, y_col)."""
        cols = df.columns.tolist()
        x_col = cols[0]
        y_col = cols[1] if len(cols) > 1 else cols[0]

        numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
        non_numeric_cols = [c for c in cols if c not in numeric_cols]

        if non_numeric_cols and numeric_cols:
            x_col = non_numeric_cols[0]
            y_col = numeric_cols[0]
        elif len(numeric_cols) >= 2:
            x_col = numeric_cols[0]
            y_col = numeric_cols[1]

        query_lower = query.lower()
        if any(term in query_lower for term in ["time", "date", "trend", "month", "year", "over time", "daily"]):
            return "line", x_col, y_col

        if len(df) <= 5 and any(term in query_lower for term in ["share", "percentage", "proportion", "distribution"]):
            return "pie", x_col, y_col

        if df[x_col].astype(str).str.len().mean() > 15:
            return "horizontal_bar", x_col, y_col

        return "bar", x_col, y_col
