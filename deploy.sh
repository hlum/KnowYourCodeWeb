#!/bin/bash

# KnowYourCodeWeb デプロイスクリプト
# 依存関係のチェック、Firebase設定、Dockerでのデプロイを行います

set -e  # コマンドが失敗した場合は即座に終了

IMAGE_NAME="knowyourcodeweb"
CONTAINER_NAME="knowyourcodewebcontainer"
PORT="80:80"

FIREBASE_DIR="src/firebase"
FIREBASE_FILE="$FIREBASE_DIR/firebase.ts"
FIREBASE_EXAMPLE="$FIREBASE_DIR/firebase.ts.example"

# 出力用の色
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

# OSを検出
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

# コマンドが存在するか確認
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# OSに応じてDockerをインストール
install_docker() {
    local os=$(detect_os)

    print_header "Dockerのインストール"

    case $os in
        debian)
            print_info "Debian/Ubuntuシステムを検出しました"
            echo "以下のコマンドを実行します:"
            echo "  sudo apt-get update"
            echo "  sudo apt-get install -y docker.io"
            echo "  sudo systemctl start docker"
            echo "  sudo systemctl enable docker"
            echo "  sudo usermod -aG docker \$USER"
            echo ""
            read -p "Dockerのインストールを続行しますか？ (y/n): " confirm
            if [[ $confirm == [yY] ]]; then
                sudo apt-get update
                sudo apt-get install -y docker.io
                sudo systemctl start docker
                sudo systemctl enable docker
                sudo usermod -aG docker $USER
                print_success "Dockerのインストールが完了しました"
                print_warning "グループの変更を反映するには、ログアウトして再度ログインする必要があります"
                print_warning "または次のコマンドを実行: newgrp docker"
            else
                print_error "Dockerのインストールがキャンセルされました"
                exit 1
            fi
            ;;
        redhat)
            print_info "RHEL/CentOS/Fedoraシステムを検出しました"
            echo "以下のコマンドを実行します:"
            echo "  sudo yum install -y docker"
            echo "  sudo systemctl start docker"
            echo "  sudo systemctl enable docker"
            echo "  sudo usermod -aG docker \$USER"
            echo ""
            read -p "Dockerのインストールを続行しますか？ (y/n): " confirm
            if [[ $confirm == [yY] ]]; then
                sudo yum install -y docker
                sudo systemctl start docker
                sudo systemctl enable docker
                sudo usermod -aG docker $USER
                print_success "Dockerのインストールが完了しました"
                print_warning "グループの変更を反映するには、ログアウトして再度ログインする必要があります"
            else
                print_error "Dockerのインストールがキャンセルされました"
                exit 1
            fi
            ;;
        macos)
            print_info "macOSを検出しました"
            if command_exists brew; then
                echo "実行するコマンド: brew install --cask docker"
                read -p "HomebrewでDockerをインストールしますか？ (y/n): " confirm
                if [[ $confirm == [yY] ]]; then
                    brew install --cask docker
                    print_success "Dockerのインストールが完了しました"
                    print_warning "セットアップを完了するにはDocker Desktopを開いてください"
                else
                    print_error "Dockerのインストールがキャンセルされました"
                    exit 1
                fi
            else
                print_error "Homebrewが見つかりません。Docker Desktopを手動でインストールしてください:"
                echo "  https://www.docker.com/products/docker-desktop/"
                exit 1
            fi
            ;;
        *)
            print_error "不明なOSです。Dockerを手動でインストールしてください:"
            echo "  https://docs.docker.com/get-docker/"
            exit 1
            ;;
    esac
}

# 依存関係のチェックとインストール
check_dependencies() {
    print_header "依存関係のチェック"

    local missing_deps=0

    # Gitのチェック
    if command_exists git; then
        print_success "Gitがインストールされています ($(git --version | head -1))"
    else
        print_error "Gitがインストールされていません"
        missing_deps=1
    fi

    # Dockerのチェック
    if command_exists docker; then
        print_success "Dockerがインストールされています ($(docker --version))"

        # Dockerデーモンが起動しているか確認
        if docker info >/dev/null 2>&1; then
            print_success "Dockerデーモンが起動しています"
        else
            print_warning "Dockerデーモンが起動していません"
            print_info "Dockerの起動を試みます..."

            local os=$(detect_os)
            if [[ $os == "macos" ]]; then
                print_info "Docker Desktopを手動で起動してください"
                exit 1
            else
                sudo systemctl start docker 2>/dev/null || {
                    print_error "Dockerデーモンを起動できませんでした"
                    print_info "次のコマンドを試してください: sudo systemctl start docker"
                    exit 1
                }
                print_success "Dockerデーモンが起動しました"
            fi
        fi
    else
        print_warning "Dockerがインストールされていません"
        read -p "今すぐDockerをインストールしますか？ (y/n): " install_confirm
        if [[ $install_confirm == [yY] ]]; then
            install_docker
        else
            print_error "デプロイにはDockerが必要です"
            exit 1
        fi
    fi

    if [ $missing_deps -eq 1 ]; then
        print_error "不足している依存関係をインストールしてから再度実行してください"
        exit 1
    fi
}

