#!/bin/bash

# Keyword Analysis Tool - Easy Runner Script
# This script activates the virtual environment and runs the tool

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Keyword Analysis Tool${NC}"
echo -e "${BLUE}========================${NC}"

# Check if virtual environment exists
if [ ! -d "keyword_env" ]; then
    echo -e "${RED}❌ Virtual environment not found. Please run:${NC}"
    echo "python -m venv keyword_env"
    echo "source keyword_env/bin/activate"
    echo "pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment and run the tool
echo -e "${GREEN}🚀 Activating environment and running tool...${NC}"
echo ""

source keyword_env/bin/activate && python main.py "$@"
