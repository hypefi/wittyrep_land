"""
Google Trends API integration for paid access and advanced analytics.
Provides enhanced trend data, competition analysis, and keyword scoring.
"""

import requests
import pandas as pd
import time
import logging
from typing import List, Dict, Optional, Tuple
import json
from datetime import datetime, timedelta
import numpy as np
from dataclasses import dataclass

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class KeywordMetrics:
    """Data class for comprehensive keyword metrics."""
    keyword: str
    search_volume: Optional[int] = None
    trend_score: Optional[float] = None
    competition: Optional[str] = None
    competition_score: Optional[float] = None
    cpc_low: Optional[float] = None
    cpc_high: Optional[float] = None
    seasonal_trend: Optional[List[float]] = None
    related_queries: Optional[List[str]] = None
    opportunity_score: Optional[float] = None
    difficulty_score: Optional[float] = None
    recommendation: Optional[str] = None


class GoogleTrendsAPI:
    """
    Enhanced Google Trends API client with paid API support.
    
    This class supports both the free pytrends library and paid Google Trends API.
    For paid API access, you'll need to set up Google Cloud Platform credentials.
    """
    
    def __init__(self, api_key: Optional[str] = None, use_paid_api: bool = False):
        """
        Initialize the Google Trends API client.
        
        Args:
            api_key (Optional[str]): Google Cloud API key for paid access
            use_paid_api (bool): Whether to use paid API features
        """
        self.api_key = api_key
        self.use_paid_api = use_paid_api and api_key is not None
        self.base_url = "https://trends.googleapis.com/trends/api"
        
        # Rate limiting
        self.last_request_time = 0
        self.min_request_interval = 1.0  # seconds
        
        if self.use_paid_api:
            logger.info("Initialized Google Trends API with paid access")
        else:
            logger.info("Initialized Google Trends API with free access (pytrends)")
            # Fallback to pytrends for free access
            try:
                from pytrends.request import TrendReq
                self.pytrends = TrendReq(hl='en-US', tz=360)
            except ImportError:
                logger.error("pytrends not available. Install with: pip install pytrends")
                self.pytrends = None
    
    def _rate_limit(self):
        """Implement rate limiting for API requests."""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.min_request_interval:
            sleep_time = self.min_request_interval - time_since_last
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()
    
    def _make_api_request(self, endpoint: str, params: Dict) -> Optional[Dict]:
        """
        Make a request to the Google Trends API.
        
        Args:
            endpoint (str): API endpoint
            params (Dict): Request parameters
        
        Returns:
            Optional[Dict]: API response data
        """
        if not self.use_paid_api:
            logger.warning("Paid API not configured. Using free fallback.")
            return None
        
        self._rate_limit()
        
        url = f"{self.base_url}/{endpoint}"
        params['key'] = self.api_key
        
        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            return None
    
    def get_search_volume(self, keywords: List[str], geo: str = 'US', 
                         timeframe: str = 'today 12-m') -> Dict[str, Optional[int]]:
        """
        Get search volume data for keywords.
        
        Args:
            keywords (List[str]): Keywords to analyze
            geo (str): Geographic region
            timeframe (str): Time period
        
        Returns:
            Dict[str, Optional[int]]: Keyword to search volume mapping
        """
        if self.use_paid_api:
            # Use paid API for accurate search volume
            params = {
                'keywords': ','.join(keywords),
                'geo': geo,
                'timeframe': timeframe
            }
            
            data = self._make_api_request('search_volume', params)
            if data and 'keywords' in data:
                return {item['keyword']: item.get('search_volume') 
                       for item in data['keywords']}
        
        # Fallback to pytrends (relative data)
        if self.pytrends:
            return self._get_volume_from_pytrends(keywords, geo, timeframe)
        
        return {keyword: None for keyword in keywords}
    
    def _get_volume_from_pytrends(self, keywords: List[str], geo: str, 
                                 timeframe: str) -> Dict[str, Optional[int]]:
        """Get relative search volume using pytrends."""
        try:
            # Convert timeframe for pytrends
            pytrends_timeframe = self._convert_timeframe(timeframe)
            
            results = {}
            for keyword in keywords:
                try:
                    self.pytrends.build_payload([keyword], 
                                              timeframe=pytrends_timeframe, 
                                              geo=geo)
                    interest_df = self.pytrends.interest_over_time()
                    
                    if not interest_df.empty and keyword in interest_df.columns:
                        # Use average as proxy for search volume
                        avg_interest = interest_df[keyword].mean()
                        # Scale to approximate search volume (rough estimation)
                        estimated_volume = int(avg_interest * 1000) if avg_interest > 0 else 0
                        results[keyword] = estimated_volume
                    else:
                        results[keyword] = 0
                    
                    time.sleep(2)  # Rate limiting for pytrends
                    
                except Exception as e:
                    logger.warning(f"Error getting volume for '{keyword}': {e}")
                    results[keyword] = None
            
            return results
            
        except Exception as e:
            logger.error(f"Error with pytrends volume estimation: {e}")
            return {keyword: None for keyword in keywords}
    
    def _convert_timeframe(self, timeframe: str) -> str:
        """Convert API timeframe to pytrends format."""
        timeframe_map = {
            'today 1-m': 'today 1-m',
            'today 3-m': 'today 3-m',
            'today 12-m': 'today 12-m',
            'today 5-y': 'today 5-y',
            'all': 'all'
        }
        return timeframe_map.get(timeframe, 'today 12-m')
    
    def get_competition_data(self, keywords: List[str], geo: str = 'US') -> Dict[str, Dict]:
        """
        Get competition data for keywords.
        
        Args:
            keywords (List[str]): Keywords to analyze
            geo (str): Geographic region
        
        Returns:
            Dict[str, Dict]: Competition metrics per keyword
        """
        if self.use_paid_api:
            params = {
                'keywords': ','.join(keywords),
                'geo': geo
            }
            
            data = self._make_api_request('competition', params)
            if data and 'keywords' in data:
                return {item['keyword']: {
                    'competition': item.get('competition', 'UNKNOWN'),
                    'competition_score': item.get('competition_index', 0.5),
                    'cpc_low': item.get('cpc_low_range'),
                    'cpc_high': item.get('cpc_high_range')
                } for item in data['keywords']}
        
        # Fallback: estimate competition based on trends data
        return self._estimate_competition(keywords, geo)
    
    def _estimate_competition(self, keywords: List[str], geo: str) -> Dict[str, Dict]:
        """Estimate competition using available data."""
        results = {}
        
        for keyword in keywords:
            # Simple heuristic: longer, more specific keywords = lower competition
            word_count = len(keyword.split())
            char_count = len(keyword)
            
            # Estimate competition based on keyword characteristics
            if word_count >= 4 or char_count >= 25:
                competition = "LOW"
                competition_score = 0.3
            elif word_count >= 3 or char_count >= 15:
                competition = "MEDIUM"
                competition_score = 0.5
            else:
                competition = "HIGH"
                competition_score = 0.8
            
            results[keyword] = {
                'competition': competition,
                'competition_score': competition_score,
                'cpc_low': None,
                'cpc_high': None
            }
        
        return results
    
    def get_seasonal_trends(self, keyword: str, geo: str = 'US') -> Optional[List[float]]:
        """
        Get seasonal trend data for a keyword.
        
        Args:
            keyword (str): Keyword to analyze
            geo (str): Geographic region
        
Returns:
            Optional[List[float]]: Monthly trend data for the past year
        """
        try:
            if self.pytrends:
                self.pytrends.build_payload([keyword], 
                                          timeframe='today 12-m', 
                                          geo=geo)
                interest_df = self.pytrends.interest_over_time()
                
                if not interest_df.empty and keyword in interest_df.columns:
                    # Resample to monthly data
                    monthly_data = interest_df[keyword].resample('M').mean()
                    return monthly_data.tolist()
            
            return None
            
        except Exception as e:
            logger.warning(f"Error getting seasonal trends for '{keyword}': {e}")
            return None


