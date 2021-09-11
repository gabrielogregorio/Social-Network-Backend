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

module.exports = {processId}