// LOJA DE DIAMANTES: links da Tebex e preços dos 6 pacotes.
//
// Como preencher cada pacote:
//   link:  o endereço do pacote na loja, entre aspas simples.
//          Precisa começar com https://ryzrp.tebex.store/
//          Qualquer outro endereço é ignorado e o botão continua "Em breve".
//          Vazio ('') = o botão continua "Em breve", com cadeado.
//   preco: o texto do preço, do jeito que deve aparecer no site. Ex.: 'R$ 9,90'
//          Vazio ('') = continua "Preço em breve".
//
// Exemplo:  punhado: { link: 'https://ryzrp.tebex.store/package/123', preco: 'R$ 9,90' },
//
// Cuidado para não apagar aspas, vírgulas ou chaves { }.

window.RYZ_LOJA = {
  pacotes: {
    punhado: { link: '', preco: '' },
    bolsa:   { link: '', preco: '' },
    monte:   { link: '', preco: '' },
    maleta:  { link: '', preco: '' },
    bau:     { link: '', preco: '' },
    tesouro: { link: '', preco: '' }
  }
};
