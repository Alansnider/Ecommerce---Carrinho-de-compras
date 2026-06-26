# 🛒 Ecommerce — Carrinho de Compras

Aplicação de e-commerce com carrinho de compras, desenvolvida com **Spring Boot** no backend e **React** no frontend. Os produtos são consumidos da [Platzi Fake Store API](https://api.escuelajs.co/api/v1/) e o carrinho é persistido no MongoDB.

---

## 📋 Funcionalidades

- Listagem de produtos via API externa (Platzi Fake Store)
- Criação e gerenciamento de carrinho de compras
- Adição, atualização e remoção de itens do carrinho
- Finalização de pedido com escolha de forma de pagamento (Pix, Débito ou Crédito)
- Cálculo automático do total do carrinho
- Interface React responsiva com filtros por categoria, busca e ordenação

---

## 🏗️ Arquitetura

```
├── backend/          # Spring Boot (Java)
│   ├── controller/   # Endpoints REST
│   ├── service/      # Regras de negócio
│   ├── entity/       # Modelos (Basket, Product, Status, PaymentMethod)
│   ├── repository/   # Acesso ao MongoDB
│   └── client/       # Integração com Platzi API (Feign Client)
│
└── ShoppingCart.jsx  # Frontend React
```

---

## 🚀 Tecnologias

### Backend
| Tecnologia | Descrição |
|---|---|
| Java 17+ | Linguagem principal |
| Spring Boot | Framework web |
| Spring Data MongoDB | Persistência |
| OpenFeign | Integração com API externa |
| Lombok | Redução de boilerplate |
| Maven | Gerenciamento de dependências |

### Frontend
| Tecnologia | Descrição |
|---|---|
| React | Interface do usuário |
| JavaScript (ES6+) | Linguagem principal |
| Fetch API | Comunicação com o backend |
| Intl API | Formatação de moeda (BRL) |

---

## ⚙️ Pré-requisitos

- Java 17 ou superior
- Maven 3.8+
- MongoDB rodando localmente na porta `27017`
- Node.js 18+ e npm (para o frontend)

---

## 🔧 Como rodar

### Backend

```bash
# Clone o repositório
git clone https://github.com/Alansnider/Ecommerce---Carrinho-de-compras.git
cd Ecommerce---Carrinho-de-compras

# Suba o MongoDB (se usar Docker)
docker run -d -p 27017:27017 --name mongo mongo:latest

# Rode a aplicação
./mvnw spring-boot:run
```

O servidor sobe em `http://localhost:8080`.

### Frontend

```bash
# Crie um projeto React
npx create-react-app meu-carrinho
cd meu-carrinho

# Substitua o src/App.js pelo ShoppingCart.jsx do repositório
# Depois rode:
npm start
```

A interface abre em `http://localhost:3000`.

---

## 📡 Endpoints da API

### Produtos

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/products` | Lista todos os produtos |
| `GET` | `/products/{id}` | Busca produto por ID |

### Carrinho

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/basket/{id}` | Busca carrinho por ID |
| `POST` | `/basket` | Cria um novo carrinho |
| `PUT` | `/basket/{id}` | Atualiza itens do carrinho |
| `PUT` | `/basket/{id}/pay` | Finaliza o pedido com forma de pagamento |
| `DELETE` | `/basket/{id}` | Remove o carrinho |

### Exemplo de requisição — criar carrinho

```json
POST /basket
{
  "id": 1001,
  "products": [
    { "id": 1, "quantity": 2 },
    { "id": 5, "quantity": 1 }
  ]
}
```

### Exemplo de requisição — pagar

```json
PUT /basket/{id}/pay

"PIX"
```

Formas de pagamento aceitas: `PIX`, `DEBIT`, `CREDIT`.

---

## 🗄️ Configuração do banco

O MongoDB é configurado em `src/main/resources/application.yml`:

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/basketdb
```

---

## 📦 Modelo de dados

### Basket (Carrinho)
```json
{
  "id": "string",
  "client": 1001,
  "totalprice": 299.90,
  "products": [...],
  "status": "OPEN | SOLD",
  "paymentMethod": "PIX | DEBIT | CREDIT"
}
```

### Product (Produto no carrinho)
```json
{
  "id": 1,
  "title": "Nome do produto",
  "price": 99.90,
  "quantity": 2
}
```

---

## 🌐 API Externa

Os produtos são consumidos da **Platzi Fake Store API**:

```
https://api.escuelajs.co/api/v1/products
```

---

## 👤 Autor

**Alan Snider**  
[github.com/Alansnider](https://github.com/Alansnider)
