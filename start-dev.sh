#!/bin/bash

echo "🎮 启动1024游戏开发环境..."

# 检查是否安装依赖
echo "检查依赖..."
if [ ! -d "backend/node_modules" ]; then
    echo "安装后端依赖..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "安装前端依赖..."
    cd frontend && npm install && cd ..
fi

# 启动后端
echo "启动后端服务器..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 3

# 启动前端
echo "启动前端开发服务器..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║                                       ║"
echo "║       🎮 1024 Game 开发环境         ║"
echo "║                                       ║"
echo "║  前端: http://localhost:5173         ║"
echo "║  后端: http://localhost:3000         ║"
echo "║                                       ║"
echo "║  按 Ctrl+C 停止所有服务              ║"
echo "║                                       ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# 捕获Ctrl+C
trap "echo '停止所有服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# 等待
wait
