# Running End-to-End Config Parity Tests

This guide explains how to set up and run the end-to-end tests for Kreuzberg language bindings.

## Quick Start

### Python

```bash
cd e2e/python
pip install -r requirements.txt
pytest tests/test_config_parity.py -v
```

### TypeScript

```bash
cd e2e/typescript
npm install
npm test
```

Or with pnpm:

```bash
pnpm install
pnpm test
```

### Ruby

```bash
cd e2e/ruby
bundle install
bundle exec rspec spec/config_parity_spec.rb -f d
```

## Prerequisites

### Python
- Python 3.10 or higher
- pip or uv package manager
- kreuzberg package (4.2.0 or higher)

### TypeScript
- Node.js 18+ or 20+
- npm, pnpm, or yarn
- @kreuzberg/node package (4.2.0 or higher)
- TypeScript 5.3+

### Ruby
- Ruby 3.2 or higher
- Bundler 2.4+
- kreuzberg gem (4.2.0 or higher)

## Setup Instructions

### Python Setup

1. Navigate to the Python test directory:
   cd e2e/python

2. Create a virtual environment (optional but recommended):
   python -m venv venv
   source venv/bin/activate

3. Install dependencies:
   pip install -r requirements.txt

4. Run tests:
   pytest tests/test_config_parity.py -v

### TypeScript Setup

1. Navigate to the TypeScript test directory:
   cd e2e/typescript

2. Install dependencies:
   npm install

3. Run tests:
   npm test

### Ruby Setup

1. Navigate to the Ruby test directory:
   cd e2e/ruby

2. Install dependencies:
   bundle install

3. Run tests:
   bundle exec rspec spec/config_parity_spec.rb -f d

## Running All Tests at Once

Create a script and run:

cd e2e
# Run each language test
cd python && pytest tests/test_config_parity.py -v
cd ../typescript && npm test
cd ../ruby && bundle exec rspec spec/config_parity_spec.rb

## Test Output

Tests should complete with output showing all 35+ tests passing across each language binding.

## Troubleshooting

### Python
- ImportError: pip install kreuzberg
- Test timeout: pytest tests/test_config_parity.py --timeout=600

### TypeScript
- Module not found: npm install @kreuzberg/node

### Ruby
- Bundler error: gem install bundler && bundle install
- Kreuzberg not found: gem install kreuzberg

## Next Steps

Once tests pass, verify:
1. All format combinations work
2. Serialization round-trips are consistent
3. Error handling works across languages
4. Different document types work (if available)
