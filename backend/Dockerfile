# Use the official Golang image for building the backend
FROM golang:1.24 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application code
COPY . .

# Build the backend binary
RUN go build -o backend main.go # Adjust this if your main file is elsewhere

# Final image
FROM alpine:latest

# Install necessary packages
RUN apk --no-cache add ca-certificates

# Set the working directory
WORKDIR /root/

# Copy the compiled binary from the builder stage
COPY --from=builder /app/backend .

# Copy database migrations
COPY --from=builder /app/pkg/db/migrations ./migrations

# Expose port for the backend
EXPOSE 8080

# Run the backend binary
CMD ["./backend"]
