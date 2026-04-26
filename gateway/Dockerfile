FROM nginx:stable-alpine

# Replace default nginx config with our gateway config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
