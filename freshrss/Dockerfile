FROM freshrss/freshrss:latest

# Set environment variables
ENV TZ=Europe/Stockholm
ENV CRON_MIN=5,35

# Update Apache default site to point to FreshRSS
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/FreshRSS/p|g' /etc/apache2/sites-available/000-default.conf && \
    sed -i 's|<Directory /var/www/html>|<Directory /var/www/FreshRSS/p>|g' /etc/apache2/sites-available/000-default.conf && \
    echo '<Directory /var/www/FreshRSS/p>\n  AllowOverride All\n  Require all granted\n</Directory>' >> /etc/apache2/sites-available/000-default.conf

# Railway uses PORT env var
ENV PORT=80
EXPOSE 80
