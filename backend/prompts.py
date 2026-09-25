"""
Prompt templates and builders for the AI Data Analyst LLM integration.
"""

SYSTEM_PROMPT = SYSTEM_PROMPT = """You are an autonomous AI Data Analyst.

Your task is to understand a user's natural-language question about
the provided dataset and independently determine what analysis is
required to answer it.

You are responsible for deciding:

* Which dataset columns are relevant.
* What calculations or transformations are required.
* Whether filtering, grouping, aggregation, sorting, ranking,
  comparison, date operations, or other Pandas operations are needed.
* What the final result should contain.

Do not rely on predefined query-to-operation rules.
Do not assume that a particular type of question always requires
a particular implementation.
Determine the appropriate analytical approach from the meaning of
the user's question and the available dataset.

DATASET ENVIRONMENT:

* The dataset is already loaded into a pandas DataFrame named `df`.
* `pandas` is available as `pd`.
* `numpy` is available as `np`.
* Do not load files or external data.
* Do not use `pd.read_csv()`, `open()`, file paths, databases,
  APIs, or other external data sources.
* Use only columns that actually exist in the provided dataset schema.

CODE REQUIREMENTS:

* Generate executable Python/Pandas code.
* The code must directly answer the user's question.
* Store the final analytical output in a variable named `result`.
* Do not generate placeholder, dummy, demonstration, or unrelated code.
* Do not perform generic exploratory analysis unless the user asks
  for it.
* Do not use `df.describe()`, `df.head()`, or `df.info()` as a
  substitute for answering the user's question.
* Do not unnecessarily modify the original `df`.
* Keep the code concise and readable.
* Do not include unnecessary imports because `pd`, `np`, and `df`
  are already available.

Before generating the code, internally determine:

1. What the user is actually asking.
2. Which information from the dataset is needed.
3. What analytical operations are necessary.
4. What form the final result should take.

Then generate only the analysis required to answer the question.

OUTPUT FORMAT:

### Explanation

<Brief explanation of the analytical approach chosen>

```python
# Python pandas analysis code
<executable code>
```

"""


def build_analysis_prompt(schema_info: dict, sample_data: list, user_query: str) -> str:
    columns = schema_info.get("columns", [])
    dtypes = schema_info.get("dtypes", {})
    shape = schema_info.get("shape", (0, 0))

    columns_formatted = "\n".join(
        [f"  - {col}: {dtypes.get(col, 'unknown')}" for col in columns]
    )

    import json

    try:
        sample_formatted = json.dumps(
            sample_data,
            indent=2,
            default=str
        )
    except Exception:
        sample_formatted = str(sample_data)

    prompt = f"""DATASET INFORMATION:

Shape:
{shape[0]} rows × {shape[1]} columns

Columns and Data Types:
{columns_formatted}

Sample Data:
{sample_formatted}

USER QUESTION:
"{user_query}"

Determine independently what analysis is required to answer the
user's question using this dataset.

Use the dataset schema and sample data to identify the relevant
columns and choose the appropriate analytical approach.

Do not follow predefined analysis patterns.
Do not generate generic exploratory analysis.
Generate only the Python/Pandas code necessary to answer the
user's question.

The DataFrame is already available as `df`.
Store the final output in `result`.

Follow the required output format from the system instructions.
"""

    return prompt


def build_correction_prompt(
    schema_info: dict,
    sample_data: list,
    user_query: str,
    failed_code: str,
    error_msg: str,
    traceback_str: Optional[str] = None
) -> str:
    columns = schema_info.get("columns", [])
    dtypes = schema_info.get("dtypes", {})
    shape = schema_info.get("shape", (0, 0))
    columns_formatted = "\n".join([f"  - {col}: {dtypes.get(col, 'unknown')}" for col in columns])

    import json
    try:
        sample_formatted = json.dumps(sample_data, indent=2, default=str)
    except Exception:
        sample_formatted = str(sample_data)

    tb_section = f"\nTRACEBACK:\n{traceback_str}" if traceback_str else ""

    prompt = f"""DATASET INFORMATION:
Shape: {shape[0]} rows × {shape[1]} columns
Columns and Data Types:
{columns_formatted}

Sample Data:
{sample_formatted}

USER QUESTION:
"{user_query}"

THE PREVIOUSLY GENERATED CODE FAILED WITH AN ERROR.

FAILED CODE:
```python
{failed_code}
```

ERROR ENCOUNTERED:
{error_msg}{tb_section}

TASK:
Analyze why the previous Python code failed (e.g., KeyError on column names, syntax error, incorrect groupby reset_index, datatype mismatch, etc.).
Fix the error and generate the corrected Python/Pandas code that runs error-free against `df` and stores the output in `result`.

Follow the required output format from the system instructions.
"""
    return prompt


def build_final_summary_prompt(
    user_query: str,
    code: str,
    execution_result: Any
) -> str:
    import json
    try:
        result_formatted = json.dumps(execution_result, indent=2, default=str)
    except Exception:
        result_formatted = str(execution_result)

    prompt = f"""USER QUESTION:
"{user_query}"

EXECUTED PANDAS CODE:
```python
{code}
```

EXECUTION RESULT DATA:
{result_formatted}

TASK:
Based on the execution result data above, provide a clear, professional, and concise natural-language answer to the user's question.
- Directly answer the question with numbers, categories, or metrics from the result data.
- Format key details cleanly (e.g. using bullet points or bold text).
- Do not mention code implementation details or variable names unless necessary.
"""
    return prompt


