#!/bin/bash

# Deploy script for KnowYourCodeWeb
# This script checks dependencies, sets up Firebase config, and deploys with Docker

set -e  # Exit immediately if a command fails

IMAGE_NAME="knowyourcodeweb"
CONTAINER_NAME="knowyourcodewebcontainer"
PORT="80:80"

FIREBASE_DIR="src/firebase"
FIREBASE_FILE="$FIREBASE_DIR/firebase.ts"
FIREBASE_EXAMPLE="$FIREBASE_DIR/firebase.ts.example"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            echo "debian"
        elif [ -f /etc/redhat-release ]; then
            echo "redhat"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install Docker based on OS
install_docker() {
    local os=$(detect_os)

    print_header "Installing Docker"

    case $os in
        debian)
            print_info "Detected Debian/Ubuntu system"
            echo "Running the following commands:"
            echo "  sudo apt-get update"
            echo "  sudo apt-get install -y docker.io"
            echo "  sudo systemctl start docker"
            echo "  sudo systemctl enable docker"
            echo "  sudo usermod -aG docker \$USER"
            echo ""
            read -p "Proceed with Docker installation? (y/n): " confirm
            if [[ $confirm == [yY] ]]; then
                sudo apt-get update
                sudo apt-get install -y docker.io
                sudo systemctl start docker
                sudo systemctl enable docker
                sudo usermod -aG docker $USER
                print_success "Docker installed successfully"
                print_warning "You may need to log out and back in for group changes to take effect"
                print_warning "Or run: newgrp docker"
            else
                print_error "Docker installation cancelled"
                exit 1
            fi
            ;;
        redhat)
            print_info "Detected RHEL/CentOS/Fedora system"
            echo "Running the following commands:"
            echo "  sudo yum install -y docker"
            echo "  sudo systemctl start docker"
            echo "  sudo systemctl enable docker"
            echo "  sudo usermod -aG docker \$USER"
            echo ""
            read -p "Proceed with Docker installation? (y/n): " confirm
            if [[ $confirm == [yY] ]]; then
                sudo yum install -y docker
                sudo systemctl start docker
                sudo systemctl enable docker
                sudo usermod -aG docker $USER
                print_success "Docker installed successfully"
                print_warning "You may need to log out and back in for group changes to take effect"
            else
                print_error "Docker installation cancelled"
                exit 1
            fi
            ;;
        macos)
            print_info "Detected macOS"
            if command_exists brew; then
                echo "Running: brew install --cask docker"
                read -p "Proceed with Docker installation via Homebrew? (y/n): " confirm
                if [[ $confirm == [yY] ]]; then
                    brew install --cask docker
                    print_success "Docker installed successfully"
                    print_warning "Please open Docker Desktop to complete setup"
                else
                    print_error "Docker installation cancelled"
                    exit 1
                fi
            else
                print_error "Homebrew not found. Please install Docker Desktop manually:"
                echo "  https://www.docker.com/products/docker-desktop/"
                exit 1
            fi
            ;;
        *)
            print_error "Unknown OS. Please install Docker manually:"
            echo "  https://docs.docker.com/get-docker/"
            exit 1
            ;;
    esac
}

# Check and install dependencies
check_dependencies() {
    print_header "Checking Dependencies"

    local missing_deps=0

    # Check Git
    if command_exists git; then
        print_success "Git is installed ($(git --version | head -1))"
    else
        print_error "Git is not installed"
        missing_deps=1
    fi

    # Check Docker
    if command_exists docker; then
        print_success "Docker is installed ($(docker --version))"

        # Check if Docker daemon is running
        if docker info >/dev/null 2>&1; then
            print_success "Docker daemon is running"
        else
            print_warning "Docker daemon is not running"
            print_info "Attempting to start Docker..."

            local os=$(detect_os)
            if [[ $os == "macos" ]]; then
                print_info "Please start Docker Desktop manually"
                exit 1
            else
                sudo systemctl start docker 2>/dev/null || {
                    print_error "Could not start Docker daemon"
                    print_info "Try: sudo systemctl start docker"
                    exit 1
                }
                print_success "Docker daemon started"
            fi
        fi
    else
        print_warning "Docker is not installed"
        read -p "Would you like to install Docker now? (y/n): " install_confirm
        if [[ $install_confirm == [yY] ]]; then
            install_docker
        else
            print_error "Docker is required for deployment"
            exit 1
        fi
    fi

    if [ $missing_deps -eq 1 ]; then
        print_error "Please install missing dependencies and try again"
        exit 1
    fi
}

