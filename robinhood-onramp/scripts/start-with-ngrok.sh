#!/bin/bash

# Start ngrok in background
echo "🚀 Starting ngrok tunnel on port 3030..."
ngrok http 3030 --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])" 2>/dev/null)

if [ -n "$NGROK_URL" ]; then
    echo "✅ ngrok running at: $NGROK_URL"
    echo "   Dashboard: http://localhost:4040"
    echo ""
    echo "⚠️  Make sure your .env.local has:"
    echo "   APP_URL=$NGROK_URL"
    echo ""
else
    echo "❌ Failed to start ngrok"
    exit 1
fi

# Trap to kill ngrok when script exits
trap "echo ''; echo '🛑 Stopping ngrok...'; kill $NGROK_PID 2>/dev/null" EXIT INT TERM

# Start Next.js dev server
echo "🚀 Starting Next.js dev server..."
npm run dev

# This will keep the script running until Ctrl+C
wait

