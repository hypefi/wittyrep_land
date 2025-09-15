#!/bin/bash

# Keyword Analysis Tool - Setup Script
# This script sets up the virtual environment and installs dependencies

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Keyword Analysis Tool - Setup${NC}"
echo -e "${BLUE}===================================${NC}"
echo ""

# Check Python version
python_version=$(python --version 2>&1)
echo -e "${BLUE}📋 Python version: ${python_version}${NC}"

# Create virtual environment
echo -e "${YELLOW}🔧 Creating virtual environment...${NC}"
if python -m venv keyword_env; then
    echo -e "${GREEN}✅ Virtual environment created successfully${NC}"
else
    echo -e "${RED}❌ Failed to create virtual environment${NC}"
    exit 1
fi

# Activate and install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
if source keyword_env/bin/activate && pip install -r requirements.txt; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo -e "${BLUE}Usage examples:${NC}"
echo "  ./run.sh --seeds \"crypto jobs, web3 careers\""
echo "  ./run.sh --file seeds.txt --recursive"
echo "  ./run.sh --seeds \"whatsapp automation\" --variations"
echo ""
echo -e "${BLUE}Or activate manually:${NC}"
echo "  source keyword_env/bin/activate"
echo "  python main.py --help"
