#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ==================== WIFI ====================
const char* ssid = "NOME_DA_REDE";
const char* password = "SENHA_DA_REDE";

// ==================== API =====================
const char* apiURL =
"API";

// ==================== PINOS SEGUROS ===========
#define RELE   26
#define LED    2
#define BOTAO  27
#define IDSENSOR 1
#define IDDISPOSITIVO 1

// =================================================
// ENVIA LEITURA (TEMPERATURA ou UMIDADE)
// =================================================
bool enviarLeitura(const char* tipo, float valor, int idSensor, int idDispositivo) {

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado");
    return false;
  }

  HTTPClient http;
  http.begin(apiURL);
  http.setTimeout(8000);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<128> doc;
  doc["action"] = "inserirLeitura";
  doc["tipo"] = tipo;      // "temperatura" ou "umidade"
  doc["valor"] = valor;
  doc["id_sensor"] = idSensor;
  doc["id_dispositivo"] = idDispositivo;

  String payload;
  serializeJson(doc, payload);

  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    Serial.print(tipo);
    Serial.print(" -> ");
    Serial.println(http.getString());
    http.end();
    return true;
  } else {
    Serial.println("Erro HTTP");
    http.end();
    return false;
  }
}

// =================================================
// SETUP
// =================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(RELE, OUTPUT);
  pinMode(LED, OUTPUT);
  pinMode(BOTAO, INPUT_PULLUP);

  WiFi.begin(ssid, password);
  Serial.print("Conectando ao WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi conectado");
}

// =================================================
// LOOP
// =================================================
void loop() {

  // 🔧 Simulação (substitua pelos sensores reais)
  float temperatura = 25.0 + random(-10, 10) * 0.1;
  float umidade = 60.0 + random(-20, 20) * 0.1;

  enviarLeitura("temperatura", temperatura,IDSENSOR, IDDISPOSITIVO);
  enviarLeitura("umidade", umidade,IDSENSOR, IDDISPOSITIVO);
  


  digitalWrite(LED, !digitalRead(LED)); // pisca LED

  delay(5000);
}
