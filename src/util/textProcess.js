// Cuida do processamento de entradas, a fim de concentrar os tratamentos de textos

/**
 * 
 * @param {Um canditado a ser o identificado} id String, null or undefined
 * @returns value or undefined
 */
function processId (id) {
  // Realiza processamento de ids
  if (id == undefined || id == '' || id == null) {
    return undefined;
  }
  return `${id}`;
}

function processEmail(email) {
  //https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

module.exports = {processId, processEmail}