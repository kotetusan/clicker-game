FROM nginx:alpine

# Copy static files
# Copy application files (relies on .dockerignore to exclude unwanted files)
COPY . /usr/share/nginx/html/

# Update Nginx config to listen on port 8080 (Cloud Run default)
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf

# Set permissions
RUN chmod -R 755 /usr/share/nginx/html

# Expose port 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
