docker rm -f $(docker ps -aq) && docker rmi -f $(docker images -aq)

# cd frontend
# npm run build
# docker build -t frontend .
# docker run -d -p 3000:3000 --name frontend frontend

cd backend
go build -o backend
docker build -t backend .
docker run -d -p 8080:8080 --name backend backend