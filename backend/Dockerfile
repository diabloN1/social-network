# Step 1: Runtime Stage - Use a smaller Debian-based image for the final image
FROM golang:alpine
# Set working directory in runtime image
WORKDIR /root/

# Copy the pre-built Go binary from the host machine to the container
COPY backend .

# Expose the backend API port
EXPOSE 8080

# Set the default command to run the Go backend binary
CMD ["./backend"]
