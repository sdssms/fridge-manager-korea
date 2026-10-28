# 🚀 홈서버 배포 가이드

## 📋 사전 준비

### 1. 도메인 DNS 설정 (가비아)
```
fridge.ian-rounge.store  A  122.32.73.14
```

### 2. 공유기 포트포워딩
- 외부 포트: 443 (HTTPS)
- 내부 IP: Mac Mini IP
- 내부 포트: 443

---

## 🔧 배포 단계

### 1단계: 프로젝트 클론 (이미 완료)
```bash
cd ~/fridge-manager-korea
git pull origin main
```

### 2단계: 환경 변수 설정
```bash
# .env.production 파일 수정
nano .env.production

# 내용:
DATABASE_URL="postgresql://postgres:STRONG_PASSWORD@localhost:5433/fridge_manager"
DB_PASSWORD=STRONG_PASSWORD
```

### 3단계: 자동 배포 스크립트 실행
```bash
cd ~/fridge-manager-korea
./deploy.sh
```

### 4단계: Caddy 설정 추가

**방법 A: 기존 Caddy 컨테이너에 추가**
```bash
# 기존 Caddyfile 위치 찾기
docker exec macmini-edge-caddy-1 cat /etc/caddy/Caddyfile

# 아래 내용 추가:
fridge.ian-rounge.store {
  encode zstd gzip
  header {
    -Server
    Strict-Transport-Security "max-age=31536000"
  }
  reverse_proxy host.docker.internal:3001
}

# Caddy 재시작
docker restart macmini-edge-caddy-1
```

**방법 B: 새 Caddy 컨테이너 (포트 충돌 시)**
```bash
cd ~/fridge-manager-korea
cp Caddyfile.example Caddyfile

docker run -d \
  --name fridge-caddy \
  --network host \
  -v $(pwd)/Caddyfile:/etc/caddy/Caddyfile \
  -v caddy_data:/data \
  caddy:latest
```

---

## ✅ 배포 확인

### 1. 컨테이너 상태 확인
```bash
docker-compose -f docker-compose.prod.yml ps
```

예상 출력:
```
NAME                    STATUS              PORTS
fridge-manager-app      Up 2 minutes        0.0.0.0:3001->3001/tcp
fridge-manager-db       Up 2 minutes        0.0.0.0:5433->5432/tcp
```

### 2. 로그 확인
```bash
# 앱 로그
docker-compose -f docker-compose.prod.yml logs -f app

# 데이터베이스 로그
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### 3. 로컬 접속 테스트
```bash
curl http://localhost:3001
```

### 4. 도메인 접속 테스트
```bash
curl https://fridge.ian-rounge.store
```

---

## 🔄 업데이트 방법

```bash
cd ~/fridge-manager-korea
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🛠️ 트러블슈팅

### 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :3001

# 기존 프로세스 종료
kill -9 <PID>
```

### 데이터베이스 연결 실패
```bash
# 데이터베이스 재시작
docker-compose -f docker-compose.prod.yml restart postgres

# 연결 테스트
docker exec -it fridge-manager-db psql -U postgres -d fridge_manager
```

### Caddy 인증서 문제
```bash
# Caddy 로그 확인
docker logs macmini-edge-caddy-1

# 인증서 강제 갱신
docker exec macmini-edge-caddy-1 caddy reload --config /etc/caddy/Caddyfile
```

---

## 📊 모니터링

### 리소스 사용량 확인
```bash
docker stats fridge-manager-app fridge-manager-db
```

### 디스크 사용량
```bash
docker system df
```

### 백업
```bash
# 데이터베이스 백업
docker exec fridge-manager-db pg_dump -U postgres fridge_manager > backup_$(date +%Y%m%d).sql
```

---

## 🔒 보안 권장 사항

1. **.env.production** 파일 권한 설정
   ```bash
   chmod 600 .env.production
   ```

2. **방화벽 설정** (macOS)
   ```bash
   sudo pfctl -e
   ```

3. **정기 업데이트**
   ```bash
   # 주 1회 실행 권장
   docker-compose -f docker-compose.prod.yml pull
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

## 📱 접속 주소

- **개발**: http://localhost:3000
- **프로덕션**: https://fridge.ian-rounge.store
- **API**: https://fridge.ian-rounge.store/api
- **데이터베이스**: localhost:5433

---

## 📞 문제 발생 시

1. GitHub Issues: https://github.com/sdssms/fridge-manager-korea/issues
2. 로그 확인: `docker-compose -f docker-compose.prod.yml logs`
3. 재시작: `./deploy.sh`
