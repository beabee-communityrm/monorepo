# Beabee Documentation

## Overview

Documentation for the Beabee project's MapTiler integration and frontend components.

## Documentation Structure

### [Frontend Documentation](./frontend/)

- [MapTiler Integration](./frontend/maptiler-integration.md) - Interactive mapping and geocoding functionality
- [MapTiler Address Provider](./frontend/maptiler-provider.md) - Form.io address provider for address lookup and autocomplete
- [Form Builder](./frontend/form-builder.md) - Dynamic form creation with automatic MapTiler integration

### [Architecture Decisions](./architecture/)

- [MapTiler Integration](./architecture/decisions/maptiler-integration.md) - Technical decisions and tradeoffs

### [Environment Configuration](./environment-variables.md)

- Environment configuration and setup

## Getting Started

### MapTiler Setup

1. **Get MapTiler API Key**

   - Sign up at [MapTiler](https://www.maptiler.com/)
   - Create an API key for your domain

2. **Configure Environment**

   ```bash
   BEABEE_MAPTILER_KEY=your_maptiler_api_key_here
   ```

3. **Restart Services**
   ```bash
   docker compose up -d
   ```

### Prerequisites

- MapTiler API key (required for mapping features)
