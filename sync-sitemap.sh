#!/bin/bash

# Sitemap Synchronization Shell Script
# This is a convenient wrapper around the Node.js sync-sitemap.js script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SYNC_SCRIPT="$SCRIPT_DIR/scripts/sync-sitemap.js"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed or not in PATH"
    exit 1
fi

# Check if the sync script exists
if [ ! -f "$SYNC_SCRIPT" ]; then
    print_error "Sync script not found at: $SYNC_SCRIPT"
    exit 1
fi

# Print header
echo "========================================="
echo "       Sitemap Synchronization Tool     "
echo "========================================="
echo

# Change to the project directory
cd "$SCRIPT_DIR" || {
    print_error "Failed to change to project directory"
    exit 1
}

# Run the Node.js script with all passed arguments
print_status "Running sitemap synchronization..."
node "$SYNC_SCRIPT" "$@"

# Check the exit code
if [ $? -eq 0 ]; then
    print_success "Sitemap synchronization completed!"
    echo
    print_status "Next steps:"
    echo "  1. Review the updated sitemap.xml files"
    echo "  2. Commit the changes to your repository"
    echo "  3. Deploy to update your live sitemap"
else
    print_error "Sitemap synchronization failed!"
    exit 1
fi
