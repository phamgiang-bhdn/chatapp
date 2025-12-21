FROM mysql:8.0

# Copy custom scripts
COPY database/init.sql /docker-entrypoint-initdb.d/01-init.sql
COPY database/ensure-columns.sh /docker-entrypoint-initdb.d/02-ensure-columns.sh

# Make script executable
RUN chmod +x /docker-entrypoint-initdb.d/02-ensure-columns.sh

# Add custom healthcheck script that also fixes columns
COPY database/healthcheck.sh /healthcheck.sh
RUN chmod +x /healthcheck.sh

# Override healthcheck
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD /healthcheck.sh
