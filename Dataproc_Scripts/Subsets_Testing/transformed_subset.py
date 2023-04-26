import sys
import subprocess

# implement pip as a subprocess:
# subprocess.check_call([sys.executable, '-m', 'pip', 'install', 
# 'textblob==0.15.3','nltk==fill.8.1'])

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from textblob import TextBlob
from IPython import get_ipython

f = 'gs://nsr_data/complete_track_features.csv'
data = pd.read_csv(f,index_col=0)
n = len(data)//100
data = data[0:n]

data.head(2)


# In[23]:


#renaming columns of new data to make it similar to original data
dic = {'artists': 'artist_names',
        'album': 'album_name',
        'artist_ids': 'artist_id',
       'name':'track_name'}
data.rename(columns=dic,inplace=True)


# In[24]:


data['genre']=data['genre'].fillna("")


# In[25]:


def genre_preprocess(df):
    '''
    Preprocess the genre data
    '''
    df['genres_list'] = df['genre'].apply(lambda x: x.split(" "))
    return df
def getSubjectivity(text):
    '''
    Getting the Subjectivity using TextBlob
    '''
    return TextBlob(text).sentiment.subjectivity

def getPolarity(text):
    '''
    Getting the Polarity using TextBlob
    '''
    return TextBlob(text).sentiment.polarity

def getAnalysis(score, task="polarity"):
    '''
    Categorizing the Polarity & Subjectivity score
    '''
    if task == "subjectivity":
        if score < 1/3:
            return "low"
        elif score > 1/3:
            return "high"
        else:
            return "medium"
    else:
        if score < 0:
            return 'Negative'
        elif score == 0:
            return 'Neutral'
        else:
            return 'Positive'

def sentiment_analysis(df, text_col):
    '''
    Perform sentiment analysis on text
    ---
    Input:
    df (pandas dataframe): Dataframe of interest
    text_col (str): column of interest
    '''
    df['subjectivity'] = df[text_col].apply(getSubjectivity).apply(lambda x: getAnalysis(x,"subjectivity"))
    print("calculated subjectivity")
    df['polarity'] = df[text_col].apply(getPolarity).apply(getAnalysis)
    print("calculated popularity")
    
    return df

def ohe_prep(df, column, new_name): 
    ''' 
    Create One Hot Encoded features of a specific column
    ---
    Input: 
    df (pandas dataframe): Spotify Dataframe
    column (str): Column to be processed
    new_name (str): new column name to be used
        
    Output: 
    tf_df: One-hot encoded features 
    '''
    
    tf_df = pd.get_dummies(df[column])
    feature_names = tf_df.columns
    tf_df.columns = [new_name + "|" + str(i) for i in feature_names]
    tf_df.reset_index(drop = True, inplace = True)    
    return tf_df

data = sentiment_analysis(data, "track_name")


data.polarity.value_counts()

features_to_score = list(data.columns[8:22])

def create_new_feature_set(df, cols):
    '''
    Process spotify df to create a final set of features that will be used to generate recommendations
    ---
    Input: 
    df (pandas dataframe): Spotify Dataframe
    float_cols (list(str)): List of columns that will be scaled/transformed
            
    Output: 
    final (pandas dataframe): Final set of features 
    '''
    
    tfidf = TfidfVectorizer()
    tfidf_matrix =  tfidf.fit_transform(df['genre'])
    new_genre_df = pd.DataFrame(tfidf_matrix.toarray())
    new_genre_df.columns = ['genre' + "|" + i for i in tfidf.get_feature_names()]
    new_genre_df.reset_index(drop = True, inplace=True)
    
    print("created tfidf matrix")
    new_genre_df['id']=df['id'].values
    new_genre_df.to_csv('gs://nsr_data/subset_features_tfidf.csv')
    subject_ohe = ohe_prep(df, 'subjectivity','subject') * 0.3
    polar_ohe = ohe_prep(df, 'polarity','polar') * 0.3
    key_ohe = ohe_prep(df, 'key','key') * 0.3
    mode_ohe = ohe_prep(df, 'mode','mode') * 0.3
    ts_ohe = ohe_prep(df,'time_signature','time_signature') * 0.3
    
    print("one hot encoded the features")
    # Scale audio columns
    audio_features = df[cols].reset_index(drop = True)
    scaler = MinMaxScaler()
    audio_features = pd.DataFrame(scaler.fit_transform(audio_features), columns = cols)
    audio_features['id']=df['id'].values
    audio_features.to_csv('gs://nsr_data/subset_features_audio.csv')
    # Concanenate all features
    final = pd.concat([audio_features, subject_ohe, polar_ohe, key_ohe, mode_ohe, ts_ohe], axis = 1)
    
    # Add song id
    final['id']=df['id'].values
    final.to_csv('gs://nsr_data/subset_features_audio_ohe.csv')
    
    return 'CSV files saved'



data['explicit'] = data['explicit'].astype(int) * 0.3

create_new_feature_set(data,features_to_score)

