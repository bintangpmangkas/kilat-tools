#!/usr/bin/env python3
"""
Backend API Testing Script for Status API with Pagination
Tests the /api/status endpoint pagination limits
"""

import requests
import json
from typing import Dict, List, Any
import sys

# Backend URL from frontend/.env
BACKEND_URL = "https://quick-access-66.preview.emergentagent.com/api"

def print_test_header(test_name: str):
    """Print a formatted test header"""
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"{'='*80}")

def print_result(passed: bool, message: str):
    """Print test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {message}")

def test_root_endpoint():
    """Test the root API endpoint"""
    print_test_header("Root Endpoint Test")
    try:
        response = requests.get(f"{BACKEND_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        passed = response.status_code == 200 and response.json().get("message") == "Hello World"
        print_result(passed, "Root endpoint accessible")
        return passed
    except Exception as e:
        print_result(False, f"Root endpoint failed: {str(e)}")
        return False

def create_test_status_checks(count: int) -> bool:
    """Create test status check records"""
    print_test_header(f"Creating {count} Test Status Checks")
    try:
        created = 0
        for i in range(count):
            data = {"client_name": f"test_client_{i+1}"}
            response = requests.post(f"{BACKEND_URL}/status", json=data)
            if response.status_code == 200:
                created += 1
        
        print(f"Created {created}/{count} status checks")
        passed = created == count
        print_result(passed, f"Successfully created {created} status checks")
        return passed
    except Exception as e:
        print_result(False, f"Failed to create status checks: {str(e)}")
        return False

def test_default_pagination():
    """Test default pagination (no parameters)"""
    print_test_header("Default Pagination Test")
    try:
        response = requests.get(f"{BACKEND_URL}/status")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            count = len(data)
            print(f"Returned {count} records (default limit should be 50)")
            
            # Default limit is 50, so we should get at most 50 records
            passed = count <= 50
            print_result(passed, f"Default pagination returned {count} records (max 50)")
            return passed
        else:
            print_result(False, f"Failed with status code {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Default pagination test failed: {str(e)}")
        return False

def test_custom_limit(limit: int, expected_max: int):
    """Test custom limit parameter"""
    print_test_header(f"Custom Limit Test (limit={limit})")
    try:
        response = requests.get(f"{BACKEND_URL}/status?limit={limit}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            count = len(data)
            print(f"Returned {count} records with limit={limit}")
            
            # Should return at most the expected_max (considering available data)
            passed = count <= expected_max
            print_result(passed, f"Limit={limit} returned {count} records (expected max: {expected_max})")
            return passed
        else:
            print(f"Response: {response.text}")
            print_result(False, f"Failed with status code {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Custom limit test failed: {str(e)}")
        return False

def test_limit_exceeds_max():
    """Test that limit > 100 is rejected or capped"""
    print_test_header("Limit Exceeds Maximum (limit=150)")
    try:
        response = requests.get(f"{BACKEND_URL}/status?limit=150")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # FastAPI should return 422 for validation error when limit > 100
        if response.status_code == 422:
            print_result(True, "Correctly rejected limit > 100 with validation error")
            return True
        elif response.status_code == 200:
            data = response.json()
            count = len(data)
            # If it accepts it, it should cap at 100
            passed = count <= 100
            print_result(passed, f"Accepted but capped at {count} records (should be ≤ 100)")
            return passed
        else:
            print_result(False, f"Unexpected status code {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Limit exceeds max test failed: {str(e)}")
        return False

def test_limit_below_min():
    """Test that limit < 1 is rejected"""
    print_test_header("Limit Below Minimum (limit=0)")
    try:
        response = requests.get(f"{BACKEND_URL}/status?limit=0")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # FastAPI should return 422 for validation error when limit < 1
        passed = response.status_code == 422
        print_result(passed, "Correctly rejected limit < 1 with validation error")
        return passed
    except Exception as e:
        print_result(False, f"Limit below min test failed: {str(e)}")
        return False

def test_skip_parameter():
    """Test skip parameter for pagination"""
    print_test_header("Skip Parameter Test")
    try:
        # Get first page
        response1 = requests.get(f"{BACKEND_URL}/status?limit=5&skip=0")
        print(f"First page status: {response1.status_code}")
        
        if response1.status_code != 200:
            print_result(False, f"First page failed with status {response1.status_code}")
            return False
        
        data1 = response1.json()
        print(f"First page: {len(data1)} records")
        
        # Get second page
        response2 = requests.get(f"{BACKEND_URL}/status?limit=5&skip=5")
        print(f"Second page status: {response2.status_code}")
        
        if response2.status_code != 200:
            print_result(False, f"Second page failed with status {response2.status_code}")
            return False
        
        data2 = response2.json()
        print(f"Second page: {len(data2)} records")
        
        # Check that pages are different (if we have enough data)
        if len(data1) > 0 and len(data2) > 0:
            # Compare first record IDs to ensure they're different
            first_page_ids = [item['id'] for item in data1]
            second_page_ids = [item['id'] for item in data2]
            
            # Pages should have different records
            overlap = set(first_page_ids) & set(second_page_ids)
            passed = len(overlap) == 0
            print_result(passed, f"Skip parameter works correctly (no overlap between pages)")
            return passed
        else:
            print_result(True, "Skip parameter accepted (insufficient data to verify pagination)")
            return True
            
    except Exception as e:
        print_result(False, f"Skip parameter test failed: {str(e)}")
        return False

def test_negative_skip():
    """Test that negative skip is rejected"""
    print_test_header("Negative Skip Test (skip=-1)")
    try:
        response = requests.get(f"{BACKEND_URL}/status?skip=-1")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # FastAPI should return 422 for validation error when skip < 0
        passed = response.status_code == 422
        print_result(passed, "Correctly rejected negative skip with validation error")
        return passed
    except Exception as e:
        print_result(False, f"Negative skip test failed: {str(e)}")
        return False

def run_all_tests():
    """Run all backend tests"""
    print("\n" + "="*80)
    print("BACKEND API PAGINATION TESTING")
    print("="*80)
    
    results = {}
    
    # Test 1: Root endpoint
    results['root_endpoint'] = test_root_endpoint()
    
    # Test 2: Create test data (at least 120 records to test pagination properly)
    results['create_test_data'] = create_test_status_checks(120)
    
    # Test 3: Default pagination
    results['default_pagination'] = test_default_pagination()
    
    # Test 4: Custom limits
    results['limit_10'] = test_custom_limit(10, 10)
    results['limit_50'] = test_custom_limit(50, 50)
    results['limit_100'] = test_custom_limit(100, 100)
    
    # Test 5: Limit validation
    results['limit_exceeds_max'] = test_limit_exceeds_max()
    results['limit_below_min'] = test_limit_below_min()
    
    # Test 6: Skip parameter
    results['skip_parameter'] = test_skip_parameter()
    results['negative_skip'] = test_negative_skip()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\n{'='*80}")
    print(f"TOTAL: {passed}/{total} tests passed")
    print(f"{'='*80}\n")
    
    return passed == total

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
