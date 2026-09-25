import os
import sys

# Ensure root project path is importable
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.main import run_full_analysis_pipeline


def main():
    dataset_path = "data/retail_store_sales.csv"
    print("\n------------------------------------------------------------")
    print(" 🤖 AI DATA ANALYST AGENT (Groq Powered)")
    print("------------------------------------------------------------")
    
    query = input("\nEnter your data query (or type 'exit' to quit): ").strip()
    if not query or query.lower() == "exit":
        print("Exiting AI Data Analyst. Goodbye!")
        return

    run_full_analysis_pipeline(dataset_path, query, verbose=True)


if __name__ == "__main__":
    main()
