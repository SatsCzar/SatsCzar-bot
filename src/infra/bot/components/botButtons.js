const botButtons = Object.freeze({
  register: [{ text: "Cadastrar", callback_data: "changeRegister" }],
  unsubscribe: [{ text: "Descadastrar", callback_data: "changeRegister" }],
  enableBitcoinPrice: [{ text: "Ativar preço do Bitcoin", callback_data: "enableDisableBitcoinPrice" }],
  disableBitcoinPrice: [{ text: "Desativar preço do Bitcoin", callback_data: "enableDisableBitcoinPrice" }],
})

module.exports = botButtons
