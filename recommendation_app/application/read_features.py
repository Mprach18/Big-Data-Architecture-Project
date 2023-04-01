import os
import sys
import ast
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, IntegerType, StringType, FloatType, Row

# Creating a SparkSession
spark = SparkSession.builder.appName("read_features").getOrCreate()

# Parsing the string representation into a nested list of tuples
features_str = sys.argv[1]
features = ast.literal_eval(features_str)           

# Schema for the DataFrame
schema = StructType([
    StructField("id", StringType(), True),
    StructField("title", StringType(), True),
    StructField("first_artist", StringType(), True),
    StructField("all_artists", StringType(), True),
    StructField("danceability", StringType(), True),
    StructField("energy", StringType(), True),
    StructField("key", StringType(), True),
    StructField("loudness", StringType(), True),
    StructField("mode", StringType(), True),
    StructField("acousticness", StringType(), True),
    StructField("instrumentalness", StringType(), True),
    StructField("liveness", StringType(), True),
    StructField("valence", StringType(), True),
    StructField("tempo", StringType(), True),
    StructField("duration_ms", StringType(), True),
    StructField("time_signature", StringType(), True)
])


# Converting the list of tuples to a list of Row objects
rows = [Row(id=row[0], title=row[1], first_artist=row[2], all_artists=row[3], danceability=row[4], energy=row[5], key=row[6], loudness=row[7], mode=row[8], acousticness=row[9], instrumentalness=row[10], liveness=row[11], valence=row[12], tempo=row[13], duration_ms=row[14], time_signature=row[15],) for row in features]

# Creating a DataFrame from the list of Row objects
df = spark.createDataFrame(rows, schema)
df.show()


#sample command
#gcloud dataproc jobs submit pyspark --cluster=my-second-cluster gs://nsr_data/notebooks/jupyter/modified_readFeatures.py --region=us-central1 -- '[(0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1)]'
