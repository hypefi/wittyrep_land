# Keyword Analysis Tool 🔍

A comprehensive Python command-line tool for generating and analyzing keyword ideas for startups. Uses Google Autocomplete and Google Trends to discover high-potential keywords with trend analysis.

## Features ✨

### Core Features (Free)
- **Google Autocomplete Integration**: Fetch keyword suggestions from Google's autocomplete API
- **Google Trends Analysis**: Get trend scores (0-100) for the last 30 days
- **Recursive Expansion**: Automatically discover related keywords from suggestions
- **Multi-language Support**: Support for different languages and regions
- **Smart Filtering**: Filter by length, phrase matching, and deduplication
- **CSV Export**: Clean, organized output with trend scores
- **Rate Limiting**: Respectful API usage with built-in delays
- **Error Handling**: Robust error handling for network issues and API limits

### Enhanced Features (Paid Google API) 🚀
- **Accurate Search Volume**: Real monthly search volume estimates
- **Competition Analysis**: Competition levels and difficulty scoring
- **Opportunity Scoring**: AI-powered keyword opportunity assessment (0-100)
- **Difficulty Scoring**: Ranking difficulty analysis based on competition
- **Automated Recommendations**: HIGH_PRIORITY, MEDIUM_PRIORITY, CONSIDER classifications
- **Comprehensive Reports**: Detailed analysis reports with actionable insights
- **Seasonal Trends**: Monthly trend patterns for strategic timing
- **Enhanced CSV Export**: Extended metrics including CPC estimates

## Quick Start 🚀

### Installation

1. **Clone or download the tool**:
```bash
git clone <your-repo> keyword-tool
cd keyword-tool
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Run your first analysis**:
```bash
python main.py --seeds "crypto jobs, web3 careers"
```

### Basic Usage

**From command line arguments**:
```bash
python main.py --seeds "crypto jobs, web3 careers, blockchain developer"
```

**From a text file**:
```bash
python main.py --file seeds.txt
```

**With recursive expansion**:
```bash
python main.py --seeds "crypto jobs" --recursive --output crypto_keywords.csv
```

## Usage Examples 📖

### Example 1: Basic Analysis
```bash
python main.py --seeds "crypto jobs, web3 careers"
```

### Example 2: Recursive Expansion
```bash
python main.py --seeds "blockchain" --recursive --max-depth 3
```

### Example 3: Keyword Variations
```bash
python main.py --seeds "crypto" --variations
```

### Example 4: Multi-language Analysis
```bash
python main.py --seeds "emplois crypto" --language fr --country FR --geo FR
```

### Example 5: Filtered Results
```bash
python main.py --file seeds.txt --min-length 10 --phrase-match "remote"
```

### Example 6: Custom Output
```bash
python main.py --seeds "startup jobs" --output startup_analysis.csv --verbose
```

### Example 7: Enhanced Analysis (Paid API)
```bash
# Get keyword recommendations with Google API
python main.py --seeds "whatsapp automation" \
               --google-api-key YOUR_API_KEY \
               --analyze \
               --generate-report

# Advanced analysis with top 20 recommendations
python main.py --file seeds.txt \
               --google-api-key YOUR_API_KEY \
               --analyze \
               --top-recommendations 20 \
               --generate-report
```

## Seeds File Format 📝

Create a `seeds.txt` file with your keywords:

```text
# Crypto and Web3 Keywords
crypto jobs
blockchain developer
web3 careers
defi protocols

# Startup Keywords  
startup funding
venture capital
tech startups

# One keyword per line, or comma-separated
remote work, freelance, digital nomad
```

- One keyword per line OR comma-separated
- Lines starting with `#` are treated as comments
- Empty lines are ignored

## Command Line Options 🛠️

### Required (choose one):
- `--seeds "keyword1, keyword2"` - Comma-separated seed keywords
- `--file path/to/seeds.txt` - Path to seeds file

### Expansion Options:
- `--recursive` - Enable recursive keyword expansion (slower but comprehensive)
- `--variations` - Generate variations with prefixes/suffixes
- `--max-depth N` - Maximum recursion depth (default: 2)

### Configuration:
- `--output filename.csv` - Output file (default: keyword_analysis.csv)
- `--language en` - Language code (default: en)
- `--country US` - Country code for autocomplete (default: US)  
- `--geo US` - Geographic region for trends (default: US)

### Filtering:
- `--min-length N` - Minimum keyword length
- `--max-length N` - Maximum keyword length
- `--phrase-match "text"` - Only keywords containing this phrase
- `--no-dedup` - Disable deduplication

### Other:
- `--verbose` - Enable detailed logging
- `--dry-run` - Show what would be analyzed without API calls

### Enhanced Analysis:
- `--google-api-key API_KEY` - Google Cloud API key for paid features
- `--analyze` - Perform advanced keyword analysis and recommendations
- `--top-recommendations N` - Number of top recommendations to show (default: 10)
- `--generate-report` - Generate comprehensive analysis report

## Output Format 📊

### Basic Output (Free)
The tool exports results to CSV with these columns:

| Column | Description | Example |
|--------|-------------|---------|
| `keyword` | The discovered keyword | "crypto jobs remote" |
| `source` | Where it was found | "autocomplete" or "trends_related" |
| `trend_score` | Google Trends score (0-100) | 75.5 |
| `error` | Any error message | "" or "No trend data" |

### Enhanced Output (Paid API)
Extended CSV with additional metrics:

