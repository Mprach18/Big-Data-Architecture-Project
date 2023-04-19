''' Script contains the code to run spark job'''
from google.cloud import dataproc_v1 as dataproc
from google.api_core.client_options import ClientOptions
import uuid

# Set the region of your cluster
region = 'us-central1'

# Create a client object
endpoint = 'us-central1-dataproc.googleapis.com:443'
client_options = ClientOptions(api_endpoint=endpoint)
client = dataproc.JobControllerClient(client_options=client_options)

#Set project id
project_id = 'spotifysongrecommendation'

# Set the name of your Dataproc cluster
cluster_name = 'my-second-cluster'

# Set the ID of your job
job_id = 'test-job'

# Set the main Python file for your job
main_python_file_uri = 'gs://nsr_data/notebooks/jupyter/Shivam_recommendation-map.py'

# Set any additional Python files your job needs
# python_file_uris = ['gs://my-bucket/my-dependency.egg']

# Set any command line arguments your job needs
args = [str(uuid.uuid4())]

# Create a PySpark job configuration
job = {
    'placement': {
        'cluster_name': cluster_name
    },
    'pyspark_job': {
        'main_python_file_uri': main_python_file_uri,
        # 'python_file_uris': python_file_uris,
        'args': args
    }
}

# Submit the job to Dataproc
operation = client.submit_job_as_operation(project_id=project_id, region=region, job=job)

# Wait for the job to complete
# operation_id = operation.name.split("/")[-1]
response = operation.result()
# print("response1",response1)
# response2 = operation2.result()
# print("response2",response2)