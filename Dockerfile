# Set the base image for the Flask server
FROM python:3.9.7-alpine

# Install system dependencies
#RUN apk add --no-cache build-base

# Set the working directory for the server
WORKDIR /app

# Copy the requirements.txt file to the working directory
COPY app/requirements.txt .
COPY app/credentials.json .

RUN python -m venv venv
#ENV PATH="/venv/bin:$PATH"

RUN chmod +x venv/bin/activate

RUN pip3 install --upgrade pip
RUN pip3 install numpy==1.22.0
# Install Python dependencies
RUN pip3 install  -r requirements.txt

# Copy the Flask application files to the working directory
COPY app .

# Copy the built client files to the server's static folder
#COPY --from=client /client/Frontend/build /app/static

# Expose the port that the server will listen on
# EXPOSE 8080
# EXPOSE 8080

# Start the Flask server
CMD ["sh", "-c", "flask run --host=0.0.0.0"]
