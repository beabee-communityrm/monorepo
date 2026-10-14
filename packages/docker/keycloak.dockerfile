FROM quay.io/keycloak/keycloak:26.7

# Magic links let beabee hand a signup over to Keycloak without an email round
# trip, mirroring Zitadel's invite codes
ADD https://repo1.maven.org/maven2/io/phasetwo/keycloak/keycloak-magic-link/0.88/keycloak-magic-link-0.88.jar /opt/keycloak/providers/
