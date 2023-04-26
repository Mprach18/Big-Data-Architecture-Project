from pyspark.conf import SparkConf
from pyspark.sql import SparkSession
from pyspark.sql.functions import col
from pyspark.sql.types import * 
from pyspark.sql.functions import *

spark = SparkSession.builder.appName("MySparkJob").getOrCreate()
conf = (SparkConf()
.setAppName("my_job_name")
.set("spark.shuffle.service.enabled", "false")
.set("spark.dynamicAllocation.enabled", "false"))
complete_track_features = spark.read.format("csv").option("header", "true").load("gs://nsr_data/complete_features_audio_ohe.csv").limit(100)
songDF = spark.read.format("csv").option("header", "true").load("gs://nsr_data/complete_features_audio.csv").limit(100)