
# DockerContainerを削除し、最新のコードで新しいイメージをビルドしてコンテナを起動するデプロイスクリプト

#!/bin/bash

set -e  # Exit immediately if a command fails

IMAGE_NAME="knowyourcodeweb"
CONTAINER_NAME="knowyourcodewebcontainer"
PORT="80:80"

echo "🚀 Starting deployment..."

echo "📥 Pulling latest code..."
git pull

echo "🛑 Stopping container (if running)..."
docker stop $CONTAINER_NAME 2>/dev/null || true

echo "🗑 Removing container (if exists)..."
docker rm $CONTAINER_NAME 2>/dev/null || true

echo "🗑 Removing image (if exists)..."
docker rmi $IMAGE_NAME:latest 2>/dev/null || true

echo "🔨 Building Docker image..."
docker build --no-cache -t $IMAGE_NAME:latest .

echo "▶️ Running new container..."
docker run \
  --name $CONTAINER_NAME \
  -p $PORT \
  -d \
  $IMAGE_NAME:latest

echo "✅ Deployment completed successfully!"