from pyspark.conf import SparkConf
from pyspark.sql import SparkSession, Row
from pyspark.sql.functions import col, broadcast, sum, mean, monotonically_increasing_id
from pyspark.ml.feature import BucketedRandomProjectionLSH, VectorAssembler
from pyspark.ml.linalg import *
from pyspark.sql.types import *
import numpy as np
from scipy.spatial import distance
import os
import sys
import pandas as pd
from io import StringIO
from datetime import datetime

spark = SparkSession.builder.appName("MySparkJob").getOrCreate()
conf = (SparkConf()
.setAppName("my_job_name")
.set("spark.shuffle.service.enabled", "false")
.set("spark.dynamicAllocation.enabled", "false")
.set("spark.debug.maxToStringFields", "1000"))

audio_features = sys.argv[1]
uuid = sys.argv[2]
input_genres = sys.argv[3].split(",")
features = pd.read_csv(StringIO(audio_features), sep='\s+')

features_sparkDF=spark.createDataFrame(features) 

input_df = features_sparkDF
input_df = input_df.drop('_c0')

if len(input_genres) == 0:
    complete_track_features = spark.read.format("csv").option("header","true").load("gs://nsr_data/complete_features_audio_ohe_updated.csv") 
else: 
    for genre,i in zip(input_genres,range(len(input_genres))):
        if i == 0:
            complete_track_features  = spark.read.format("csv").option("header", "true").load(f"gs://nsr_data/genre_partitions/{genre}.csv")
        else: 
            complete_track_features.union(spark.read.format("csv").option("header", "true").load(f"gs://nsr_data/genre_partitions/{genre}.csv"))
complete_track_features = complete_track_features.dropDuplicates(subset=["id_ctf"])
complete_track_features = complete_track_features.drop(*['_c0','explicit_ctf'])
    
complete_feature_set_nonplaylist = complete_track_features.join(input_df, complete_track_features.id_ctf==input_df.id, 'leftanti')

# Aggregating input dataframe into a vector
complete_feature_set_playlist_final = input_df.drop("id")
complete_feature_set_playlist_final = complete_feature_set_playlist_final.agg(*(mean(c).alias(c) for c in complete_feature_set_playlist_final.columns))

# Converting all the string columns to float
for col_name in complete_feature_set_nonplaylist.columns:
    if col_name=='id_ctf':
        continue
    complete_feature_set_nonplaylist = complete_feature_set_nonplaylist.withColumn(col_name, col(col_name).cast('double'))

# transform the dataframe to add a vector column. This is required to convert all features to a vector for calculation of cosine-similarity 
temp = complete_feature_set_nonplaylist.drop('id_ctf')
assembler = VectorAssembler(inputCols=temp.columns, outputCol="features")
complete_feature_set_nonplaylist_vectors = assembler.transform(temp).select(col("features"))

# Broadcasting input vector
row = complete_feature_set_playlist_final.rdd.map(lambda x: list(x)).collect()[0]
dense_vector = spark.sparkContext.broadcast({"vector":[(Vectors.dense(row),)]})

# Calculating cosine similarity
# print("just before map function")
res = complete_feature_set_nonplaylist_vectors.rdd.map(lambda r: (1-distance.cosine(r,dense_vector.value["vector"][0][0])) )
# print("map completed")

# Creating cosine similarity dataframe
row_rdd = res.map(lambda x:Row(float(x)))
schema = StructType([StructField("cosine_similarity", FloatType(), True)])
cosim_df = spark.createDataFrame(row_rdd, schema)
cosim_df = cosim_df.withColumn("temp_id",monotonically_increasing_id())
cosim_df = cosim_df.orderBy(col("cosine_similarity").desc()).limit(40)
complete_feature_set_nonplaylist = complete_feature_set_nonplaylist.withColumn("temp_id",monotonically_increasing_id())


# Joining cosim with final df
final_cols = ["id_ctf","cosine_similarity"]
joined_df = cosim_df.join(complete_feature_set_nonplaylist, on=["temp_id"],how='inner').select(*final_cols)
joined_df = joined_df.orderBy(col("cosine_similarity").desc())
joined_df.write.option("header", "true").format("csv").save("gs://nsr_data/"+str(uuid)+".csv")
    