class KeywordAnalyzer:
    """Advanced keyword analysis and recommendation engine."""
    
    def __init__(self, trends_api: GoogleTrendsAPI):
        """
        Initialize the keyword analyzer.
        
        Args:
            trends_api (GoogleTrendsAPI): Trends API client
        """
        self.trends_api = trends_api
    
    def analyze_keywords(self, keywords: List[str], geo: str = 'US') -> List[KeywordMetrics]:
        """
        Perform comprehensive analysis of keywords.
        
        Args:
            keywords (List[str]): Keywords to analyze
            geo (str): Geographic region
        
        Returns:
            List[KeywordMetrics]: Analyzed keyword metrics
        """
        logger.info(f"Analyzing {len(keywords)} keywords...")
        
        # Get search volume data
        logger.info("Fetching search volume data...")
        search_volumes = self.trends_api.get_search_volume(keywords, geo)
        
        # Get competition data
        logger.info("Fetching competition data...")
        competition_data = self.trends_api.get_competition_data(keywords, geo)
        
        # Analyze each keyword
        results = []
        for keyword in keywords:
            metrics = KeywordMetrics(keyword=keyword)
            
            # Basic metrics
            metrics.search_volume = search_volumes.get(keyword)
            comp_data = competition_data.get(keyword, {})
            metrics.competition = comp_data.get('competition')
            metrics.competition_score = comp_data.get('competition_score')
            metrics.cpc_low = comp_data.get('cpc_low')
            metrics.cpc_high = comp_data.get('cpc_high')
            
            # Get seasonal trends
            metrics.seasonal_trend = self.trends_api.get_seasonal_trends(keyword, geo)
            
            # Calculate derived metrics
            metrics.opportunity_score = self._calculate_opportunity_score(metrics)
            metrics.difficulty_score = self._calculate_difficulty_score(metrics)
            metrics.recommendation = self._generate_recommendation(metrics)
            
            results.append(metrics)
            
            # Small delay between keywords
            time.sleep(0.5)
        
        # Sort by opportunity score (descending)
        results.sort(key=lambda x: x.opportunity_score or 0, reverse=True)
        
        logger.info("Keyword analysis completed")
        return results
    
    def _calculate_opportunity_score(self, metrics: KeywordMetrics) -> float:
        """
        Calculate opportunity score (0-100) for a keyword.
        Higher score = better opportunity.
        
        Factors:
        - Search volume (higher is better)
        - Competition (lower is better)
        - Trend direction (growing is better)
        - Keyword specificity (more specific can be better for targeting)
        """
        score = 50.0  # Base score
        
        # Search volume factor (0-30 points)
        if metrics.search_volume:
            if metrics.search_volume > 10000:
                score += 30
            elif metrics.search_volume > 5000:
                score += 25
            elif metrics.search_volume > 1000:
                score += 20
            elif metrics.search_volume > 500:
                score += 15
            elif metrics.search_volume > 100:
                score += 10
            else:
                score += 5
        
        # Competition factor (0-25 points, inverse)
        if metrics.competition_score is not None:
            competition_bonus = (1 - metrics.competition_score) * 25
            score += competition_bonus
        
        # Trend direction factor (0-20 points)
        if metrics.seasonal_trend:
            recent_trend = self._calculate_trend_direction(metrics.seasonal_trend)
            score += recent_trend * 20
        
        # Keyword specificity factor (0-15 points)
        word_count = len(metrics.keyword.split())
        if word_count >= 4:
            score += 15  # Long-tail keywords
        elif word_count == 3:
            score += 10
        elif word_count == 2:
            score += 5
        
        # Commercial intent factor (0-10 points)
        commercial_keywords = ['buy', 'price', 'cost', 'cheap', 'best', 'review', 
                             'tool', 'software', 'service', 'solution']
        if any(word in metrics.keyword.lower() for word in commercial_keywords):
            score += 10
        
        return min(100.0, max(0.0, score))
    
    def _calculate_difficulty_score(self, metrics: KeywordMetrics) -> float:
        """
        Calculate difficulty score (0-100) for ranking for a keyword.
        Higher score = more difficult to rank.
        """
        score = 50.0  # Base difficulty
        
        # Competition factor (0-40 points)
        if metrics.competition_score is not None:
            score += metrics.competition_score * 40
        
        # Search volume factor (high volume = higher difficulty)
        if metrics.search_volume:
            if metrics.search_volume > 50000:
                score += 30
            elif metrics.search_volume > 10000:
                score += 20
            elif metrics.search_volume > 5000:
                score += 10
            elif metrics.search_volume > 1000:
                score += 5
        
        # Keyword length factor (shorter = more difficult)
        word_count = len(metrics.keyword.split())
        if word_count == 1:
            score += 20
        elif word_count == 2:
            score += 10
        elif word_count >= 4:
            score -= 10  # Long-tail easier to rank
        
        return min(100.0, max(0.0, score))
    
    def _calculate_trend_direction(self, seasonal_data: List[float]) -> float:
        """
        Calculate trend direction from seasonal data.
        Returns value between -1 (declining) and 1 (growing).
        """
        if len(seasonal_data) < 3:
            return 0.0
        
        # Compare recent months to earlier months
        recent = np.mean(seasonal_data[-3:])  # Last 3 months
        earlier = np.mean(seasonal_data[:3])   # First 3 months
        
        if earlier == 0:
            return 0.0
        
        change = (recent - earlier) / earlier
        return min(1.0, max(-1.0, change))
    
    def _generate_recommendation(self, metrics: KeywordMetrics) -> str:
        """Generate actionable recommendation for a keyword."""
        if metrics.opportunity_score is None:
            return "INSUFFICIENT_DATA"
        
        opportunity = metrics.opportunity_score
        difficulty = metrics.difficulty_score or 50
        
        if opportunity >= 80:
            if difficulty <= 30:
                return "HIGH_PRIORITY"  # High opportunity, low difficulty
            elif difficulty <= 60:
                return "MEDIUM_PRIORITY"  # High opportunity, medium difficulty
            else:
                return "LONG_TERM"  # High opportunity, high difficulty
        
        elif opportunity >= 60:
            if difficulty <= 40:
                return "MEDIUM_PRIORITY"  # Medium opportunity, low-medium difficulty
            else:
                return "CONSIDER"  # Medium opportunity, higher difficulty
        
        elif opportunity >= 40:
            if difficulty <= 30:
                return "CONSIDER"  # Lower opportunity but easy to rank
            else:
                return "LOW_PRIORITY"
        
        else:
            return "AVOID"  # Low opportunity
    
    def get_top_recommendations(self, keywords: List[str], geo: str = 'US', 
                              top_n: int = 10) -> List[KeywordMetrics]:
        """
        Get top keyword recommendations with full analysis.
        
        Args:
            keywords (List[str]): Keywords to analyze
            geo (str): Geographic region
            top_n (int): Number of top recommendations to return
        
        Returns:
            List[KeywordMetrics]: Top recommended keywords
        """
        all_metrics = self.analyze_keywords(keywords, geo)
        
        # Filter for actionable recommendations
        actionable = [m for m in all_metrics 
                     if m.recommendation in ['HIGH_PRIORITY', 'MEDIUM_PRIORITY', 'CONSIDER']]
        
        return actionable[:top_n]
    
    def generate_analysis_report(self, metrics: List[KeywordMetrics]) -> str:
        """
        Generate a comprehensive analysis report.
        
        Args:
            metrics (List[KeywordMetrics]): Analyzed keyword metrics
        
        Returns:
            str: Formatted analysis report
        """
        if not metrics:
            return "No keyword data available for analysis."
        
        report = []
        report.append("🎯 KEYWORD ANALYSIS REPORT")
        report.append("=" * 50)
        report.append(f"Analysis Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(f"Total Keywords Analyzed: {len(metrics)}")
        report.append("")
        
        # Summary statistics
        high_priority = len([m for m in metrics if m.recommendation == 'HIGH_PRIORITY'])
        medium_priority = len([m for m in metrics if m.recommendation == 'MEDIUM_PRIORITY'])
        consider = len([m for m in metrics if m.recommendation == 'CONSIDER'])
        
        report.append("📊 PRIORITY BREAKDOWN:")
        report.append(f"🔥 High Priority: {high_priority} keywords")
        report.append(f"⚡ Medium Priority: {medium_priority} keywords")
        report.append(f"💡 Consider: {consider} keywords")
        report.append("")
        
        # Top recommendations
        top_keywords = [m for m in metrics if m.recommendation in ['HIGH_PRIORITY', 'MEDIUM_PRIORITY']][:10]
        
        if top_keywords:
            report.append("🏆 TOP KEYWORD RECOMMENDATIONS:")
            report.append("-" * 40)
            
            for i, metric in enumerate(top_keywords, 1):
                report.append(f"{i}. {metric.keyword}")
                report.append(f"   Priority: {metric.recommendation}")
                report.append(f"   Opportunity Score: {metric.opportunity_score:.1f}/100")
                report.append(f"   Difficulty Score: {metric.difficulty_score:.1f}/100")
                if metric.search_volume:
                    report.append(f"   Est. Search Volume: {metric.search_volume:,}")
                if metric.competition:
                    report.append(f"   Competition: {metric.competition}")
                report.append("")
        
        # Action items
        report.append("🚀 RECOMMENDED ACTIONS:")
        report.append("-" * 25)
        
        if high_priority > 0:
            report.append(f"1. Immediately target {high_priority} high-priority keywords")
        if medium_priority > 0:
            report.append(f"2. Plan content for {medium_priority} medium-priority keywords")
        if consider > 0:
            report.append(f"3. Research {consider} additional opportunities")
        
        report.append("")
        report.append("💡 INSIGHTS:")
        report.append("-" * 12)
        
        # Generate insights based on data
        avg_opportunity = np.mean([m.opportunity_score for m in metrics if m.opportunity_score])
        avg_difficulty = np.mean([m.difficulty_score for m in metrics if m.difficulty_score])
        
        report.append(f"• Average opportunity score: {avg_opportunity:.1f}/100")
        report.append(f"• Average difficulty score: {avg_difficulty:.1f}/100")
        
        if avg_opportunity > 70:
            report.append("• Strong keyword opportunities identified!")
        elif avg_opportunity > 50:
            report.append("• Moderate keyword opportunities available")
        else:
            report.append("• Consider expanding keyword research")
        
        return "\n".join(report)


def create_enhanced_trends_client(api_key: Optional[str] = None) -> GoogleTrendsAPI:
    """
    Factory function to create enhanced trends client.
    
    Args:
        api_key (Optional[str]): Google Cloud API key for paid access
    
    Returns:
        GoogleTrendsAPI: Configured trends client
    """
    use_paid = api_key is not None
    return GoogleTrendsAPI(api_key=api_key, use_paid_api=use_paid)


if __name__ == "__main__":
    # Test the enhanced trends functionality
    print("Testing Enhanced Google Trends API...")
    
    # Test with free access (no API key)
    trends_api = create_enhanced_trends_client()
    analyzer = KeywordAnalyzer(trends_api)
    
    test_keywords = [
        "whatsapp automation",
        "customer support automation",
        "chatbot for business",
        "automated customer service",
        "whatsapp business api"
    ]
    
    print(f"Analyzing {len(test_keywords)} test keywords...")
    
    try:
        # Get top recommendations
        recommendations = analyzer.get_top_recommendations(test_keywords, top_n=5)
        
        # Generate report
        report = analyzer.generate_analysis_report(recommendations)
        print("\n" + report)
        
    except Exception as e:
        print(f"Error during testing: {e}")
        import traceback
        traceback.print_exc()
