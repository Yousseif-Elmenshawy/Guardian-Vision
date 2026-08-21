#!/bin/bash
# =============================================================================
# Guardian Vision - Full Build & Deployment Script
# =============================================================================
# This script builds both the React frontend and Go backend,
# embeds the frontend build into the Go binary, and produces
# a single executable for deployment.
#
# Usage:
#   ./scripts/build.sh              # Build for current OS/arch
#   ./scripts/build.sh production   # Production build (single binary)
#   ./scripts/build.sh dev          # Development build (frontend + backend separate)
#
# Prerequisites:
#   - Node.js 18+ with npm
#   - Go 1.21+
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/Backend"
FRONTEND_DIR="$PROJECT_ROOT"
BUILD_MODE="${1:-production}" # default to production

# -----------------------------------------------------------------------------
# 1. Build the React Frontend
# -----------------------------------------------------------------------------
build_frontend() {
  info "Step 1: Building React frontend..."

  cd "$FRONTEND_DIR"

  if [ ! -f "package.json" ]; then
    error "package.json not found in $FRONTEND_DIR. Are you in the right directory?"
  fi

  # Install dependencies if needed
  if [ ! -d "node_modules" ]; then
    info "Installing frontend dependencies..."
    npm install
  fi

  # Build the production bundle
  info "Running: npm run build"
  npm run build

  if [ ! -d "dist" ]; then
    error "Frontend build failed: dist/ directory not found."
  fi

  info "Frontend build complete: dist/ generated."
}

# -----------------------------------------------------------------------------
# 2. Copy Build to Go Backend
# -----------------------------------------------------------------------------
copy_to_backend() {
  info "Step 2: Copying frontend build to Go backend..."

  STATIC_DIR="$BACKEND_DIR/internal/static/dist"

  # Remove old static files
  rm -rf "$STATIC_DIR"
  mkdir -p "$STATIC_DIR"

  # Copy new build
  cp -r "$FRONTEND_DIR/dist/"* "$STATIC_DIR/"

  info "Frontend build copied to $STATIC_DIR"
}

# -----------------------------------------------------------------------------
# 3. Build the Go Binary
# -----------------------------------------------------------------------------
build_backend() {
  info "Step 3: Building Go binary..."

  cd "$BACKEND_DIR"

  # Determine output binary name
  BINARY_NAME="guardian-vision-server"
  if [ "$OS" = "Windows_NT" ]; then
    BINARY_NAME="${BINARY_NAME}.exe"
  fi

  # Build flags for production:
  #   -ldflags="-s -w"  strips debug info and symbol tables for smaller binary
  #   CGO_ENABLED=0    produces a fully static binary (no C library dependencies)
  info "Running: CGO_ENABLED=0 go build -ldflags='-s -w' -o $BINARY_NAME ."
  CGO_ENABLED=0 go build -ldflags="-s -w" -o "$BINARY_NAME" .

  if [ ! -f "$BINARY_NAME" ]; then
    error "Go build failed: $BINARY_NAME not found."
  fi

  info "Go binary created: $BACKEND_DIR/$BINARY_NAME"
}

# -----------------------------------------------------------------------------
# 4. Cleanup (remove temp dist from backend)
# -----------------------------------------------------------------------------
cleanup() {
  if [ "$BUILD_MODE" = "production" ]; then
    info "Cleanup: Removing temporary dist/ from backend (it's embedded in the binary)..."
    rm -rf "$BACKEND_DIR/internal/static/dist"
  fi
}

# -----------------------------------------------------------------------------
# Main Pipeline
# -----------------------------------------------------------------------------
main() {
  echo ""
  echo "=============================================="
  echo "  Guardian Vision - Build Pipeline"
  echo "  Mode: $BUILD_MODE"
  echo "=============================================="
  echo ""

  build_frontend
  copy_to_backend
  build_backend
  cleanup

  echo ""
  echo "=============================================="
  info "Build complete!"
  echo ""
  if [ "$BUILD_MODE" = "production" ]; then
    echo "  To run the production server:"
    echo "    cd $BACKEND_DIR && GV_ENV=production GV_PORT=8080 ./guardian-vision-server"
    echo ""
    echo "  Then open: http://localhost:8080"
  else
    echo "  To run: cd $BACKEND_DIR && ./guardian-vision-server"
  fi
  echo "=============================================="
}

main