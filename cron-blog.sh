#!/bin/bash

# Navigate to your project directory
cd /Users/mac/WORK/CODE/wittyreply_landingpage/landing-page

# Log the execution
echo "$(date): Starting daily blog generation" >> logs/cron.log

# Generate new blog posts
node scripts/daily-automation.js generate 1 >> logs/cron.log 2>&1

# Check if posts were generated
if [ -n "$(find posts/ -name "blog-*-$(date +%Y-%m-%d).html" -newer posts/)" ]; then
    echo "$(date): New posts generated, committing to Git" >> logs/cron.log
    
    # Stage all changes
    git add . >> logs/cron.log 2>&1
    
    # Commit with timestamp
    git commit -m "Auto-generate blog posts for $(date +%Y-%m-%d)" >> logs/cron.log 2>&1
    
    # Push to trigger Cloudflare deployment
    git push origin main >> logs/cron.log 2>&1
    
    echo "$(date): Git commit and push completed" >> logs/cron.log
else
    echo "$(date): No new posts generated" >> logs/cron.log
fi

echo "$(date): Cron job completed" >> logs/cron.log