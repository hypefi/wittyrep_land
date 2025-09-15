"""
Google Autocomplete API handler for keyword suggestions.
Fetches keyword suggestions using Google's autocomplete service.
"""

import requests
import json
import time
from typing import List, Set
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AutocompleteError(Exception):
    """Custom exception for autocomplete API errors."""
    pass


def fetch_google_autocomplete(seed_keyword: str, language: str = 'en', country: str = 'US') -> List[str]:
    """
    Fetch keyword suggestions from Google Autocomplete API.
    
    Args:
        seed_keyword (str): The base keyword to expand
        language (str): Language code (default: 'en')
        country (str): Country code (default: 'US')
    
    Returns:
        List[str]: List of suggested keywords
    
    Raises:
        AutocompleteError: If API request fails or returns invalid data
    """
    try:
        # Google Autocomplete API endpoint
        url = "http://suggestqueries.google.com/complete/search"
        
        params = {
            'client': 'firefox',  # Use firefox client for JSON response
            'q': seed_keyword,
            'hl': language,
            'gl': country
        }
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        logger.info(f"Fetching autocomplete suggestions for: '{seed_keyword}'")
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse JSON response
        data = response.json()
        
        if not data or len(data) < 2:
            logger.warning(f"No suggestions found for '{seed_keyword}'")
            return []
        
        suggestions = data[1]  # Suggestions are in the second element
        
        # Filter out empty suggestions and the original keyword
        filtered_suggestions = [
            suggestion for suggestion in suggestions 
            if suggestion and suggestion.lower() != seed_keyword.lower()
        ]
        
        logger.info(f"Found {len(filtered_suggestions)} suggestions for '{seed_keyword}'")
        return filtered_suggestions
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error fetching autocomplete for '{seed_keyword}': {e}")
        raise AutocompleteError(f"Network error: {e}")
    
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON response for '{seed_keyword}': {e}")
        raise AutocompleteError(f"Invalid response format: {e}")
    
    except Exception as e:
        logger.error(f"Unexpected error fetching autocomplete for '{seed_keyword}': {e}")
        raise AutocompleteError(f"Unexpected error: {e}")


def fetch_autocomplete_recursive(seed_keywords: List[str], max_depth: int = 2, 
                                max_keywords_per_seed: int = 5, 
                                language: str = 'en', country: str = 'US') -> Set[str]:
    """
    Recursively fetch keyword suggestions.
    
    Args:
        seed_keywords (List[str]): Initial seed keywords
        max_depth (int): Maximum recursion depth (default: 2)
        max_keywords_per_seed (int): Max suggestions per keyword (default: 5)
        language (str): Language code (default: 'en')
        country (str): Country code (default: 'US')
    
    Returns:
        Set[str]: Unique set of all discovered keywords
    """
    all_keywords = set()
    processed_keywords = set()
    
    # Queue for BFS-style processing
    queue = [(keyword.strip(), 0) for keyword in seed_keywords]
    
    while queue:
        current_keyword, depth = queue.pop(0)
        
        if current_keyword in processed_keywords or depth >= max_depth:
            continue
            
        processed_keywords.add(current_keyword)
        all_keywords.add(current_keyword)
        
        try:
            # Add small delay to be respectful to the API
            time.sleep(0.5)
            
            suggestions = fetch_google_autocomplete(current_keyword, language, country)
            
            # Limit suggestions per keyword to avoid explosion
            limited_suggestions = suggestions[:max_keywords_per_seed]
            
            for suggestion in limited_suggestions:
                if suggestion not in processed_keywords:
                    all_keywords.add(suggestion)
                    # Add to queue for next level processing
                    if depth + 1 < max_depth:
                        queue.append((suggestion, depth + 1))
                        
        except AutocompleteError as e:
            logger.warning(f"Failed to fetch suggestions for '{current_keyword}': {e}")
            continue
    
    logger.info(f"Recursive search completed. Found {len(all_keywords)} unique keywords.")
    return all_keywords


def fetch_autocomplete_variations(seed_keyword: str, prefixes: List[str] = None, 
                                 suffixes: List[str] = None, language: str = 'en', 
                                 country: str = 'US') -> Set[str]:
    """
    Fetch autocomplete suggestions with various prefixes and suffixes.
    
    Args:
        seed_keyword (str): Base keyword
        prefixes (List[str]): List of prefixes to try (default: common question words)
        suffixes (List[str]): List of suffixes to try (default: common modifiers)
        language (str): Language code
        country (str): Country code
    
    Returns:
        Set[str]: Unique set of keyword variations
    """
    if prefixes is None:
        prefixes = ['what is', 'how to', 'best', 'top', 'free', 'cheap', 'online']
    
    if suffixes is None:
        suffixes = ['jobs', 'career', 'salary', 'course', 'training', 'certification', 
                   'skills', 'tools', 'software', 'companies', 'remote', '2024', '2025']
    
    all_variations = set()
    
    # Try original keyword
    try:
        original_suggestions = fetch_google_autocomplete(seed_keyword, language, country)
        all_variations.update(original_suggestions)
        time.sleep(0.5)
    except AutocompleteError:
        pass
    
    # Try with prefixes
    for prefix in prefixes:
        try:
            variation = f"{prefix} {seed_keyword}"
            suggestions = fetch_google_autocomplete(variation, language, country)
            all_variations.update(suggestions)
            time.sleep(0.5)
        except AutocompleteError:
            continue
    
    # Try with suffixes
    for suffix in suffixes:
        try:
            variation = f"{seed_keyword} {suffix}"
            suggestions = fetch_google_autocomplete(variation, language, country)
            all_variations.update(suggestions)
            time.sleep(0.5)
        except AutocompleteError:
            continue
    
    logger.info(f"Found {len(all_variations)} variations for '{seed_keyword}'")
    return all_variations


if __name__ == "__main__":
    # Test the autocomplete functionality
    test_keywords = ["crypto jobs", "web3 careers"]
    
    for keyword in test_keywords:
        print(f"\nTesting autocomplete for: {keyword}")
        try:
            suggestions = fetch_google_autocomplete(keyword)
            for i, suggestion in enumerate(suggestions[:10], 1):
                print(f"{i}. {suggestion}")
        except AutocompleteError as e:
            print(f"Error: {e}")
