import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from textblob import TextBlob

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
    df['polarity'] = df[text_col].apply(getPolarity).apply(getAnalysis)
    
    return df

def encode_features(row):
    
    ''' Function to populate the encoded categorical columns''' 
    
    row['polar|'+row.polarity]=1 
    row['subject|'+row.subjectivity]=1
    row['mode|'+str(row['mode'])]=1
    row['time_signature|'+str(row.time_signature)]=1
    row['key|'+str(row.key)]=1
    return row

# Defining categorical columns 
polarity_list = ['polar|Negative','polar|Neutral','polar|Positive']
subjectivity_list = ['subject|high','subject|medium','subject|low']
mode_list =  ['mode|0','mode|1']
key_list = ['key|0','key|1','key|2','key|3','key|4','key|5','key|6','key|7','key|8','key|9','key|10'
        ,'key|11']
time_sig_list = ['time_signature|0','time_signature|1','time_signature|3',
                'time_signature|4','time_signature|5']

def transform_input_features(input_df):

    # create subjectivity and polarity features 
    input_df = sentiment_analysis(input_df,"title")

    # create categorical column instead of using one-hot-encoding (given that input might not contain all possible categories)
    for L in [polarity_list,subjectivity_list,mode_list,key_list,time_sig_list]:    
        for col_name in L:  input_df[col_name] = 0
    
    # Populating categorical columns
    res = input_df.apply(encode_features,axis=1)

    # Dropping columns that are not used for cosine similarity 
    res.drop(columns=['subjectivity','polarity','key','mode','time_signature','title','first_artist','all_artists'],inplace=True)
    audio_columns = ['danceability', 'energy', 'loudness', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo', 'duration_ms']
    
    # Scaling audio features
    scaler = MinMaxScaler()
    audio_features = pd.DataFrame(scaler.fit_transform(res[audio_columns]), columns = audio_columns)
    
    # Appending encoded columns that were excluded from scaling (given that they only have 0 or 1 values)
    remaining_columns = list(set(res.columns.values)-set(audio_columns))
    audio_features[remaining_columns]=res[remaining_columns]

    # Arranging columns in a proper sequence
    audio_features=audio_features[['danceability', 'energy', 'loudness', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo', 'duration_ms', 'id', 'subject|high', 'subject|low', 'subject|medium', 'polar|Negative', 'polar|Neutral', 'polar|Positive', 'key|0', 'key|1', 'key|2', 'key|3', 'key|4', 'key|5', 'key|6', 'key|7', 'key|8', 'key|9', 'key|10', 'key|11', 'mode|0', 'mode|1', 'time_signature|0', 'time_signature|1', 'time_signature|3', 'time_signature|4', 'time_signature|5']]

    return audio_features
