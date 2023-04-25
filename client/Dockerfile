# Build react app
FROM node:14.17.0-alpine AS builder
WORKDIR /Frontend

# Copy the package.json and package-lock.json files to the working directory
COPY Frontend/package*.json ./

# Install dependencies for the client
RUN npm install

# Copy the rest of the client files to the working directory
COPY Frontend .

# Build the client
RUN npm run build

FROM node:14.17.0-alpine AS client
# Set the working directory for the client

RUN npm install -g serve

COPY --from=builder /Frontend/build .

EXPOSE 3000

CMD [ "serve", "."]