# Firebase設定のチェックとセットアップ
check_firebase_config() {
    print_header "Firebase設定のチェック"

    # firebaseディレクトリが存在しない場合は作成
    if [ ! -d "$FIREBASE_DIR" ]; then
        print_info "$FIREBASE_DIR ディレクトリを作成しています..."
        mkdir -p "$FIREBASE_DIR"
    fi

    # firebase.tsが存在するか確認
    if [ -f "$FIREBASE_FILE" ]; then
        # プレースホルダーの値が残っているか確認
        if grep -q "YOUR_API_KEY" "$FIREBASE_FILE"; then
            print_error "Firebase設定にプレースホルダーの値が含まれています"
            print_info "$FIREBASE_FILE を編集して、プレースホルダーをFirebaseの認証情報に置き換えてください"
            echo ""
            echo "Firebaseの認証情報は以下の手順で取得できます:"
            echo "  1. https://console.firebase.google.com/ にアクセス"
            echo "  2. プロジェクトを選択"
            echo "  3. プロジェクト設定（歯車アイコン）をクリック"
            echo "  4. 「マイアプリ」セクションまでスクロール"
            echo "  5. firebaseConfigの値をコピー"
            exit 1
        else
            print_success "Firebase設定が見つかりました"
        fi
    else
        # テンプレートファイルが存在するか確認
        if [ -f "$FIREBASE_EXAMPLE" ]; then
            print_warning "Firebase設定ファイルが見つかりません"
            print_info "テンプレートから $FIREBASE_FILE を作成しています..."
            cp "$FIREBASE_EXAMPLE" "$FIREBASE_FILE"

            echo ""
            print_error "デプロイ前にFirebaseを設定してください！"
            echo ""
            echo "設定手順:"
            echo "  1. ファイルを編集: $FIREBASE_FILE"
            echo "  2. プレースホルダーをFirebaseの認証情報に置き換える"
            echo ""
            echo "Firebaseの認証情報は以下の手順で取得できます:"
            echo "  1. https://console.firebase.google.com/ にアクセス"
            echo "  2. プロジェクトを選択（または新規作成）"
            echo "  3. プロジェクト設定（歯車アイコン）をクリック"
            echo "  4. 「マイアプリ」セクションまでスクロール"
            echo "  5. Webアプリがない場合は「アプリを追加」→ Web（</>）を選択"
            echo "  6. firebaseConfigの値を $FIREBASE_FILE にコピー"
            echo ""
            echo "必要な値:"
            echo "  - apiKey"
            echo "  - authDomain"
            echo "  - projectId"
            echo "  - storageBucket"
            echo "  - messagingSenderId"
            echo "  - appId"
            echo "  - measurementId（アナリティクス用、オプション）"
            echo ""
            print_info "設定完了後、このスクリプトを再度実行してください。"
            exit 1
        else
            print_error "Firebaseテンプレートファイルが見つかりません: $FIREBASE_EXAMPLE"
            print_info "Firebase設定ファイル $FIREBASE_FILE を手動で作成してください"
            exit 1
        fi
    fi
}

# メインのデプロイ処理
deploy() {
    print_header "デプロイ開始"

    echo "📥 最新のコードを取得中..."
    git pull

    echo ""
    echo "🛑 コンテナを停止中（起動している場合）..."
    docker stop $CONTAINER_NAME 2>/dev/null || true

    echo "🗑  コンテナを削除中（存在する場合）..."
    docker rm $CONTAINER_NAME 2>/dev/null || true

    echo "🗑  古いイメージを削除中（存在する場合）..."
    docker rmi $IMAGE_NAME:latest 2>/dev/null || true

    echo ""
    echo "🔨 Dockerイメージをビルド中..."
    docker build --no-cache -t $IMAGE_NAME:latest .

    echo ""
    echo "▶️  新しいコンテナを起動中..."
    docker run \
      --name $CONTAINER_NAME \
      -p $PORT \
      -d \
      --restart unless-stopped \
      $IMAGE_NAME:latest

    echo ""
    print_success "デプロイが正常に完了しました！"
    echo ""
    print_info "コンテナはポート80で起動しています"
    print_info "ログを確認: docker logs -f $CONTAINER_NAME"
}

# メイン実行
main() {
    print_header "KnowYourCodeWeb デプロイ"

    check_dependencies
    check_firebase_config
    deploy
}

# メイン関数を実行
main
