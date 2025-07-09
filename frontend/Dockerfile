# Etapa 1: build y test de la app
FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Forzar modo CI para evitar que react-scripts test quede esperando entrada
ENV CI=true

# Ejecutar pruebas críticas sin que se quede colgado (modo no interactivo)
RUN npm test -- --watchAll=false --testPathPattern="src/views/test/(AgenteFun|PagosFun|ModalDependientes)\\.test\\.jsx" --passWithNoTests

# Construcción final de la app
RUN npm run build

# Etapa 2: servir app con Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
