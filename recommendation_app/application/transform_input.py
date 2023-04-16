import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from textblob import TextBlob
from IPython import get_ipython

input_df = pd.read_csv("gs://nsr_data/input_df.csv",index_col=0)