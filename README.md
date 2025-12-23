# 📘 Documentação da API REST – ESP32 + Google Apps Script

Esta API REST utiliza **Google Apps Script + Google Sheets** como backend relacional, sendo consumida por **ESP32**, **frontend web** ou **aplicações TypeScript**.

A comunicação é feita via **HTTP POST** com payload em **JSON**.

---

## 🌐 URL BASE

```text
https://script.google.com/macros/s/SEU_ID_DO_SCRIPT/exec
```

---

## 📦 FORMATO PADRÃO DA REQUISIÇÃO

```json
{
  "action": "nomeDaAcao",
  "parametro": "valor"
}
```

---

## 📦 FORMATO PADRÃO DA RESPOSTA

```json
{
  "status": "ok",
  "dados": []
}
```

---

# 📌 ROTAS DISPONÍVEIS

## 1️⃣ Inserir Dispositivo

### 🔹 Action
```
inserirDispositivo
```

### 🔸 Payload
```json
{
  "action": "inserirDispositivo",
  "nome": "ESP32 Patio SE",
  "latitude": -10.123456,
  "longitude": -40.654321
}
```

### 🔹 Resposta
```json
{
  "status": "ok",
  "id_dispositivo": 1
}
```

### 🧠 Observação
- `id_dispositivo` é **gerado automaticamente**

---

## 2️⃣ Inserir Leitura (Temperatura / Umidade)

### 🔹 Action
```
inserirLeitura
```

### 🔸 Payload
```json
{
  "action": "inserirLeitura",
  "tipo": "temperatura",
  "valor": 25.7,
  "id_sensor": 1,
  "id_dispositivo": 1
}
```

### 🔹 Resposta
```json
{
  "status": "ok",
  "id_leitura": 15,
  "tabela": "leitura_temperatura"
}
```

---

## 3️⃣ Listar Todas as Leituras

### 🔹 Action
```
listarTodas
```

### 🔸 Payload
```json
{
  "action": "listarTodas",
  "tipo": "umidade"
}
```

### 🔹 Resposta
```json
{
  "status": "ok",
  "total": 3,
  "dados": [
    {
      "id_leitura": 1,
      "criado_em": "2025-01-10T10:00:00Z",
      "id_sensor": 1,
      "id_dispositivo": 1,
      "valor": 60.5
    }
  ]
}
```

---

## 4️⃣ Listar Leituras por Dia

### 🔹 Action
```
listarPorDia
```

### 🔸 Payload
```json
{
  "action": "listarPorDia",
  "tipo": "temperatura",
  "data": "2025-01-10",
  "id_sensor": 1
}
```

---

## 5️⃣ Buscar Leitura por ID

### 🔹 Action
```
buscarPorId
```

### 🔸 Payload
```json
{
  "action": "buscarPorId",
  "tipo": "umidade",
  "id_leitura": 5
}
```

---

## 6️⃣ Apagar Leitura por ID

### 🔹 Action
```
apagarPorId
```

### 🔸 Payload
```json
{
  "action": "apagarPorId",
  "tipo": "temperatura",
  "id_leitura": 10
}
```

---

# 💻 EXEMPLOS DE USO EM TYPESCRIPT

## 🔹 Cliente HTTP Genérico

```ts
const API_URL = "https://script.google.com/macros/s/SEU_ID_DO_SCRIPT/exec";

async function apiPost<T>(payload: object): Promise<T> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error("Erro HTTP");
  }

  return res.json();
}
```

---

## 🔹 Inserir Dispositivo

```ts
const dispositivo = await apiPost<{ id_dispositivo: number }>({
  action: "inserirDispositivo",
  nome: "ESP32 Subestação",
  latitude: -10.12,
  longitude: -40.65
});

console.log(dispositivo.id_dispositivo);
```

---

## 🔹 Inserir Leitura

```ts
await apiPost({
  action: "inserirLeitura",
  tipo: "temperatura",
  valor: 26.3,
  id_sensor: 1,
  id_dispositivo: 1
});
```

---

## 🔹 Listar Leituras por Dia

```ts
const leituras = await apiPost<{ dados: any[] }>({
  action: "listarPorDia",
  tipo: "umidade",
  data: "2025-01-10",
  id_sensor: 1
});

console.table(leituras.dados);
```

---

## 🔹 Apagar Leitura

```ts
await apiPost({
  action: "apagarPorId",
  tipo: "temperatura",
  id_leitura: 3
});
```

---


---

📌 **Esta API já está pronta para produção em projetos IoT.**

