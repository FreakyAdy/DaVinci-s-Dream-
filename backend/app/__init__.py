"""Da Vinci's Dream application package."""
import sys

# Prevent unstable binary pyarrow extension on Python 3.14 Windows
if 'pyarrow' not in sys.modules:
    sys.modules['pyarrow'] = None
