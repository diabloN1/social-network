FROM golang:1.24 AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Enable Cgo and build the binary
RUN apt-get update && apt-get install -y gcc musl-dev
RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -o backend ./main.go

# Use Debian-based runtime image
FROM debian:bullseye-slim

WORKDIR /root/
COPY --from=builder /app/backend .
COPY --from=builder /app/pkg/db/migrations ./migrations

EXPOSE 8080
CMD ["./backend"]
