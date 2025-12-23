// =======================================================
// UTIL – RETORNO JSON PADRÃO
// =======================================================
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// =======================================================
// DOPOST – API REST
// =======================================================
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const body = JSON.parse(e.postData.contents);

    switch (body.action) {
      case "inserirLeitura":
        return inserirLeitura(ss, body);

      case "listarPorDia":
        return listarPorDia(ss, body);

      case "inserirDispositivo":
        return inserirDispositivo(ss, body);

      default:
        return jsonResponse({ erro: "Ação inválida" });
    }

  } catch (err) {
    return jsonResponse({ erro: err.toString() });
  }
}

// =======================================================
// INSERT – TEMPERATURA / UMIDADE (COM SENSOR)
// =======================================================
function inserirLeitura(sheet, params) {

  const tipo = params.tipo;           // temperatura | umidade
  const idSensor = params.id_sensor;  // obrigatório
  const idDispositivo = params.id_dispositivo;  // obrigatório
  const valor = params.valor;
  const data = new Date();

  

  if (!idSensor) {
    return jsonResponse({ erro: "id_sensor obrigatório" });
  }

  let nomeAba = "";

  if (tipo === "temperatura") {
    nomeAba = "leitura_temperatura";
  } else if (tipo === "umidade") {
    nomeAba = "leitura_umidade";
  } else {
    return jsonResponse({ erro: "Tipo inválido" });
  }

  let aba = sheet.getSheetByName(nomeAba);
  if (!aba) {
    aba = sheet.insertSheet(nomeAba);
    aba.appendRow(["id_leitura","criado_em", "id_sensor","id_dispositivo","valor"]);
  }
  
  // ================== GERA ID AUTOMÁTICO =======
  const ultimaLinha = aba.getLastRow();

  let id_leitura;
  if (ultimaLinha <= 1) {
    id_leitura = 1; // só cabeçalho existe
  } else {
    const ultimoId = aba.getRange(ultimaLinha, 1).getValue();
    id_leitura = Number(ultimoId) + 1;
  }

  aba.appendRow([id_leitura, data, idSensor,idDispositivo, valor]);

  return jsonResponse({
    status: "ok",
    tabela: nomeAba,
    id_sensor: idSensor
  });
}


function inserirDispositivo(sheet, params) {

  // ================== DADOS ==================
  const nome = params.nome;
  const latitude = params.latitude;
  const longitude = params.longitude;
  const data = new Date();

  const nomeAba = "dispositivo";

  // ================== OBTÉM / CRIA ABA =========
  let aba = sheet.getSheetByName(nomeAba);
  if (!aba) {
    aba = sheet.insertSheet(nomeAba);
    aba.appendRow([
      "id_dispositivo",
      "criado_em",
      "nome",
      "latitude",
      "longitude"
    ]);
  }

  // ================== GERA ID AUTOMÁTICO =======
  const ultimaLinha = aba.getLastRow();

  let novoId;
  if (ultimaLinha <= 1) {
    novoId = 1; // só cabeçalho existe
  } else {
    const ultimoId = aba.getRange(ultimaLinha, 1).getValue();
    novoId = Number(ultimoId) + 1;
  }

  // ================== INSERE REGISTRO ==========
  aba.appendRow([
    novoId,
    data,
    nome,
    latitude,
    longitude
  ]);

  // ================== RESPOSTA API ============
  return jsonResponse({
    status: "ok",
    id_dispositivo: novoId,
    tabela: nomeAba
  });
}


// =======================================================
// SELECT – POR DIA (OPCIONAL POR SENSOR)
// =======================================================
function listarPorDia(sheet, params) {

  const tipo = params.tipo;
  const dataFiltro = params.data;      // yyyy-MM-dd
  const idSensorFiltro = params.id_sensor; // opcional

  let nomeAba = "";

  if (tipo === "temperatura") {
    nomeAba = "leitura_temperatura";
  } else if (tipo === "umidade") {
    nomeAba = "leitura_umidade";
  } else {
    return jsonResponse({ erro: "Tipo inválido" });
  }

  const aba = sheet.getSheetByName(nomeAba);
  if (!aba || aba.getLastRow() < 2) {
    return jsonResponse({ status: "ok", total: 0, dados: [] });
  }

  const linhas = aba.getRange(2, 1, aba.getLastRow() - 1, 3).getValues();
  const resultado = [];

  linhas.forEach(l => {
    const dataLinha = Utilities.formatDate(
      new Date(l[0]),
      "GMT-3",
      "yyyy-MM-dd"
    );

    const mesmoSensor = idSensorFiltro ? l[1] == idSensorFiltro : true;

    if (dataLinha === dataFiltro && mesmoSensor) {
      resultado.push({
        criado_em: l[0],
        id_sensor: l[1],
        valor: l[2]
      });
    }
  });

  return jsonResponse({
    status: "ok",
    tipo: tipo,
    total: resultado.length,
    dados: resultado
  });
}