| Column | Description | Example |
|--------|-------------|---------|
| `keyword` | The discovered keyword | "whatsapp automation" |
| `search_volume` | Monthly search volume | 8100 |
| `competition` | Competition level | "MEDIUM" |
| `competition_score` | Competition score (0-1) | 0.6 |
| `opportunity_score` | Opportunity score (0-100) | 78.2 |
| `difficulty_score` | Difficulty score (0-100) | 45.3 |
| `recommendation` | Priority level | "HIGH_PRIORITY" |
| `cpc_low` / `cpc_high` | Cost-per-click range | 1.20 / 3.45 |

### Sample Enhanced Output:
```csv
keyword,search_volume,opportunity_score,difficulty_score,recommendation
whatsapp automation,8100,78.2,45.3,HIGH_PRIORITY
customer support automation,5400,85.1,32.7,HIGH_PRIORITY
chatbot for business,12000,72.8,68.4,MEDIUM_PRIORITY
```

## Multi-language Support 🌍

The tool supports multiple languages and regions:

### English (US):
```bash
python main.py --seeds "crypto jobs" --language en --country US --geo US
```

### French (France):
```bash
python main.py --seeds "emplois crypto" --language fr --country FR --geo FR
```

### Arabic (UAE):
```bash
python main.py --seeds "وظائف البلوك تشين" --language ar --country AE --geo AE
```

### Common Language/Country Codes:
- English: `en` / `US`, `GB`, `AU`, `CA`
- French: `fr` / `FR`, `CA`
- Spanish: `es` / `ES`, `MX`, `AR`
- German: `de` / `DE`, `AT`, `CH`
- Arabic: `ar` / `AE`, `SA`, `EG`
- Japanese: `ja` / `JP`
- Chinese: `zh` / `CN`, `TW`, `HK`

## Advanced Features 🔧

### Recursive Expansion
Automatically discovers related keywords by analyzing suggestions:

```bash
python main.py --seeds "crypto" --recursive --max-depth 2
```

**How it works**:
1. Gets suggestions for "crypto" → ["crypto jobs", "crypto news", "crypto wallet"]
2. Gets suggestions for each result → ["crypto jobs remote", "crypto jobs salary", ...]
3. Continues until max-depth reached

### Keyword Variations
Tries common prefixes and suffixes:

```bash
python main.py --seeds "crypto" --variations
```

**Automatically tries**:
- Prefixes: "what is crypto", "how to crypto", "best crypto", "top crypto"
- Suffixes: "crypto jobs", "crypto career", "crypto salary", "crypto course"

### Smart Filtering
Remove irrelevant results:

```bash
python main.py --seeds "jobs" --min-length 15 --phrase-match "remote" --max-length 50
```

## Troubleshooting 🔧

### Common Issues:

**1. "No trend data" for keywords**:
- Google Trends has limited data for low-volume keywords
- Try more popular/general keywords
- Some regions have less trend data

**2. Rate limiting / Too many requests**:
- The tool includes built-in delays
- Reduce `--max-depth` for recursive searches
- Try again later if you hit limits

**3. Network errors**:
- Check your internet connection
- Some regions may block Google services
- Try using a VPN if needed

**4. Empty results**:
- Try different seed keywords
- Check language/country settings
- Some keywords may not have autocomplete suggestions

### Debug Mode:
```bash
python main.py --seeds "test" --verbose --dry-run
```

## Technical Details 🔬

### Architecture:
- **`fetch_autocomplete.py`**: Google Autocomplete API integration
- **`fetch_trends.py`**: Google Trends (pytrends) integration  
- **`main.py`**: CLI orchestrator and CSV export

### API Rate Limits:
- **Google Autocomplete**: ~1 request per second (built-in delays)
- **Google Trends**: ~5 keywords per request, 1 request per 3-6 seconds

### Data Sources:
- **Google Autocomplete**: `suggestqueries.google.com` (unofficial API)
- **Google Trends**: Official pytrends library

## Development 👨‍💻

### Running Tests:
```bash
# Test autocomplete
python fetch_autocomplete.py

# Test trends
python fetch_trends.py

# Test full pipeline
python main.py --seeds "test keyword" --dry-run --verbose
```

### Adding Features:
The modular design makes it easy to extend:

1. **New data sources**: Add modules like `fetch_semrush.py`
2. **New filters**: Extend `filter_keywords()` method
3. **New export formats**: Add JSON, Excel export options

## Enhanced Features Setup 🚀

To use the advanced keyword analysis features:

### 1. Get Google Cloud API Key
```bash
# 1. Create Google Cloud Project at console.cloud.google.com
# 2. Enable Google Trends API
# 3. Create API key in "APIs & Services" > "Credentials"
# 4. Set up billing (required for API access)
```

### 2. Use Enhanced Analysis
```bash
# Basic enhanced analysis
python main.py --seeds "your keywords" \
               --google-api-key YOUR_API_KEY \
               --analyze

# Full analysis with report
python main.py --seeds "your keywords" \
               --google-api-key YOUR_API_KEY \
               --analyze \
               --generate-report \
               --top-recommendations 15
```

### 3. Understanding Results
- **HIGH_PRIORITY**: Target immediately (high opportunity, low difficulty)
- **MEDIUM_PRIORITY**: Add to content calendar (good balance)
- **CONSIDER**: Research further before targeting
- **LONG_TERM**: High opportunity but requires sustained effort

📖 **See `ENHANCED_FEATURES.md` for complete setup guide and pricing information.**

## License 📄

This tool is provided as-is for educational and commercial use. Please respect API rate limits and terms of service for Google's services.

## Support 💬

For issues, questions, or feature requests:
1. Check the troubleshooting section above
2. Run with `--verbose` flag for detailed logs
3. Create an issue with error details and command used

---

**Happy keyword hunting! 🎯**
