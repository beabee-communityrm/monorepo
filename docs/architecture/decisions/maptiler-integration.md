# MapTiler Integration Architecture Decision Record

## Status

Accepted

## Context

The Beabee application needed interactive mapping capabilities for CrowdNewsroom callouts to:

- Display responses on interactive maps
- Allow location addition via map clicks
- Provide automatic address lookup from coordinates
- Integrate with form submissions

## Decision

Integrate MapTiler as the primary mapping service using MapLibre GL JS for the frontend library.

## Implementation

**Key Components:**

- `@maptiler/client` for API calls
- Custom geocoding utilities
- Vue components wrapping MapLibre GL JS

**Data Flow:**

1. User clicks "Add Location"
2. Map enters add mode
3. User selects coordinates
4. Reverse geocoding via MapTiler API
5. Address data populates form

## Related Decisions

- [Vue.js Component Architecture](./vue-component-architecture.md)
- [Frontend State Management](./frontend-state-management.md)

## References

- [MapTiler Documentation](https://docs.maptiler.com/)
- [MapLibre GL JS Documentation](https://maplibre.org/maplibre-gl-js-docs/)
