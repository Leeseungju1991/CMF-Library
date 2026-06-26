#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# deploy-cloudfront.sh — CMF Library (Vite SPA) 를 S3 + CloudFront 로 배포.
#
# Firebase Hosting 과 병행하는 CloudFront 배포 경로.
# 배포 대상: https://d11zdg3ax3cxya.cloudfront.net
#
# 동작:
#   1) (--build 시) npm ci && npm run build → dist/
#   2) dist/ → S3 sync (--delete). 해시 에셋은 immutable 장기 캐시.
#   3) index.html 은 no-cache (새 배포 즉시 반영).
#   4) CloudFront invalidation /index.html (SPA 진입점).
#
# SPA 라우팅: CloudFront 배포의 Custom Error Response 에서
#   403/404 → /index.html (200) 매핑이 설정돼 있어야 한다 (firebase rewrites 등가).
#
# 필요 환경변수 (또는 인자):
#   S3_BUCKET                    배포 대상 S3 버킷명            (필수)
#   CLOUDFRONT_DISTRIBUTION_ID   CloudFront 배포 ID            (필수)
#   AWS_REGION                   기본 ap-northeast-2
#   (--build 시) VITE_FIREBASE_* 빌드 env
#
# 사용:
#   S3_BUCKET=b CLOUDFRONT_DISTRIBUTION_ID=E1 bash scripts/deploy-cloudfront.sh --build
# -----------------------------------------------------------------------------
set -euo pipefail

BUCKET="${S3_BUCKET:-}"
DIST_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"
REGION="${AWS_REGION:-ap-northeast-2}"
DO_BUILD=0

while [ $# -gt 0 ]; do
  case "$1" in
    --bucket) BUCKET="$2"; shift 2 ;;
    --dist)   DIST_ID="$2"; shift 2 ;;
    --region) REGION="$2"; shift 2 ;;
    --build)  DO_BUILD=1; shift ;;
    -h|--help) grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "ERR: unknown arg $1" >&2; exit 2 ;;
  esac
done

[ -n "$BUCKET" ]  || { echo "ERR: S3_BUCKET (또는 --bucket) 필요" >&2; exit 2; }
[ -n "$DIST_ID" ] || { echo "ERR: CLOUDFRONT_DISTRIBUTION_ID (또는 --dist) 필요" >&2; exit 2; }
command -v aws >/dev/null || { echo "ERR: aws CLI 필요" >&2; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

if [ "$DO_BUILD" -eq 1 ]; then
  echo "==> build (npm ci && npm run build)"
  npm ci
  npm run build
fi
[ -d dist ] || { echo "ERR: dist/ 없음 — 먼저 빌드하세요 (--build)" >&2; exit 1; }

echo "==> sync dist/ to s3://$BUCKET/  (region=$REGION)"
# 해시 에셋(assets/*) 은 immutable 장기 캐시. index.html 은 아래에서 별도 처리.
aws s3 sync dist/ "s3://$BUCKET/" \
  --region "$REGION" \
  --exclude "index.html" \
  --cache-control "public, max-age=31536000, immutable" \
  --delete

echo
echo "==> index.html (no-cache)"
aws s3 cp dist/index.html "s3://$BUCKET/index.html" --region "$REGION" \
  --content-type "text/html; charset=utf-8" \
  --cache-control "no-cache, max-age=0, must-revalidate"

echo
echo "==> CloudFront invalidation"
INVAL=$(aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/index.html" "/" --query 'Invalidation.Id' --output text)
echo "  invalidation id: $INVAL"

echo
echo "==> Done — https://d11zdg3ax3cxya.cloudfront.net"
echo "    (invalidation 완료까지 1-3 분)"
