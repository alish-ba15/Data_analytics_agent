import pandas as pd

class DataHandler:
    def __init__(self):
        self.df = None
        self.encoding_used = None

    
    def load_csv(self, file_path: str):
        encodings = ["utf-8", "utf-8-sig", "cp1252", "latin-1"]
        last_error = None
        for enc in encodings:
            try:
                self.df = pd.read_csv(file_path, encoding=enc)
                self.encoding_used = enc
                return self.df
            except UnicodeDecodeError as e:
                last_error = e
                continue
        raise ValueError(f"Could not decode CSV with any supported encoding: {last_error}")

    
    def data_info(self):
        if self.df is None:
            return "No data loaded."
        
        return {
            "columns": self.df.columns.tolist(),
            "dtypes": self.df.dtypes.apply(lambda x: x.name).to_dict(),
            "shape": self.df.shape
        }

    def describe(self):
        if self.df is None:
            return "No data loaded."
        return self.df.describe().to_dict() 

    def get_sample(self, n=5):
        if self.df is None:
            return "No data loaded."
            
        return self.df.head(n).to_dict(orient='records')
        