FROM mysql:8.0

# Copy custom scripts
COPY database/init.sql /docker-entrypoint-initdb.d/01-init.sql
COPY database/ensure-columns.sh /docker-entrypoint-initdb.d/02-ensure-columns.sh

# Fix line endings (remove CRLF) and make script executable
RUN sed -i 's/\r$//' /docker-entrypoint-initdb.d/02-ensure-columns.sh && \
    chmod +x /docker-entrypoint-initdb.d/02-ensure-columns.sh

# Add custom healthcheck script that also fixes columns
COPY database/healthcheck.sh /healthcheck.sh

# Fix line endings (remove CRLF) and make script executable
RUN sed -i 's/\r$//' /healthcheck.sh && \
    chmod +x /healthcheck.sh

# Override healthcheck
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD /healthcheck.sh
