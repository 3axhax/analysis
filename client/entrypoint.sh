#!/bin/sh

if [ "$BUILD_MODE" = "build" ]; then
    echo "Running in production mode - building application..."
    npm run build
    exec npm run preview
elif [ "$BUILD_MODE" = "dev" ]; then
    echo "Running in development mode..."
    exec npm run dev
fi