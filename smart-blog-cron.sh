#!/bin/bash

PROJECT_DIR="/Users/mac/WORK/CODE/wittyreply_landingpage/landing-page"
LOG_FILE="$PROJECT_DIR/logs/smart-cron.log"

cd "$PROJECT_DIR"

log() {
    echo "$(date): $1" >> "$LOG_FILE"
}

log "🚀 Starting smart blog generation..."

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Get the last generation date
LAST_GEN_FILE="$PROJECT_DIR/.last-generation"
if [ -f "$LAST_GEN_FILE" ]; then
    LAST_GEN=$(cat "$LAST_GEN_FILE")
else
    # If no last generation file, start from yesterday (macOS compatible)
    LAST_GEN=$(date -v-1d +%Y-%m-%d)
fi

# Get today's date
TODAY=$(date +%Y-%m-%d)

log "Last generation: $LAST_GEN"
log "Today: $TODAY"

# Convert dates to seconds for comparison (macOS compatible)
LAST_GEN_SECONDS=$(date -j -f "%Y-%m-%d" "$LAST_GEN" "+%s" 2>/dev/null || echo "0")
TODAY_SECONDS=$(date -j -f "%Y-%m-%d" "$TODAY" "+%s")

# Calculate days difference
DAYS_TO_CATCH_UP=$(( (TODAY_SECONDS - LAST_GEN_SECONDS) / 86400 ))

log "Days to catch up: $DAYS_TO_CATCH_UP"

# Generate posts for missed days
if [ $DAYS_TO_CATCH_UP -gt 0 ]; then
    log "📝 Generating posts for $DAYS_TO_CATCH_UP missed days..."
    
    # Generate posts (1 per day)
    node scripts/daily-automation.js generate $DAYS_TO_CATCH_UP >> "$LOG_FILE" 2>&1
    
    if [ $? -eq 0 ]; then
        log "✅ Posts generated successfully"
        
        # Check if there are new files to commit
        if [ -n "$(git status --porcelain)" ]; then
            log "📁 Staging changes..."
            git add . >> "$LOG_FILE" 2>&1
            
            log "💾 Committing changes..."
            git commit -m "Auto-generate blog posts for $DAYS_TO_CATCH_UP days ($LAST_GEN to $TODAY)" >> "$LOG_FILE" 2>&1
            
            log "🚀 Pushing to GitHub..."
            git push origin main >> "$LOG_FILE" 2>&1
            
            if [ $? -eq 0 ]; then
                log "✅ Successfully pushed to GitHub"
            else
                log "❌ Failed to push to GitHub"
            fi
        else
            log "ℹ️ No new changes to commit"
        fi
    else
        log "❌ Failed to generate posts"
    fi
else
    log "ℹ️ No days to catch up"
fi

# Update last generation date
echo "$TODAY" > "$LAST_GEN_FILE"

log "🎉 Smart blog generation completed"
