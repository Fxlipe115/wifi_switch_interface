### Configurando conexão com a API Adafruit

Url da API: https://io.adafruit.com/

Fazer uma cópia do arquivo `.env.example` para `.env` dentro da pasta server e colocar os dados da API.

### Instalando pacotes

Rodar o `npm install` dentro das duas pastas.

### Trabalhando com a interface

**Inicie o servidor para consumir:** `cd server && npm run start`

**Servidor estará disponível em:** http://localhost:8000

**Trabalhar na interface:** `cd front-dev && npm run hot`

**Url da interface:** http://localhost:8080


### Fazendo o build da interface

Mover os arquivos necessários da pasta _front-dev/_ para _server/_: `cd front-dev && npm run prod`

