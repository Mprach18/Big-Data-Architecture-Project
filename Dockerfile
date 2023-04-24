# Set the base image for the Flask server
FROM python:3.9.7-alpine
FROM ubuntu:latest
# Install system dependencies
#RUN apk add --no-cache build-base
RUN apt-get update && \
    apt-get install -y python3.9 python3-pip && \
    apt-get install -y python3-venv && \
    apt-get install -y python3-dev gcc gfortran && \
    rm -rf /var/lib/apt/lists/*
# Set the working directory for the server
WORKDIR /app

# Copy the requirements.txt file to the working directory
COPY app/requirements.txt .
COPY app/credentials.json .

RUN python3 -m venv venv2
#ENV PATH="/venv/bin:$PATH"

RUN chmod +x venv2/bin/activate

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gfortran \
        liblapack-dev \
        libopenblas-dev \
    && rm -rf /var/lib/apt/lists

RUN pip3 install --upgrade pip
RUN pip3 install numpy
# Install Python dependencies
RUN pip3 install  -r requirements.txt

# Copy the Flask application files to the working directory
COPY app .

# Copy the built client files to the server's static folder
#COPY --from=client /client/Frontend/build /app/static

# Expose the port that the server will listen on
# EXPOSE 8080
EXPOSE 8080

# Start the Flask server
CMD ["sh", "-c", "flask run"]
