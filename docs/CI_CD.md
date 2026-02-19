# CI/CD and Testing

This document describes the continuous integration setup for Past and Present (Next.js e-commerce frontend).

## GitHub Actions

Tests run automatically via GitHub Actions on every push and pull request to `main` or `master`.

- **Workflow file**: `.github/workflows/test.yml`
- **Triggers**: Push and pull requests to `main` and `master`
- **Node versions**: 20, 22 (matrix)
- **Steps**: Install dependencies, lint, run Vitest with coverage, build

The workflow runs:

```bash
npm ci
npm run lint
npm run test:coverage
npm run build
```

## Coverage Configuration

Coverage is configured in `vitest.config.ts`:

- **Provider**: v8
- **Reporters**: text, text-summary, html, lcov
- **Include**: `src/lib/**`, `src/contexts/**`, `src/components/**`
- **Exclude**: test files, `src/test/**`

## Running Locally

### Run all unit tests

```bash
npm run test
```

### Run tests with coverage

```bash
npm run test:coverage
```

For an HTML report, open `coverage/index.html` in a browser after running `npm run test:coverage`.

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

## E2E Tests

E2E tests (Cypress) require both Django and Next.js to be running. They are not run in CI by default. See [TESTING.md](../TESTING.md) for E2E setup and prerequisites.