# Check and setup Firebase configuration
check_firebase_config() {
    print_header "Checking Firebase Configuration"

    # Create firebase directory if it doesn't exist
    if [ ! -d "$FIREBASE_DIR" ]; then
        print_info "Creating $FIREBASE_DIR directory..."
        mkdir -p "$FIREBASE_DIR"
    fi

    # Check if firebase.ts exists
    if [ -f "$FIREBASE_FILE" ]; then
        # Check if it still contains placeholder values
        if grep -q "YOUR_API_KEY" "$FIREBASE_FILE"; then
            print_error "Firebase configuration contains placeholder values"
            print_info "Please edit $FIREBASE_FILE and replace the placeholder values with your Firebase credentials"
            echo ""
            echo "You can find your Firebase credentials at:"
            echo "  1. Go to https://console.firebase.google.com/"
            echo "  2. Select your project"
            echo "  3. Click on Project Settings (gear icon)"
            echo "  4. Scroll down to 'Your apps' section"
            echo "  5. Copy the firebaseConfig values"
            exit 1
        else
            print_success "Firebase configuration found"
        fi
    else
        # Check if example file exists
        if [ -f "$FIREBASE_EXAMPLE" ]; then
            print_warning "Firebase configuration not found"
            print_info "Creating $FIREBASE_FILE from template..."
            cp "$FIREBASE_EXAMPLE" "$FIREBASE_FILE"

            echo ""
            print_error "Please configure Firebase before deploying!"
            echo ""
            echo "Steps to configure:"
            echo "  1. Edit the file: $FIREBASE_FILE"
            echo "  2. Replace the placeholder values with your Firebase credentials"
            echo ""
            echo "You can find your Firebase credentials at:"
            echo "  1. Go to https://console.firebase.google.com/"
            echo "  2. Select your project (or create a new one)"
            echo "  3. Click on Project Settings (gear icon)"
            echo "  4. Scroll down to 'Your apps' section"
            echo "  5. If no web app exists, click 'Add app' and select Web (</>)"
            echo "  6. Copy the firebaseConfig values into $FIREBASE_FILE"
            echo ""
            echo "Required values:"
            echo "  - apiKey"
            echo "  - authDomain"
            echo "  - projectId"
            echo "  - storageBucket"
            echo "  - messagingSenderId"
            echo "  - appId"
            echo "  - measurementId (optional, for analytics)"
            echo ""
            print_info "After configuring, run this script again."
            exit 1
        else
            print_error "Firebase template file not found: $FIREBASE_EXAMPLE"
            print_info "Please create $FIREBASE_FILE manually with your Firebase configuration"
            exit 1
        fi
    fi
}

# Main deployment process
deploy() {
    print_header "Starting Deployment"

    echo "📥 Pulling latest code..."
    git pull

    echo ""
    echo "🛑 Stopping container (if running)..."
    docker stop $CONTAINER_NAME 2>/dev/null || true

    echo "🗑  Removing container (if exists)..."
    docker rm $CONTAINER_NAME 2>/dev/null || true

    echo "🗑  Removing old image (if exists)..."
    docker rmi $IMAGE_NAME:latest 2>/dev/null || true

    echo ""
    echo "🔨 Building Docker image..."
    docker build --no-cache -t $IMAGE_NAME:latest .

    echo ""
    echo "▶️  Running new container..."
    docker run \
      --name $CONTAINER_NAME \
      -p $PORT \
      -d \
      --restart unless-stopped \
      $IMAGE_NAME:latest

    echo ""
    print_success "Deployment completed successfully!"
    echo ""
    print_info "Container is running on port 80"
    print_info "View logs: docker logs -f $CONTAINER_NAME"
}

# Main execution
main() {
    print_header "KnowYourCodeWeb Deployment"

    check_dependencies
    check_firebase_config
    deploy
}

# Run main function
main
