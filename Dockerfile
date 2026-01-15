# Imagem base: Nginx bem levinho
FROM nginx:alpine
# Copia a pasta 'dist' (arquivos estáticos) para a pasta pública do Nginx
COPY dist /usr/share/nginx/html
# Porta interna do Nginx
EXPOSE 80