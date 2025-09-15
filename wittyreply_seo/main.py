#!/usr/bin/env python3
"""
Keyword Analysis Tool - Main CLI Interface

A comprehensive tool for generating and analyzing keyword ideas for startups.
Uses Google Autocomplete and Google Trends data to provide insights.

Usage:
    python main.py --seeds "crypto jobs, web3 careers"
    python main.py --file seeds.txt --recursive --output results.csv
"""

import argparse
import sys
import os
import pandas as pd
import numpy as np
import logging
from typing import List, Dict, Set, Optional
from datetime import datetime
import json

# Import our custom modules
from fetch_autocomplete import (
    fetch_google_autocomplete, 
    fetch_autocomplete_recursive, 
    fetch_autocomplete_variations,
    AutocompleteError
)
from fetch_trends import (
    TrendsClient, 
    get_keyword_trends,
    TrendsError
)
from fetch_trends_api import (
    GoogleTrendsAPI,
    KeywordAnalyzer,
    KeywordMetrics,
    create_enhanced_trends_client
)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


class KeywordTool:
    """Main keyword analysis orchestrator and CLI tool."""
    
    def __init__(self, language: str = 'en', country: str = 'US', geo: str = 'US', 
                 google_api_key: Optional[str] = None):
        """
        Initialize the keyword analyzer.
        
        Args:
            language (str): Language code for autocomplete
            country (str): Country code for autocomplete  
            geo (str): Geographic region for trends
            google_api_key (Optional[str]): Google API key for enhanced features
        """
        self.language = language
        self.country = country
        self.geo = geo
        self.google_api_key = google_api_key
        self.trends_client = None
        self.enhanced_trends_api = None
        self.keyword_analyzer = None
        
        # Initialize basic trends client
        try:
            self.trends_client = TrendsClient(language=f'{language}-{country}')
        except Exception as e:
            logger.warning(f"Could not initialize basic trends client: {e}")
        
        # Initialize enhanced trends API if API key provided
        if google_api_key:
            try:
                self.enhanced_trends_api = create_enhanced_trends_client(google_api_key)
                from fetch_trends_api import KeywordAnalyzer as EnhancedAnalyzer
                self.keyword_analyzer = EnhancedAnalyzer(self.enhanced_trends_api)
                logger.info("Enhanced Google Trends API initialized with paid access")
            except Exception as e:
                logger.warning(f"Could not initialize enhanced trends API: {e}")
    
    def load_seeds_from_file(self, file_path: str) -> List[str]:
        """
        Load seed keywords from a text file.
        
        Args:
            file_path (str): Path to the seeds file
        
        Returns:
            List[str]: List of seed keywords
        """
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Seeds file not found: {file_path}")
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Split by lines and commas, clean up
            seeds = []
            for line in content.split('\n'):
                line = line.strip()
                if line and not line.startswith('#'):  # Skip empty lines and comments
                    # Split by commas and clean
                    line_seeds = [seed.strip() for seed in line.split(',') if seed.strip()]
                    seeds.extend(line_seeds)
            
            logger.info(f"Loaded {len(seeds)} seed keywords from {file_path}")
            return seeds
            
        except Exception as e:
            logger.error(f"Error loading seeds from file: {e}")
            raise
    
    def parse_seeds_from_string(self, seeds_string: str) -> List[str]:
        """
        Parse seed keywords from a comma-separated string.
        
        Args:
            seeds_string (str): Comma-separated keywords
        
        Returns:
            List[str]: List of seed keywords
        """
        seeds = [seed.strip() for seed in seeds_string.split(',') if seed.strip()]
        logger.info(f"Parsed {len(seeds)} seed keywords from input string")
        return seeds
    
    def collect_autocomplete_keywords(self, seeds: List[str], recursive: bool = False, 
                                    variations: bool = False, max_depth: int = 2) -> Set[str]:
        """
        Collect keywords from Google Autocomplete.
        
        Args:
            seeds (List[str]): Seed keywords
            recursive (bool): Whether to expand recursively
            variations (bool): Whether to try prefix/suffix variations
            max_depth (int): Maximum recursion depth
        
        Returns:
            Set[str]: Collected keywords
        """
        all_keywords = set()
        
        logger.info(f"Collecting autocomplete keywords for {len(seeds)} seeds...")
        
        for seed in seeds:
            try:
                # Add the original seed
                all_keywords.add(seed)
                
                if recursive:
                    # Recursive expansion
                    recursive_keywords = fetch_autocomplete_recursive(
                        [seed], max_depth=max_depth, max_keywords_per_seed=5,
                        language=self.language, country=self.country
                    )
                    all_keywords.update(recursive_keywords)
                    
                elif variations:
                    # Try variations with prefixes/suffixes
                    variation_keywords = fetch_autocomplete_variations(
                        seed, language=self.language, country=self.country
                    )
                    all_keywords.update(variation_keywords)
                    
                else:
                    # Simple autocomplete
                    suggestions = fetch_google_autocomplete(
                        seed, language=self.language, country=self.country
                    )
                    all_keywords.update(suggestions)
                    
            except AutocompleteError as e:
                logger.warning(f"Failed to get autocomplete for '{seed}': {e}")
                continue
        
        logger.info(f"Collected {len(all_keywords)} unique keywords from autocomplete")
        return all_keywords
    
    def collect_trends_data(self, keywords: List[str]) -> Dict[str, Dict]:
        """
        Collect trend data for keywords.
        
        Args:
            keywords (List[str]): Keywords to analyze
        
        Returns:
            Dict[str, Dict]: Keyword data with trend scores
        """
        logger.info(f"Collecting trends data for {len(keywords)} keywords...")
        
        keyword_data = {}
        
        if not self.trends_client:
            logger.warning("Trends client not available, setting all scores to None")
            for keyword in keywords:
                keyword_data[keyword] = {
                    'keyword': keyword,
                    'source': 'autocomplete',
                    'trend_score': None,
                    'error': 'Trends client not available'
                }
            return keyword_data
        
        try:
            # Get trend scores in batches
            trend_scores = self.trends_client.get_batch_trends(
                keywords, timeframe='today 1-m', geo=self.geo
            )
            
            # Also try to get related queries for seed keywords (first few)
            related_keywords = set()
            for keyword in keywords[:3]:  # Only for first 3 to avoid overload
                try:
                    related = self.trends_client.get_related_queries(keyword)
                    related_keywords.update(related[:5])  # Top 5 related
                except:
                    continue
            
            # Process all keywords
            for keyword in keywords:
                keyword_data[keyword] = {
                    'keyword': keyword,
                    'source': 'autocomplete',
                    'trend_score': trend_scores.get(keyword),
                    'error': None
                }
            
            # Process related keywords from trends
            if related_keywords:
                logger.info(f"Found {len(related_keywords)} related keywords from trends")
                related_trends = self.trends_client.get_batch_trends(
                    list(related_keywords), timeframe='today 1-m', geo=self.geo
                )
                
                for keyword in related_keywords:
                    if keyword not in keyword_data:  # Avoid duplicates
                        keyword_data[keyword] = {
                            'keyword': keyword,
                            'source': 'trends_related',
                            'trend_score': related_trends.get(keyword),
                            'error': None
                        }
            
        except Exception as e:
            logger.error(f"Error collecting trends data: {e}")
            # Fallback: set all to None
            for keyword in keywords:
                if keyword not in keyword_data:
                    keyword_data[keyword] = {
                        'keyword': keyword,
                        'source': 'autocomplete',
                        'trend_score': None,
                        'error': str(e)
                    }
        
        logger.info(f"Completed trends analysis for {len(keyword_data)} keywords")
        return keyword_data
    
    def filter_keywords(self, keyword_data: Dict[str, Dict], 
                       min_length: int = None, max_length: int = None,
                       phrase_match: str = None) -> Dict[str, Dict]:
        """
        Filter keywords based on various criteria.
        
        Args:
            keyword_data (Dict): Keyword data dictionary
            min_length (int): Minimum keyword length
            max_length (int): Maximum keyword length
            phrase_match (str): Required phrase in keyword
        
        Returns:
            Dict[str, Dict]: Filtered keyword data
        """
        filtered_data = {}
        
        for keyword, data in keyword_data.items():
            # Length filters
            if min_length and len(keyword) < min_length:
                continue
            if max_length and len(keyword) > max_length:
                continue
            
            # Phrase match filter
            if phrase_match and phrase_match.lower() not in keyword.lower():
                continue
            
            filtered_data[keyword] = data
        
        logger.info(f"Filtered to {len(filtered_data)} keywords from {len(keyword_data)}")
        return filtered_data
    
    def deduplicate_keywords(self, keyword_data: Dict[str, Dict]) -> Dict[str, Dict]:
        """
        Remove duplicate and very similar keywords.
        
        Args:
            keyword_data (Dict): Keyword data dictionary
        
        Returns:
            Dict[str, Dict]: Deduplicated keyword data
        """
        # Simple deduplication - remove exact matches (case insensitive)
        seen = set()
        deduplicated = {}
        
        # Sort by trend score (highest first) to keep best duplicates
        sorted_keywords = sorted(
            keyword_data.items(),
            key=lambda x: x[1].get('trend_score') or 0,
            reverse=True
        )
        
        for keyword, data in sorted_keywords:
            keyword_lower = keyword.lower().strip()
            if keyword_lower not in seen:
                seen.add(keyword_lower)
                deduplicated[keyword] = data
        
        logger.info(f"Deduplicated to {len(deduplicated)} keywords from {len(keyword_data)}")
        return deduplicated
    
    def export_to_csv(self, keyword_data: Dict[str, Dict], output_file: str):
        """
        Export keyword data to CSV file.
        
        Args:
            keyword_data (Dict): Keyword data dictionary
            output_file (str): Output CSV file path
        """
        try:
            # Convert to DataFrame
            df_data = []
            for keyword, data in keyword_data.items():
                df_data.append({
                    'keyword': data['keyword'],
                    'source': data['source'],
                    'trend_score': data['trend_score'],
                    'error': data.get('error', '')
                })
            
            df = pd.DataFrame(df_data)
            
            # Sort by trend score (descending, None values last)
            df['trend_score_sort'] = df['trend_score'].fillna(-1)
            df = df.sort_values('trend_score_sort', ascending=False)
            df = df.drop('trend_score_sort', axis=1)
            
            # Export to CSV
            df.to_csv(output_file, index=False, encoding='utf-8')
            logger.info(f"Exported {len(df)} keywords to {output_file}")
            
            # Print summary statistics
            total_keywords = len(df)
            with_trends = len(df[df['trend_score'].notna()])
            avg_score = df['trend_score'].mean()
            
            print(f"\n📊 Export Summary:")
            print(f"Total keywords: {total_keywords}")
            print(f"Keywords with trend data: {with_trends}")
            print(f"Average trend score: {avg_score:.1f}" if pd.notna(avg_score) else "Average trend score: N/A")
            print(f"Output file: {output_file}")
            
        except Exception as e:
            logger.error(f"Error exporting to CSV: {e}")
            raise
    
    def perform_advanced_analysis(self, keywords: List[str]) -> List[KeywordMetrics]:
        """
        Perform advanced keyword analysis using enhanced API.
        
        Args:
            keywords (List[str]): Keywords to analyze
        
        Returns:
            List[KeywordMetrics]: Advanced analysis results
        """
        if not self.keyword_analyzer:
            logger.warning("Enhanced analysis not available. API key required.")
            return []
        
        logger.info("🔬 Performing advanced keyword analysis...")
        return self.keyword_analyzer.analyze_keywords(keywords, self.geo)
    
    def get_keyword_recommendations(self, keywords: List[str], top_n: int = 10) -> List[KeywordMetrics]:
        """
        Get top keyword recommendations with full analysis.
        
        Args:
            keywords (List[str]): Keywords to analyze
            top_n (int): Number of top recommendations
        
        Returns:
            List[KeywordMetrics]: Top recommended keywords
        """
        if not self.keyword_analyzer:
            logger.warning("Keyword recommendations not available. API key required.")
            return []
        
        logger.info(f"🎯 Getting top {top_n} keyword recommendations...")
        return self.keyword_analyzer.get_top_recommendations(keywords, self.geo, top_n)
    
    def generate_analysis_report(self, metrics: List[KeywordMetrics]) -> str:
        """
        Generate comprehensive analysis report.
        
        Args:
            metrics (List[KeywordMetrics]): Analyzed keyword metrics
        
        Returns:
            str: Formatted analysis report
        """
        if not self.keyword_analyzer:
            return "Analysis report not available. Enhanced API key required."
        
        return self.keyword_analyzer.generate_analysis_report(metrics)
    
    def export_enhanced_csv(self, metrics: List[KeywordMetrics], output_file: str):
        """
        Export enhanced analysis results to CSV.
        
        Args:
            metrics (List[KeywordMetrics]): Analysis results
            output_file (str): Output CSV file path
        """
        try:
            # Convert to DataFrame with enhanced metrics
            df_data = []
            for metric in metrics:
                df_data.append({
                    'keyword': metric.keyword,
                    'search_volume': metric.search_volume,
                    'trend_score': metric.trend_score,
                    'competition': metric.competition,
                    'competition_score': metric.competition_score,
                    'cpc_low': metric.cpc_low,
                    'cpc_high': metric.cpc_high,
                    'opportunity_score': metric.opportunity_score,
                    'difficulty_score': metric.difficulty_score,
                    'recommendation': metric.recommendation,
                    'seasonal_trend_avg': np.mean(metric.seasonal_trend) if metric.seasonal_trend else None
                })
            
            df = pd.DataFrame(df_data)
            
            # Sort by opportunity score (descending)
            df = df.sort_values('opportunity_score', ascending=False, na_last=True)
            
            # Export to CSV
            df.to_csv(output_file, index=False, encoding='utf-8')
            logger.info(f"Exported enhanced analysis for {len(df)} keywords to {output_file}")
            
            # Print enhanced summary
            total_keywords = len(df)
            high_priority = len(df[df['recommendation'] == 'HIGH_PRIORITY'])
            medium_priority = len(df[df['recommendation'] == 'MEDIUM_PRIORITY'])
            with_volume = len(df[df['search_volume'].notna()])
            avg_opportunity = df['opportunity_score'].mean()
            avg_difficulty = df['difficulty_score'].mean()
            
            print(f"\n🎯 Enhanced Analysis Summary:")
            print(f"Total keywords analyzed: {total_keywords}")
            print(f"High priority targets: {high_priority}")
            print(f"Medium priority targets: {medium_priority}")
            print(f"Keywords with search volume: {with_volume}")
            print(f"Average opportunity score: {avg_opportunity:.1f}/100" if pd.notna(avg_opportunity) else "Average opportunity score: N/A")
            print(f"Average difficulty score: {avg_difficulty:.1f}/100" if pd.notna(avg_difficulty) else "Average difficulty score: N/A")
            print(f"Enhanced output file: {output_file}")
            
        except Exception as e:
            logger.error(f"Error exporting enhanced CSV: {e}")
            raise


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description='Keyword Analysis Tool for Startups',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic keyword discovery
  python main.py --seeds "crypto jobs, web3 careers"
  python main.py --file seeds.txt --recursive
  
  # Enhanced analysis with Google API (paid)
  python main.py --seeds "whatsapp automation" --google-api-key YOUR_API_KEY --analyze
  python main.py --file seeds.txt --google-api-key YOUR_API_KEY --analyze --generate-report
  
  # Advanced options
  python main.py --seeds "blockchain" --variations --output my_keywords.csv
  python main.py --file seeds.txt --language fr --country FR --geo FR
        """
    )
    
    # Input options
    input_group = parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument(
        '--seeds', '-s',
        type=str,
        help='Comma-separated seed keywords (e.g., "crypto jobs, web3 careers")'
    )
    input_group.add_argument(
        '--file', '-f',
        type=str,
        help='Path to text file containing seed keywords'
    )
    
    # Expansion options
    expansion_group = parser.add_mutually_exclusive_group()
    expansion_group.add_argument(
        '--recursive', '-r',
        action='store_true',
        help='Enable recursive keyword expansion (slower but more comprehensive)'
    )
    expansion_group.add_argument(
        '--variations', '-v',
        action='store_true',
        help='Generate keyword variations with prefixes/suffixes'
    )
    
    # Configuration options
    parser.add_argument(
        '--output', '-o',
        type=str,
        default='keyword_analysis.csv',
        help='Output CSV file path (default: keyword_analysis.csv)'
    )
    parser.add_argument(
        '--language',
        type=str,
        default='en',
        help='Language code for autocomplete (default: en)'
    )
    parser.add_argument(
        '--country',
        type=str,
        default='US',
        help='Country code for autocomplete (default: US)'
    )
    parser.add_argument(
        '--geo',
        type=str,
        default='US',
        help='Geographic region for trends (default: US)'
    )
    parser.add_argument(
        '--max-depth',
        type=int,
        default=2,
        help='Maximum recursion depth for recursive expansion (default: 2)'
    )
    
    # Filtering options
    parser.add_argument(
        '--min-length',
        type=int,
        help='Minimum keyword length filter'
    )
    parser.add_argument(
        '--max-length',
        type=int,
        help='Maximum keyword length filter'
    )
    parser.add_argument(
        '--phrase-match',
        type=str,
        help='Required phrase in keywords (case insensitive)'
    )
    parser.add_argument(
        '--no-dedup',
        action='store_true',
        help='Disable keyword deduplication'
    )
    
    # Enhanced analysis options
    parser.add_argument(
        '--google-api-key',
        type=str,
        help='Google Cloud API key for enhanced trends analysis (paid)'
    )
    parser.add_argument(
        '--analyze',
        action='store_true',
        help='Perform advanced keyword analysis and recommendations (requires API key)'
    )
    parser.add_argument(
        '--top-recommendations',
        type=int,
        default=10,
        help='Number of top keyword recommendations to show (default: 10)'
    )
    parser.add_argument(
        '--generate-report',
        action='store_true',
        help='Generate comprehensive analysis report'
    )
    
    # Other options
    parser.add_argument(
        '--verbose', '-V',
        action='store_true',
        help='Enable verbose logging'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without making API calls'
    )
    
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        # Initialize analyzer
        analyzer = KeywordTool(
            language=args.language,
            country=args.country,
            geo=args.geo,
            google_api_key=args.google_api_key
        )
        
        # Load seed keywords
        if args.seeds:
            seeds = analyzer.parse_seeds_from_string(args.seeds)
        else:
            seeds = analyzer.load_seeds_from_file(args.file)
        
        if not seeds:
            logger.error("No seed keywords provided")
            sys.exit(1)
        
        print(f"🌱 Starting analysis with {len(seeds)} seed keywords: {seeds}")
        
        if args.dry_run:
            print("🔍 DRY RUN - Would analyze these keywords:")
            for i, seed in enumerate(seeds, 1):
                print(f"  {i}. {seed}")
            print(f"\nConfiguration:")
            print(f"  Language: {args.language}")
            print(f"  Country: {args.country}")
            print(f"  Geo: {args.geo}")
            print(f"  Recursive: {args.recursive}")
            print(f"  Variations: {args.variations}")
            print(f"  Output: {args.output}")
            return
        
        # Collect autocomplete keywords
        print("🔍 Collecting keywords from Google Autocomplete...")
        keywords = analyzer.collect_autocomplete_keywords(
            seeds,
            recursive=args.recursive,
            variations=args.variations,
            max_depth=args.max_depth
        )
        
        if not keywords:
            logger.error("No keywords collected from autocomplete")
            sys.exit(1)
        
        print(f"✅ Collected {len(keywords)} unique keywords")
        
        # Collect trends data
        print("📈 Analyzing trends data...")
        keyword_data = analyzer.collect_trends_data(list(keywords))
        
        # Apply filters
        if args.min_length or args.max_length or args.phrase_match:
            print("🔧 Applying filters...")
            keyword_data = analyzer.filter_keywords(
                keyword_data,
                min_length=args.min_length,
                max_length=args.max_length,
                phrase_match=args.phrase_match
            )
        
        # Deduplicate
        if not args.no_dedup:
            print("🧹 Removing duplicates...")
            keyword_data = analyzer.deduplicate_keywords(keyword_data)
        
        # Perform enhanced analysis if requested
        if args.analyze and args.google_api_key:
            print("🔬 Performing enhanced analysis...")
            enhanced_metrics = analyzer.get_keyword_recommendations(
                list(keywords), 
                top_n=args.top_recommendations
            )
            
            if enhanced_metrics:
                # Export enhanced results
                enhanced_output = args.output.replace('.csv', '_enhanced.csv')
                analyzer.export_enhanced_csv(enhanced_metrics, enhanced_output)
                
                # Generate and display report
                if args.generate_report:
                    print("\n" + "="*60)
                    report = analyzer.generate_analysis_report(enhanced_metrics)
                    print(report)
                    print("="*60)
                    
                    # Save report to file
                    report_file = args.output.replace('.csv', '_report.txt')
                    with open(report_file, 'w', encoding='utf-8') as f:
                        f.write(report)
                    print(f"\n📄 Analysis report saved to: {report_file}")
                
                print(f"🎯 Enhanced analysis complete! Check {enhanced_output} for detailed results.")
            else:
                print("⚠️  Enhanced analysis failed. Check API key and connection.")
        
        elif args.analyze and not args.google_api_key:
            print("⚠️  Enhanced analysis requires --google-api-key parameter")
            print("💡 For now, exporting basic results...")
        
        # Export basic results
        export_basic = True
        if args.analyze and args.google_api_key:
            try:
                if 'enhanced_metrics' in locals() and enhanced_metrics:
                    export_basic = False
            except:
                pass
        
        if export_basic:
            print("💾 Exporting basic results...")
            analyzer.export_to_csv(keyword_data, args.output)
        
        print("🎉 Analysis complete!")
        
    except KeyboardInterrupt:
        print("\n⚠️  Analysis interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
