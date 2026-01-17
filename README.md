# API de Pagamentos - Teste Técnico Capco

Este projeto é uma API RESTful para processamento de pagamentos, construída com **NestJS** como parte de uma avaliação técnica para a **Capco**. A aplicação integra-se ao **Mercado Pago** para processamento de pagamentos e utiliza **Prisma** como ORM para persistência em **PostgreSQL**.

O projeto foi desenvolvido com foco em **arquitetura limpa**, **separação de responsabilidades** e **facilidade de evolução**, mantendo o domínio desacoplado de frameworks, protocolos HTTP e detalhes de infraestrutura.

---

## Funcionalidades

* **Criação de Pagamentos**: Suporte a pagamentos via **Cartão de Crédito** e **PIX**.
* **Consulta de Pagamentos**: Busca por ID ou filtros combináveis.
* **Atualização de Pagamentos**: Alteração de dados e status.
* **Integração com Webhook do Mercado Pago**: Atualização assíncrona do status do pagamento.
* **Validação de Assinatura de Webhook**: Garantia de autenticidade das notificações recebidas.
* **Persistência com Prisma**: Migrações e acesso ao banco de dados PostgreSQL.
* **Ambiente Containerizado**: Banco de dados provisionado via Docker Compose.

---

## Tecnologias Utilizadas

* **Backend**: NestJS, TypeScript
* **Banco de Dados**: PostgreSQL
* **ORM**: Prisma
* **Gateway de Pagamento**: SDK oficial do Mercado Pago
* **Containerização**: Docker e Docker Compose
* **Testes**: Jest

---

## Arquitetura

O projeto segue princípios de **Clean Architecture**, separando claramente as responsabilidades:

* `src/domain`

  * Entidades de negócio
  * Value Objects
  * Regras de domínio
  * Interfaces de repositórios

* `src/application`

  * Casos de uso
  * Orquestração da lógica de negócio

* `src/infrastructure`

  * Controllers (HTTP)
  * Implementações de repositórios
  * Integrações externas (Mercado Pago, Prisma)

> O domínio da aplicação não depende de frameworks ou protocolos HTTP, permitindo fácil evolução para workers, mensageria ou orquestradores como **Temporal**, sem impacto nas regras de negócio.

---

## Fluxo de Pagamento (Cartão de Crédito)

1. Cliente cria um pagamento via API.
2. A aplicação cria uma **Preference** no Mercado Pago.
3. O cliente é redirecionado para o checkout do Mercado Pago.
4. O pagamento é processado pelo Mercado Pago.
5. O Mercado Pago envia um **webhook** para a aplicação.
6. A aplicação valida a assinatura do webhook.
7. O status do pagamento é atualizado no banco de dados.

---

## Começando

### Pré-requisitos

* Node.js (v18 ou superior)
* npm
* Docker e Docker Compose
* ngrok (para testes de webhook)

---

### Instalação e Execução

1. **Clone o repositório**

   ```bash
   git clone <url-do-repositorio>
   cd capco-teste-tecnico
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente**

   Crie um arquivo `.env` na raiz do projeto:

   ```bash
   cp .env.example .env
   ```

   Variáveis necessárias:

   | Variável          | Descrição                                             |
   | ----------------- | ----------------------------------------------------- |
   | DATABASE_URL      | String de conexão do PostgreSQL                       |
   | MP_ACCESS_TOKEN   | Token de acesso do Mercado Pago                       |
   | MP_WEBHOOK_URL    | URL pública (ngrok) para receber webhooks             |
   | MP_WEBHOOK_SECRET | Chave secreta para validação de assinatura do webhook |

---

4. **Suba o banco de dados**

   ```bash
   docker compose up -d
   ```

5. **Execute as migrações**

   ```bash
   npx prisma migrate dev
   ```

6. **Exponha a aplicação com ngrok**

   ```bash
   ngrok http 3000
   ```

   Copie a URL HTTPS gerada e configure em `MP_WEBHOOK_URL`.

7. **Inicie a aplicação**

   ```bash
   npm run start:dev
   ```

   A API estará disponível em `http://localhost:3000`.

---

## Endpoints

### Criar Pagamento

**POST /api/payment**

```json
{
  "cpf": "12345678900",
  "amount": 13,
  "description": "Descrição da compra",
  "paymentMethod": "CREDIT_CARD"
}
```

---

### Buscar Pagamento por ID

**GET /api/payment/:id**

---

### Filtrar Pagamentos

**GET /api/payment?status=PAID**

---

### Atualizar Pagamento

**PUT /api/payment/:id**

```json
{
  "status": "CREDIT_CARD"
}
```

---

### Webhook do Mercado Pago

**POST /api/payment/webhook**

Endpoint utilizado exclusivamente pelo Mercado Pago para envio de eventos assíncronos.

Exemplo de payload:

```json
{
  "action": "payment.updated",
  "data": {
    "id": "123456789"
  },
  "type": "payment"
}
```

---

## Testes

* Testes unitários para **casos de uso**
* Testes unitários para **repositórios**, com Prisma mockado
* Testes de **serviços externos**, mockando o SDK do Mercado Pago

---

## Decisões Arquiteturais

* Uso de **Domain Errors** em vez de `HttpException` para manter o domínio desacoplado do protocolo HTTP.
* Controllers atuam apenas como adaptadores de entrada.
* Casos de uso concentram a lógica de negócio.
* Infraestrutura pode ser substituída sem impacto no domínio.

---

## Durabilidade do Workflow e Considerações Arquiteturais

A solução implementada garante durabilidade do estado do pagamento por meio da persistência imediata em banco de dados e do processamento assíncrono de eventos enviados pelo Mercado Pago via webhook.

O fluxo funciona da seguinte forma:

* O pagamento é criado e persistido com status PENDING.

* A transação é registrada no Mercado Pago, utilizando uma external_reference única.

* O Mercado Pago notifica a aplicação de forma assíncrona via webhook.

* A aplicação processa o evento recebido, valida o estado atual do pagamento e atualiza o status para PAID ou FAIL, respeitando as regras de negócio.

Essa abordagem garante que:

* O estado do pagamento não seja perdido em caso de falhas da aplicação.

* O processamento seja idempotente, baseado no estado persistido.

* O sistema opere com consistência eventual, adequada para integrações assíncronas com gateways de pagamento.

---

## Evolução para Workflows Duráveis

Em um cenário de produção com fluxos mais complexos, long-running workflows, políticas avançadas de retry, controle explícito de timeout e reentrância, este processo poderia ser evoluído para o uso de um orquestrador de workflows, como o Temporal.io.

Nesse modelo, o Temporal seria responsável por:

* Orquestrar o ciclo de vida do pagamento.

* Persistir automaticamente o estado do workflow.

* Garantir retries automáticos e retomada do fluxo após falhas.

* Desacoplar completamente a lógica de orquestração da infraestrutura da aplicação.

Para o contexto deste teste técnico, optou-se por uma solução mais simples e direta, mantendo a arquitetura preparada para essa evolução futura sem impacto nas regras de negócio já implementadas.

---

## Observações Finais

Este projeto foi desenvolvido com foco em legibilidade, manutenibilidade e aderência a boas práticas de engenharia de software, simulando um cenário real de integração com gateway de pagamentos e processamento assíncrono via webhooks.
