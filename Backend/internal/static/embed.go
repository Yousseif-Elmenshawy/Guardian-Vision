package static

import (
	"embed"
)

//go:embed "dist"
// Files holds the embedded React production build output.
// The "dist" directory is the frontend's production build (result of `npm run build`).
//
// During development: dist/ contains a placeholder index.html.
// For production: run the build pipeline to populate dist/ with the actual React build,
// then compile the Go binary.
//
// Build pipeline:
//
//	cd frontend/
//	npm run build
//	cp -r dist/ ../Backend/internal/static/dist/
//	cd ../Backend/
//	CGO_ENABLED=0 go build -ldflags="-s -w" -o server .
//
// Or use: ./scripts/build.sh
var Files embed.FS