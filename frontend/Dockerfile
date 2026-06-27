# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

# Pass REACT_APP_API_URL during build time (fallback to empty so it uses window location/same origin or relative paths)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# Production stage
FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
