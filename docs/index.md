# Beabee Documentation

## Overview

Welcome to the Beabee project documentation. This section focuses on the MapTiler integration and related frontend components.

## Documentation Structure

### [Frontend Documentation](./frontend/)

MapTiler integration documentation for the Vue.js frontend application:

- [MapTiler Integration](./frontend/maptiler-integration.md) - Interactive mapping and geocoding functionality
- [MapTiler Address Provider](./frontend/maptiler-provider.md) - Form.io address provider for address lookup and autocomplete

### [Architecture Decisions](./architecture/)

Architecture Decision Records (ADRs) for MapTiler integration:

- [MapTiler Integration](./architecture/decisions/maptiler-integration.md) - Technical decisions and tradeoffs

### [Environment Configuration](./environment-variables.md)

MapTiler-related environment variables and configuration:

- MapTiler API key setup
- Development and production configuration

## Getting Started

### MapTiler Setup

1. **Get MapTiler API Key**

   - Sign up at [MapTiler](https://www.maptiler.com/)
   - Create an API key for your domain

2. **Configure Environment**

   ```bash
   # Add to .env file
   BEABEE_MAPTILER_KEY=your_maptiler_api_key_here
   ```

3. **Restart Services**
   ```bash
   docker compose up -d
   ```

### Prerequisites

- MapTiler API key (required for mapping features)

## MapTiler Features

### Interactive Maps

- Click-to-add location functionality
- Automatic address geocoding
- Customizable map styles and controls

### Form Integration

- Address autocomplete in forms
- Geographic search and filtering
- Form.io provider integration
