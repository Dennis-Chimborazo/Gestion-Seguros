# Etapa 1: build y test de la app
FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Ejecutar solo las pruebas de ClienteInfo, CrearClientes y ListaPagosAdmin antes de hacer el build
RUN npm test -- --testPathPattern="src/views/test/(ClienteInfo|CrearClientes|ListaPagosAdmin)\\.test\\.jsx" --passWithNoTests

RUN npm run build

# Etapa 2: servir app con Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
