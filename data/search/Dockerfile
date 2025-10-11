FROM python:3.11-slim

WORKDIR /app

# Install typesense Python client
RUN pip install --no-cache-dir typesense

# The init script will run when the container starts
CMD ["python", "search/init_search.py"]
