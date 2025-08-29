# MapTiler Integration Architecture Decision Record

## Status

Accepted

## Context

The Beabee application needed to provide interactive mapping capabilities for CrowdNewsroom callouts, allowing users to:

- View responses on an interactive map
- Click on the map to add new locations
- Automatically retrieve formatted addresses from coordinates
- Integrate address data with form submissions

## Decision

We chose to integrate MapTiler as the primary mapping and geocoding service, using MapLibre GL JS as the mapping library and implementing a custom geocoding workflow.

## Rationale

### MapTiler Selection

- **Open Source Friendly**: MapTiler provides free tiers and open-source licensing
- **Integration**: Vue.js and MapLibre GL JS support available
- **Cost Effective**: Lower pricing compared to Google Maps Platform

### MapLibre GL JS

- **Open Source**: No licensing restrictions or usage limits
- **Performance**: Hardware-accelerated rendering with WebGL
- **Compatibility**: Works well with MapTiler tiles and services
- **Community**: Active development and good documentation

### Architecture Approach

- **Client-Side Geocoding**: Direct API calls from frontend for immediate response
- **Vue Integration**: Native Vue components for seamless integration
- **Type Safety**: Full TypeScript support for geocoding functions
- **Error Handling**: Graceful degradation when services are unavailable

## Alternatives Considered

### Google Maps Platform

- **Pros**: Excellent coverage, reliable service, comprehensive features
- **Cons**: Expensive, restrictive licensing, vendor lock-in
- **Decision**: Rejected due to cost and licensing concerns

### OpenStreetMap + Nominatim

- **Pros**: Completely free, open data, no rate limits
- **Cons**: Less reliable geocoding, limited address coverage
- **Decision**: Considered as fallback but not primary solution

### Here Maps

- **Pros**: Good coverage, reasonable pricing
- **Cons**: Less developer-friendly, limited Vue.js support
- **Decision**: Rejected due to integration complexity

## Consequences

### Positive

- **User Experience**: Seamless map interaction with immediate address lookup
- **Developer Experience**: Clean API, good documentation, TypeScript support
- **Cost**: Affordable pricing with generous free tiers
- **Flexibility**: Custom address formatting and validation patterns

### Negative

- **Dependency**: Reliance on external service for core functionality
- **Rate Limits**: API usage constraints based on plan type
- **Network Dependency**: Requires internet connection for geocoding
- **API Key Management**: Need to manage and secure API keys

### Risks

- **Service Outages**: MapTiler downtime affects map functionality
- **API Changes**: Breaking changes in MapTiler API could require updates
- **Cost Escalation**: Usage growth could increase costs significantly

## Implementation Details

### Key Components

1. **MapTiler Client**: `@maptiler/client` package for API calls
2. **Geocoding Utilities**: Custom functions for coordinate-to-address conversion
3. **Map Integration**: Vue components wrapping MapLibre GL JS
4. **Form Integration**: Seamless data flow from map to form components

### Data Flow

1. User clicks "Add Location" button
2. Map enters add mode with crosshair cursor
3. User clicks on map coordinates
4. `reverseGeocode()` calls MapTiler API
5. Address data is formatted and stored
6. Form is pre-populated with address information

### Configuration

- Environment variable for API key management
- Configurable address formatting patterns
- Geographic restrictions and language settings
- Custom map styles and zoom constraints

## Monitoring and Maintenance

### Health Checks

- Monitor MapTiler API response times
- Track geocoding success/failure rates
- Alert on service outages or errors

### Cost Management

- Monitor API usage and rate limits
- Implement caching for frequently requested coordinates
- Consider fallback services for cost optimization

### Updates and Maintenance

- Regular dependency updates for MapTiler client
- Monitor API deprecation notices
- Plan for breaking changes and migrations

## Future Considerations

### Potential Enhancements

- **Caching Layer**: Implement Redis or similar for geocoding results
- **Fallback Services**: Add multiple geocoding providers for redundancy
- **Offline Support**: Cache map tiles and common geocoding results
- **Batch Processing**: Group multiple coordinate requests for efficiency

### Migration Path

- Design interfaces to abstract geocoding provider
- Implement adapter pattern for multiple services
- Maintain backward compatibility during transitions

## Related Decisions

- [Vue.js Component Architecture](./vue-component-architecture.md)
- [Frontend State Management](./frontend-state-management.md)
- [API Integration Patterns](./api-integration-patterns.md)

## References

- [MapTiler Documentation](https://docs.maptiler.com/)
- [MapLibre GL JS Documentation](https://maplibre.org/maplibre-gl-js-docs/)
- [Vue Maplibre GL](https://vue-maplibre-gl.maplibre.org/)
- [Geocoding API Reference](https://docs.maptiler.com/api/geocoding/)
