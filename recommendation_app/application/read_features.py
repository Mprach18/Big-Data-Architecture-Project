from pyspark.sql import SparkSession
import sys

def read_audio_features(path):
    # Creating a SparkSession
    spark = SparkSession.builder.appName("read_features").getOrCreate()

    # Loading the dataframe from the Parquet file
    df = spark.read.format("parquet").load(path)
    df.show()
    

path = sys.argv[1]

read_audio_features(path)
