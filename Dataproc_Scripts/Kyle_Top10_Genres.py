#!/usr/bin/env python
# coding: utf-8

# !pip install textblob=0.15.3
# !pip install nltk=3.8.1
#!pip install --force-reinstall -v "textblob==0.15.3"
#!pip install --force-reinstall -v "nltk==3.8.1"
# !pip install regex

# In[1]:
import sys
import subprocess

# implement pip as a subprocess:
subprocess.check_call([sys.executable, '-m', 'pip', 'install', 
'textblob==0.15.3','nltk==3.8.1'])

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from textblob import TextBlob
from IPython import get_ipython
import re
from collections import defaultdict #recently added and needs to be resolved

f = 'gs://nsr_data/complete_track_features.csv'
data = pd.read_csv(f,index_col=0)
#for taking subset of data
# n = len(data)
# data = data[0:n]

# data = data.dropna(subset = ["genre"]).reset_index(drop= True) Note: uncomment line if wanting to remove missing values
data['genre']= data['genre'].fillna("") #else just fill with empty string

#if we decide to use many genres:

#note: this was done to find top genres but EDA was not kept

# from collections import defaultdict
# genre_list = data["genre"].apply(lambda x: x.split(",")).to_list()
# genre_dict = defaultdict(int)
# for row in genre_list:
#     for genre in row:
#         genre_dict[genre] +=1
# sorted_dict = dict(sorted(genre_dict.items(), key=lambda item: item[1], reverse=True))
# final_genres = list(sorted_dict.keys())[:200]
# data['genre']=data['genre'].fillna("")

#renaming columns of new data to make it similar to original data
dic = {'artists': 'artist_names',
        'album': 'album_name',
        'artist_ids': 'artist_id',
       'name':'track_name'}
data.rename(columns=dic,inplace=True)

f1 = 'gs://nsr_data/complete_features_audio_ohe_updated.csv'
data1 = pd.read_csv(f1,index_col = 0)
data1["genres"] = data["genre"]
def genre_preprocess(df):
    '''
    Preprocess the genre data
    Most common genres form exploratory data analysis are kept 
    From these, only a maximum of two the most frequent genres are kept (threshold of 0.5 betwen most and second most common)
    '''
    df['genres_list'] = ["" for i in range(len(df['genres']))]
    potential_genres = r"rock|rap|blues|country|jazz|classical|orchestra|pop|metal|hip hop" 
    list_temp = []
    list_temp2 = []
    for i in range(len(df['genres'])):
        list_temp2 = re.findall(potential_genres, df['genres'][i])
        genre_dict = defaultdict(int)
        for genre in list_temp2:
            genre_dict[genre] +=1
        sorted_dict = dict(sorted(genre_dict.items(), key=lambda item: item[1], reverse=True))
        if len(sorted_dict) == 0:
            list_temp.append(np.nan)
        elif len(sorted_dict) ==1:
            list_temp.append([list(sorted_dict.keys())[0]])
        else: 
            if (list(sorted_dict.values())[1])/ (list(sorted_dict.values())[0]) >= 0.5:
                list_temp.append([list(sorted_dict.keys())[0], list(sorted_dict.keys())[1]])
            else:
                list_temp.append([list(sorted_dict.keys())[0]])

    df['genres_list'] = list_temp
    return df

df_genres = genre_preprocess(data1)
df_genres = df_genres.dropna(subset = ["genres_list"]).reset_index(drop = False)
genre_list = df_genres["genres_list"].to_list()
genre_dict = defaultdict(int)
for row in genre_list:
    for genre in row:
        genre_dict[genre] +=1
sorted_dict = dict(sorted(genre_dict.items(), key=lambda item: item[1], reverse=True))
final_genres = list(sorted_dict.keys())
df_genres = df_genres.drop("genres", axis = 1)

for genre in final_genres:
    df_genres[genre] = 0

# print(df_genres.head())
# print(final_genres)

genre_part_dict = {key: [] for key in final_genres}
for genre in final_genres:
    for i in range(len(df_genres)):
        if genre in df_genres["genres_list"][i]:
            genre_part_dict[genre].append(1)
        else:
            genre_part_dict[genre].append(0)

encoded = pd.DataFrame.from_dict(genre_part_dict) 

df_genres_full = pd.concat([df_genres, encoded], axis = 1)

df_rock = df_genres_full.query("rock == 1")
df_rock = df_rock.drop(final_genres, axis = 1)
df_rock = df_rock.drop("genres_list", axis = 1).reset_index(drop= True)
df_rock.to_csv('gs://nsr_data/genre_partitions/rock.csv')

df_classical = df_genres_full.query("classical == 1")
df_classical = df_classical.drop(final_genres, axis = 1)
df_classical = df_classical.drop("genres_list", axis = 1).reset_index(drop= True)
df_classical.to_csv('gs://nsr_data/genre_partitions/classical.csv')

df_pop = df_genres_full.query("pop == 1")
df_pop = df_pop.drop(final_genres, axis = 1)
df_pop = df_pop.drop("genres_list", axis = 1).reset_index(drop= True)
df_pop.to_csv('gs://nsr_data/genre_partitions/pop.csv')

df_metal = df_genres_full.query("metal == 1")
df_metal = df_metal.drop(final_genres, axis = 1)
df_metal = df_metal.drop("genres_list", axis = 1).reset_index(drop= True)
df_metal.to_csv('gs://nsr_data/genre_partitions/metal.csv')

df_jazz = df_genres_full.query("jazz == 1")
df_jazz = df_jazz.drop(final_genres, axis = 1)
df_jazz = df_jazz.drop("genres_list", axis = 1).reset_index(drop= True)
df_jazz.to_csv('gs://nsr_data/genre_partitions/jazz.csv')

df_orchestra = df_genres_full.query("orchestra == 1")
df_orchestra = df_orchestra.drop(final_genres, axis = 1)
df_orchestra = df_orchestra.drop("genres_list", axis = 1).reset_index(drop= True)
df_orchestra.to_csv('gs://nsr_data/genre_partitions/orchestra.csv')

df_rap = df_genres_full.query("rap == 1")
df_rap = df_rap.drop(final_genres, axis = 1)
df_rap = df_rap.drop("genres_list", axis = 1).reset_index(drop= True)
df_rap.to_csv('gs://nsr_data/genre_partitions/rap.csv')

df_hiphop = df_genres_full.query("`hip hop` == 1")
df_hiphop = df_hiphop.drop(final_genres, axis = 1)
df_hiphop = df_hiphop.drop("genres_list", axis = 1).reset_index(drop= True)
df_hiphop.to_csv('gs://nsr_data/genre_partitions/hiphop.csv')

df_blues = df_genres_full.query("blues == 1")
df_blues = df_blues.drop(final_genres, axis = 1)
df_blues = df_blues.drop("genres_list", axis = 1).reset_index(drop= True)
df_blues.to_csv('gs://nsr_data/genre_partitions/blues.csv')

df_country = df_genres_full.query("country == 1")
df_country = df_country.drop(final_genres, axis = 1)
df_country = df_country.drop("genres_list", axis = 1).reset_index(drop= True)
df_country.to_csv('gs://nsr_data/genre_partitions/country.csv')