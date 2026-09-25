import pandas as pd

class DataHandler:
    def __init__(self):
        self.df = None
    
    def load_csv(self, file_path):
        self.df = pd.read_csv(file_path)
        return f"CSV loaded successfully! {len(self.df)} rows."

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
        