"""Pytest configuration and environment initialization."""
import sys

# Python 3.14 Windows compatibility:
# Prevent pandas from attempting to load crashing binary pyarrow C-extensions
sys.modules['pyarrow'] = None
