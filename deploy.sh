#!/bin/bash

# 냉장고 관리 앱 배포 스크립트

set -e

echo "🚀 냉장고 관리 앱 배포 시작..."

# 1. 기존 컨테이너 정리
echo "📦 기존 컨테이너 정리 중..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# 2. Docker 이미지 빌드
echo "🔨 Docker 이미지 빌드 중..."
docker-compose -f docker-compose.prod.yml build --no-cache

# 3. 데이터베이스 시작
echo "🗄️ 데이터베이스 시작 중..."
docker-compose -f docker-compose.prod.yml up -d postgres

# 4. 데이터베이스 준비 대기
echo "⏳ 데이터베이스 준비 대기 중..."
sleep 5

# 5. Prisma 마이그레이션 실행
echo "🔄 데이터베이스 마이그레이션 실행 중..."
docker-compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy

# 6. 앱 시작
echo "🎯 앱 시작 중..."
docker-compose -f docker-compose.prod.yml up -d app

# 7. 상태 확인
echo "✅ 배포 완료!"
echo ""
echo "📊 컨테이너 상태:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🌐 접속 정보:"
echo "  - 로컬: http://localhost:3001"
echo "  - 도메인: https://fridge.ian-rounge.store (Caddy 설정 후)"
echo ""
echo "📝 로그 확인:"
echo "  docker-compose -f docker-compose.prod.yml logs -f app"