def build_cleaning_prompt(
    profile_info: dict,
    sample_data: list
) -> str:
    import json
    shape = profile_info.get("shape", (0, 0))
    dtypes = profile_info.get("dtypes", {})
    missing_counts = profile_info.get("missing_counts", {})
    duplicate_rows = profile_info.get("duplicate_rows", 0)
    detected_issues = profile_info.get("detected_issues", [])

    issues_formatted = "\n".join([f"  - {issue}" for issue in detected_issues]) if detected_issues else "  - None detected."

    try:
        sample_formatted = json.dumps(sample_data, indent=2, default=str)
    except Exception:
        sample_formatted = str(sample_data)

    prompt = f"""DATASET PROFILING REPORT:
Shape: {shape[0]} rows × {shape[1]} columns
Duplicate Rows: {duplicate_rows}
Data Types: {json.dumps(dtypes, indent=2)}
Missing Value Counts: {json.dumps(missing_counts, indent=2)}

DETECTED DATA QUALITY ISSUES:
{issues_formatted}

SAMPLE DATA:
{sample_formatted}

TASK:
Generate clean Python Pandas code to clean the dataset `df` and store the clean DataFrame in `result`.
- Fill or handle missing values appropriately.
- Remove duplicate rows if any exist (`df.drop_duplicates()`).
- Convert string date columns to proper pandas datetime (`pd.to_datetime`).
- Strip leading/trailing whitespaces from string columns.
- Ensure all column names remain intact and valid.
- Store the final clean DataFrame in `result`.

OUTPUT FORMAT:
### Explanation
<Brief explanation of the data cleaning operations performed>

```python
# Python pandas cleaning code
<executable code>
```
"""
    return prompt


def build_report_prompt(
    pipeline_result: dict
) -> str:
    import json
    user_query = pipeline_result.get("user_query", "")
    initial_profile = pipeline_result.get("initial_profile", {})
    clean_validation = pipeline_result.get("clean_validation", {})
    cleaning_code = pipeline_result.get("cleaning_code", "")
    analysis_code = pipeline_result.get("analysis_code", "")
    execution_result = pipeline_result.get("execution_result", None)
    final_answer = pipeline_result.get("final_answer", "")

    try:
        exec_formatted = json.dumps(execution_result, indent=2, default=str)
    except Exception:
        exec_formatted = str(execution_result)

    prompt = f"""USER QUESTION:
"{user_query}"

DATASET PROFILER SUMMARY:
- Raw Shape: {initial_profile.get('total_rows', 0)} rows × {initial_profile.get('total_columns', 0)} columns
- Duplicates Found: {initial_profile.get('duplicate_rows', 0)}
- Data Quality Issues: {json.dumps(initial_profile.get('detected_issues', []), indent=2)}

DATA CLEANING VALIDATION:
- Validation Status: {clean_validation.get('status', 'unknown')}
- Clean Rows: {clean_validation.get('cleaned_rows', 0)}
- Cleaning Code:
```python
{cleaning_code}
```

ANALYSIS METHODOLOGY & CODE:
```python
{analysis_code}
```

EXECUTED RESULT DATA:
{exec_formatted}

SYNTHESIZED ANSWER:
{final_answer}

TASK:
Generate a comprehensive, beautifully structured Markdown Data Analysis Report.
Format the report with clear section headings, tables, bullet points, and callouts:

# 📊 Executive Data Analysis Report

## 1. Executive Summary
- Brief high-level summary of the analysis findings and direct answer to the user's question.

## 2. Dataset Overview & Data Quality Profile
- Raw dataset dimensions, missing values, duplicates, and quality issues identified.

## 3. Data Cleaning & Validation Summary
- Summary of cleaning transformations performed and validation metrics.

## 4. User Query & Analytical Approach
- Natural language question and analytical methodology implemented in Pandas.

## 5. Python Analysis Code & Executed Data Output
- Formatted Python analysis code and structured data findings table.

## 6. Key Insights & Strategic Recommendations
- Actionable business insights and recommendations based on the findings.

Write the entire report in GitHub Flavored Markdown format.
"""
    return prompt


def build_chart_code_prompt(schema_info: dict, sample_data: list, user_query: str) -> str:
    columns = schema_info.get("columns", [])
    dtypes = schema_info.get("dtypes", {})

    columns_formatted = "\n".join(
        [f"  - {col}: {dtypes.get(col, 'unknown')}" for col in columns]
    )

    import json
    try:
        sample_formatted = json.dumps(sample_data, indent=2, default=str)
    except Exception:
        sample_formatted = str(sample_data)

    prompt = f"""DATASET INFORMATION FOR VISUALIZATION:

Columns and Data Types:
{columns_formatted}

Sample Data:
{sample_formatted}

USER QUERY / VISUALIZATION REQUEST:
"{user_query}"

TASK:
Write Python visualization code using `matplotlib.pyplot as plt` and `seaborn as sns` to create an appropriate, high-resolution data visualization chart for this query and data.

REQUIREMENTS:
1. The target data is already loaded in DataFrame `df`.
2. Select the best chart type dynamically based on the query and dataset (bar chart, line chart, scatter plot, pie chart, boxplot, heatmap, histogram, etc.).
3. Apply modern aesthetic styling:
   - Use clean title, clear axis labels, styled ticks, legend (if applicable), and grid lines.
   - Use vibrant color palettes.
4. Save the generated figure to `generated/analysis_chart.png` using:
   `plt.tight_layout()`
   `plt.savefig('generated/analysis_chart.png', bbox_inches='tight', dpi=150)`
   `plt.close()`
5. Store any returned figure object in `result`.

OUTPUT FORMAT:
### Explanation
<Brief rationale for the chosen visualization style>

```python
# Matplotlib / Seaborn visualization code
import matplotlib.pyplot as plt
import seaborn as sns

# Code to generate and save chart to generated/analysis_chart.png
```
"""
    return prompt