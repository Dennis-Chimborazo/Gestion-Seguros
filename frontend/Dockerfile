# Etapa 1: build y test de la app
FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Solo activar CI para evitar que `npm test` se quede colgado
ENV CI=true
RUN npm test -- --watchAll=false --testPathPattern="src/views/test/(AgenteFun|PagosFun|ModalDependientes)\\.test\\.jsx" --passWithNoTests

# Desactivar CI para que `npm run build` no falle por warnings
ENV CI=false
RUN npm run build

# Etapa 2: servir app con Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
