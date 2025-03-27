#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Iniciando configuração do servidor...${NC}"

# Atualizar sistema
echo -e "${YELLOW}Atualizando sistema...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

# Instalar Node.js
echo -e "${YELLOW}Instalando Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar versão do Node.js
node_version=$(node --version)
echo -e "${GREEN}Node.js instalado: $node_version${NC}"

# Instalar Nginx
echo -e "${YELLOW}Instalando Nginx...${NC}"
sudo apt-get install -y nginx

# Instalar Certbot
echo -e "${YELLOW}Instalando Certbot...${NC}"
sudo apt-get install -y certbot python3-certbot-nginx

# Criar diretório do projeto
echo -e "${YELLOW}Criando diretório do projeto...${NC}"
sudo mkdir -p /var/www/turbo-gauge-logger
sudo chown -R $USER:$USER /var/www/turbo-gauge-logger

# Configurar firewall
echo -e "${YELLOW}Configurando firewall...${NC}"
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw allow 2590
sudo ufw --force enable

# Obter certificado SSL primeiro
echo -e "${YELLOW}Obtendo certificado SSL...${NC}"
sudo certbot certonly --standalone -d turbo.asgardai.com.br --non-interactive --agree-tos --email seu-email@exemplo.com

# Configurar Nginx
echo -e "${YELLOW}Configurando Nginx...${NC}"
cat > /etc/nginx/sites-available/turbo-gauge-logger << 'EOL'
server {
    listen 80;
    server_name turbo.asgardai.com.br;
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name turbo.asgardai.com.br;

    ssl_certificate /etc/letsencrypt/live/turbo.asgardai.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/turbo.asgardai.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/turbo-gauge-logger/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Configuração para CORS
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';

    # Configuração para WebSocket
    location /ws {
        proxy_pass http://localhost:2590;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

# Ativar configuração do Nginx
echo -e "${YELLOW}Ativando configuração do Nginx...${NC}"
sudo ln -sf /etc/nginx/sites-available/turbo-gauge-logger /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração do Nginx
echo -e "${YELLOW}Testando configuração do Nginx...${NC}"
sudo nginx -t

# Reiniciar Nginx
echo -e "${YELLOW}Reiniciando Nginx...${NC}"
sudo systemctl restart nginx

# Criar arquivo de ambiente
echo -e "${YELLOW}Criando arquivo de ambiente...${NC}"
cat > /var/www/turbo-gauge-logger/.env << 'EOL'
NODE_ENV=production
VITE_API_URL=https://turbo.asgardai.com.br
PORT=2590
EOL

# Criar script de deploy
echo -e "${YELLOW}Criando script de deploy...${NC}"
cat > /var/www/turbo-gauge-logger/deploy.sh << 'EOL'
#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Iniciando deploy...${NC}"

# Navegar para o diretório do projeto
cd /var/www/turbo-gauge-logger

# Atualizar código
echo -e "${YELLOW}Atualizando código...${NC}"
git pull

# Instalar dependências
echo -e "${YELLOW}Instalando dependências...${NC}"
npm install

# Fazer build
echo -e "${YELLOW}Fazendo build...${NC}"
npm run build

# Reiniciar serviços
echo -e "${YELLOW}Reiniciando serviços...${NC}"
sudo systemctl restart nginx
sudo systemctl restart turbo-gauge-logger

echo -e "${GREEN}Deploy concluído!${NC}"
EOL

# Dar permissão de execução ao script de deploy
echo -e "${YELLOW}Configurando permissões do script de deploy...${NC}"
sudo chmod +x /var/www/turbo-gauge-logger/deploy.sh
sudo chown $USER:$USER /var/www/turbo-gauge-logger/deploy.sh

# Criar serviço systemd para o app
echo -e "${YELLOW}Criando serviço systemd...${NC}"
cat > /etc/systemd/system/turbo-gauge-logger.service << 'EOL'
[Unit]
Description=Turbo Gauge Logger
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/turbo-gauge-logger
Environment=PORT=2590
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOL

# Recarregar systemd e iniciar serviço
echo -e "${YELLOW}Iniciando serviço...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable turbo-gauge-logger
sudo systemctl start turbo-gauge-logger

echo -e "${GREEN}Configuração concluída!${NC}"
echo -e "${YELLOW}Próximos passos:${NC}"
echo "1. Clone seu repositório em /var/www/turbo-gauge-logger"
echo "2. Execute o script de deploy: cd /var/www/turbo-gauge-logger && ./deploy.sh"
echo "3. Verifique se o site está acessível em https://turbo.asgardai.com.br"
echo "4. Atualize o capacitor.config.ts com a nova URL: https://turbo.asgardai.com.br"
echo "5. Gere um novo APK com: npx cap sync android && cd android && ./gradlew assembleDebug" 