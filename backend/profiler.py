from typing import Any, Dict
import pandas as pd


class DatasetProfiler:
    """
    Analyzes raw pandas DataFrames and generates comprehensive data quality,
    missing values, duplicate rows, data types, and potential issue reports.
    """

    def profile(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Extract detailed dataset profile.

        :param df: Target pandas DataFrame
        :return: Dict containing shape, columns, dtypes, missing values, duplicates, and issues
        """
        if not isinstance(df, pd.DataFrame):
            raise ValueError("Input must be a valid pandas DataFrame.")

        total_rows, total_cols = df.shape
        missing_counts = df.isnull().sum().to_dict()
        missing_percentages = (df.isnull().sum() / total_rows * 100).round(2).to_dict()
        duplicate_count = int(df.duplicated().sum())

        dtypes_str = df.dtypes.apply(lambda x: str(x)).to_dict()

        # Detected data quality issues
        detected_issues = []
        if duplicate_count > 0:
            detected_issues.append(f"Detected {duplicate_count} duplicate rows.")

        cols_with_nulls = [col for col, count in missing_counts.items() if count > 0]
        if cols_with_nulls:
            detected_issues.append(f"Missing values found in columns: {', '.join(cols_with_nulls)}.")

        # Check for potential date string columns
        date_candidates = []
        for col in df.select_dtypes(include=["object", "string"]).columns:
            sample_vals = df[col].dropna().head(5).astype(str).tolist()
            if any("-" in val or "/" in val for val in sample_vals):
                date_candidates.append(col)

        if date_candidates:
            detected_issues.append(f"Potential date/datetime columns in string format: {', '.join(date_candidates)}.")

        # Summary statistics
        numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()

        return {
            "shape": (total_rows, total_cols),
            "total_rows": total_rows,
            "total_columns": total_cols,
            "duplicate_rows": duplicate_count,
            "dtypes": dtypes_str,
            "missing_counts": missing_counts,
            "missing_percentages": missing_percentages,
            "columns_with_missing": cols_with_nulls,
            "numeric_columns": numeric_cols,
            "detected_issues": detected_issues,
        }
