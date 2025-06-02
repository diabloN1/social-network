FROM golang:1.24 AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o backend ./main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates

WORKDIR /root/
COPY --from=builder /app/backend .
COPY --from=builder /app/pkg/db/migrations ./migrations

EXPOSE 8080
CMD ["./backend"]
