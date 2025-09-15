"""
Google Trends data handler using pytrends.
Fetches trend scores and interest data for keywords.
"""

import pandas as pd
from pytrends.request import TrendReq
import time
import logging
from typing import List, Dict, Optional
import random

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TrendsError(Exception):
    """Custom exception for Google Trends API errors."""
    pass


class TrendsClient:
    """Google Trends client with rate limiting and error handling."""
    
    def __init__(self, language: str = 'en-US', timezone: int = 360):
        """
        Initialize the trends client.
        
        Args:
            language (str): Language code (default: 'en-US')
            timezone (int): Timezone offset (default: 360 for US Central)
        """
        self.language = language
        self.timezone = timezone
        self.pytrends = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize pytrends client with retry logic."""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                self.pytrends = TrendReq(hl=self.language, tz=self.timezone)
                logger.info("Successfully initialized Google Trends client")
                return
            except Exception as e:
                logger.warning(f"Failed to initialize trends client (attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(random.uniform(2, 5))
                else:
                    raise TrendsError(f"Failed to initialize trends client after {max_retries} attempts: {e}")
    
    def get_trend_score(self, keyword: str, timeframe: str = 'today 1-m', 
                       geo: str = 'US') -> Optional[float]:
        """
        Get trend score for a single keyword.
        
        Args:
            keyword (str): Keyword to analyze
            timeframe (str): Time period (default: 'today 1-m' for last 30 days)
            geo (str): Geographic region (default: 'US')
        
        Returns:
            Optional[float]: Trend score (0-100) or None if no data
        """
        try:
            # Add random delay to avoid rate limiting
            time.sleep(random.uniform(1, 3))
            
            logger.info(f"Fetching trend data for: '{keyword}'")
            
            # Build payload and get interest over time
            self.pytrends.build_payload([keyword], timeframe=timeframe, geo=geo)
            interest_df = self.pytrends.interest_over_time()
            
            if interest_df.empty or keyword not in interest_df.columns:
                logger.warning(f"No trend data found for '{keyword}'")
                return None
            
            # Get the latest trend score (most recent data point)
            latest_score = interest_df[keyword].iloc[-1] if len(interest_df) > 0 else 0
            
            # Get average score for the period
            avg_score = interest_df[keyword].mean()
            
            # Return the higher of latest or average (more representative)
            trend_score = max(latest_score, avg_score)
            
            logger.info(f"Trend score for '{keyword}': {trend_score:.1f}")
            return float(trend_score)
            
        except Exception as e:
            logger.error(f"Error fetching trend data for '{keyword}': {e}")
            # Reinitialize client on error
            try:
                self._initialize_client()
            except:
                pass
            return None
    
    def get_batch_trends(self, keywords: List[str], batch_size: int = 5, 
                        timeframe: str = 'today 1-m', geo: str = 'US') -> Dict[str, Optional[float]]:
        """
        Get trend scores for multiple keywords in batches.
        
        Args:
            keywords (List[str]): List of keywords to analyze
            batch_size (int): Number of keywords per batch (max 5 for pytrends)
            timeframe (str): Time period
            geo (str): Geographic region
        
        Returns:
            Dict[str, Optional[float]]: Mapping of keywords to trend scores
        """
        results = {}
        
        # Process keywords in batches
        for i in range(0, len(keywords), batch_size):
            batch = keywords[i:i + batch_size]
            
            try:
                # Add delay between batches
                if i > 0:
                    time.sleep(random.uniform(3, 6))
                
                logger.info(f"Processing batch {i//batch_size + 1}: {batch}")
                
                # Build payload for batch
                self.pytrends.build_payload(batch, timeframe=timeframe, geo=geo)
                interest_df = self.pytrends.interest_over_time()
                
                if not interest_df.empty:
                    for keyword in batch:
                        if keyword in interest_df.columns:
                            # Get average score for the period
                            avg_score = interest_df[keyword].mean()
                            results[keyword] = float(avg_score) if pd.notna(avg_score) else 0.0
                        else:
                            results[keyword] = None
                else:
                    # No data for any keyword in batch
                    for keyword in batch:
                        results[keyword] = None
                        
            except Exception as e:
                logger.error(f"Error processing batch {batch}: {e}")
                # Set all keywords in failed batch to None
                for keyword in batch:
                    results[keyword] = None
                
                # Reinitialize client and continue
                try:
                    self._initialize_client()
                except:
                    pass
        
        logger.info(f"Completed trend analysis for {len(keywords)} keywords")
        return results
    
    def get_related_queries(self, keyword: str, timeframe: str = 'today 1-m', 
                           geo: str = 'US') -> List[str]:
        """
        Get related queries for a keyword from Google Trends.
        
        Args:
            keyword (str): Base keyword
            timeframe (str): Time period
            geo (str): Geographic region
        
        Returns:
            List[str]: List of related queries
        """
        try:
            time.sleep(random.uniform(2, 4))
            
            logger.info(f"Fetching related queries for: '{keyword}'")
            
            self.pytrends.build_payload([keyword], timeframe=timeframe, geo=geo)
            related_queries = self.pytrends.related_queries()
            
            if not related_queries or keyword not in related_queries:
                return []
            
            related_data = related_queries[keyword]
            related_keywords = []
            
            # Get top related queries
            if related_data.get('top') is not None and not related_data['top'].empty:
                top_queries = related_data['top']['query'].tolist()
                related_keywords.extend(top_queries[:10])  # Limit to top 10
            
            # Get rising related queries
            if related_data.get('rising') is not None and not related_data['rising'].empty:
                rising_queries = related_data['rising']['query'].tolist()
                related_keywords.extend(rising_queries[:5])  # Limit to top 5
            
            # Remove duplicates while preserving order
            unique_related = []
            seen = set()
            for query in related_keywords:
                if query not in seen and query.lower() != keyword.lower():
                    unique_related.append(query)
                    seen.add(query)
            
            logger.info(f"Found {len(unique_related)} related queries for '{keyword}'")
            return unique_related
            
        except Exception as e:
            logger.error(f"Error fetching related queries for '{keyword}': {e}")
            return []


def get_keyword_trends(keywords: List[str], language: str = 'en-US', 
                      geo: str = 'US', timeframe: str = 'today 1-m') -> Dict[str, Optional[float]]:
    """
    Convenience function to get trend scores for a list of keywords.
    
    Args:
        keywords (List[str]): Keywords to analyze
        language (str): Language code
        geo (str): Geographic region
        timeframe (str): Time period
    
    Returns:
        Dict[str, Optional[float]]: Keyword to trend score mapping
    """
    client = TrendsClient(language=language)
    return client.get_batch_trends(keywords, timeframe=timeframe, geo=geo)


def get_trending_keywords_by_category(category: str = 'business', 
                                    geo: str = 'US') -> List[str]:
    """
    Get currently trending keywords by category.
    
    Args:
        category (str): Category name (default: 'business')
        geo (str): Geographic region
    
    Returns:
        List[str]: List of trending keywords
    """
    try:
        client = TrendsClient()
        
        # Get trending searches
        trending_df = client.pytrends.trending_searches(pn=geo)
        
        if not trending_df.empty:
            trending_keywords = trending_df[0].tolist()[:20]  # Get top 20
            logger.info(f"Found {len(trending_keywords)} trending keywords")
            return trending_keywords
        
        return []
        
    except Exception as e:
        logger.error(f"Error fetching trending keywords: {e}")
        return []


if __name__ == "__main__":
    # Test the trends functionality
    test_keywords = ["crypto jobs", "web3 careers", "blockchain developer"]
    
    print("Testing Google Trends integration...")
    
    try:
        client = TrendsClient()
        
        # Test individual keyword
        print(f"\nTesting single keyword trend:")
        score = client.get_trend_score("crypto jobs")
        print(f"crypto jobs: {score}")
        
        # Test batch processing
        print(f"\nTesting batch trends:")
        trends = client.get_batch_trends(test_keywords)
        for keyword, score in trends.items():
            print(f"{keyword}: {score}")
        
        # Test related queries
        print(f"\nTesting related queries:")
        related = client.get_related_queries("crypto jobs")
        for i, query in enumerate(related[:5], 1):
            print(f"{i}. {query}")
            
    except Exception as e:
        print(f"Error during testing: {e}")
