const CATEGORIAS = {
  paredes: { layer: 'layer-paredes', pasta: 'imagens/paredes', itens: ['paredeazul','paredeespiral','paredemusica','paredepiano','parederenda','parederosa','paredetecidos'] },
  meias: { layer: 'layer-meias', pasta: 'imagens/meias', itens: ['meia','meiacalca','meiacalcarenda','polainas'] },
  sapatos: { layer: 'layer-sapatos', pasta: 'imagens/sapatos', itens: ['bota','crocs','sapatilha','tenis'] },
  blusas: { layer: 'layer-blusas', pasta: 'imagens/blusas', itens: ['blusaestampada','blusagola','blusalistrada','blusavermelha','corset','top'] },
  calcas: { layer: 'layer-calcas', pasta: 'imagens/calcas', itens: ['calca','saia','shortacademia','shortjeans'] },
  vestidos: { layer: 'layer-vestidos', pasta: 'imagens/vestidos', itens: ['vestidocorset','vestidoestampado','vestidorendapreto','vestidorendavermelho','vestidoxadrez'] },
  casacos: { layer: 'layer-casacos', pasta: 'imagens/casacos', itens: ['capavermelha','casacodepelo','casacomarrom','casacopreto'] },
  acessorios: { layer: 'layer-acessorios', pasta: 'imagens/acessorios', itens: ['boina','boinacomaba','brincoperolas','brincoprata','colarcoracao','colarlongo','colarperolas','elastico','presilhas','pulseiraperolas','relogio'] }
};

const PECAS_LAYER_BAIXO = ['blusagola'];
const ACESSORIOS_LAYER_BAIXO = ['elastico', 'pulseiraperolas', 'relogio'];

const estado = { paredes:null, meias:null, sapatos:null, blusas:null, calcas:null, vestidos:null, casacos:null, acessorios:null };
let categoriaAtiva = null;
let looks = JSON.parse(localStorage.getItem('looks') || '[]');
let modoFoto = false;
let notifTimer;

function irParaJogo() {
  document.getElementById('tela-capa').style.display = 'none';
  document.getElementById('tela-album').style.display = 'none';
  document.getElementById('tela-jogo').style.display = 'block';
  const audio = document.getElementById('audio-bg');
  if (audio.paused) audio.play().catch(() => {});
}

function irParaCapa() {
  document.getElementById('tela-jogo').style.display = 'none';
  document.getElementById('tela-album').style.display = 'none';
  document.getElementById('tela-capa').style.display = 'flex';
}

function irParaAlbum() {
  document.getElementById('tela-jogo').style.display = 'none';
  document.getElementById('tela-album').style.display = 'flex';
  renderizarAlbum();
}

function selecionarCategoria(btn) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('ativa'));
  btn.classList.add('ativa');
  categoriaAtiva = btn.dataset.cat;
  renderizarOpcoes(categoriaAtiva);
}

function renderizarOpcoes(cat) {
  const barra = document.getElementById('barra-opcoes');
  const cfg = CATEGORIAS[cat];
  const atual = estado[cat];
  const temPeca = atual !== null;

  let html = `
    <button class="btn-remover" ${!temPeca ? 'disabled' : ''} onclick="removerPeca('${cat}')">
      <span class="icone-x">✕</span>
      <span>Remover</span>
    </button>`;

  cfg.itens.forEach(item => {
    const selecionada = atual === item ? 'selecionada' : '';
    html += `
      <div class="opcao-item ${selecionada}" onclick="vestirPeca('${cat}','${item}',this)">
        <img src="imagens/iconesinf/iconesinf_${item}.png" alt="${item}" onerror="this.style.opacity='0.3'">
      </div>`;
  });

  barra.innerHTML = html;
}

function vestirPeca(cat, item, el) {
  estado[cat] = item;

  const usarLayerBaixo = PECAS_LAYER_BAIXO.includes(item);
  const usarAcessoriosBaixo = ACESSORIOS_LAYER_BAIXO.includes(item);

  let layerId;
  if (usarLayerBaixo) layerId = 'layer-blusas-baixo';
  else if (usarAcessoriosBaixo) layerId = 'layer-acessorios-baixo';
  else layerId = CATEGORIAS[cat].layer;

  if (cat === 'blusas') {
    const layerAlternativo = document.getElementById(usarLayerBaixo ? CATEGORIAS[cat].layer : 'layer-blusas-baixo');
    layerAlternativo.src = '';
    layerAlternativo.style.display = 'none';
  }

  if (cat === 'acessorios' && usarAcessoriosBaixo) {
    const layerNormal = document.getElementById(CATEGORIAS[cat].layer);
    layerNormal.src = '';
    layerNormal.style.display = 'none';
  }

  if (cat === 'acessorios' && !usarAcessoriosBaixo && !usarLayerBaixo) {
    const layerAcBaixo = document.getElementById('layer-acessorios-baixo');
    layerAcBaixo.src = '';
    layerAcBaixo.style.display = 'none';
  }

  const layer = document.getElementById(layerId);
  layer.src = `${CATEGORIAS[cat].pasta}/${item}.png`;
  layer.style.display = 'block';

  if (cat !== 'paredes') tocarSomVestir();
  document.querySelectorAll('.opcao-item').forEach(e => e.classList.remove('selecionada'));
  el.classList.add('selecionada');
  const btnRem = document.querySelector('.btn-remover');
  if (btnRem) btnRem.disabled = false;
}

function removerPeca(cat) {
  estado[cat] = null;
  const layer = document.getElementById(CATEGORIAS[cat].layer);
  layer.src = '';
  layer.style.display = 'none';

  if (cat === 'blusas') {
    const layerBaixo = document.getElementById('layer-blusas-baixo');
    layerBaixo.src = ''; layerBaixo.style.display = 'none';
  }

  if (cat === 'acessorios') {
    const layerAcBaixo = document.getElementById('layer-acessorios-baixo');
    layerAcBaixo.src = ''; layerAcBaixo.style.display = 'none';
  }

  renderizarOpcoes(cat);
}

function tirarFoto() {
  if (modoFoto) return;
  modoFoto = true;
  const flash = document.getElementById('flash');
  flash.style.opacity = '1';
  tocarSomCamera();
  setTimeout(() => {
    flash.style.opacity = '0';
    setTimeout(() => {
      document.getElementById('moldura-camera').style.display = 'block';
      document.getElementById('btn-salvar-look').style.display = 'block';
    }, 200);
  }, 300);
}

function fecharModoFoto() {
  modoFoto = false;
  document.getElementById('moldura-camera').style.display = 'none';
  document.getElementById('btn-salvar-look').style.display = 'none';
}

function resetarLook() {
  Object.keys(estado).forEach(cat => {
    estado[cat] = null;
    const layer = document.getElementById(CATEGORIAS[cat].layer);
    if (layer) { layer.src = ''; layer.style.display = 'none'; }
  });
  const layerBaixo = document.getElementById('layer-blusas-baixo');
  if (layerBaixo) { layerBaixo.src = ''; layerBaixo.style.display = 'none'; }
  const layerAcBaixo = document.getElementById('layer-acessorios-baixo');
  if (layerAcBaixo) { layerAcBaixo.src = ''; layerAcBaixo.style.display = 'none'; }
  categoriaAtiva = null;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('ativa'));
  document.getElementById('barra-opcoes').innerHTML = '<div class="barra-vazia">Escolha uma categoria</div>';
  fecharModoFoto();
}

function salvarLook() {
  if (looks.length >= 12) {
    mostrarNotif('Limite de 12 looks atingido! Exclua um para salvar.');
    fecharModoFoto();
    return;
  }
  const lookAtual = {};
  Object.keys(estado).forEach(cat => { lookAtual[cat] = estado[cat]; });
  looks.push({ id: Date.now(), pecas: lookAtual, data: new Date().toLocaleDateString('pt-BR') });
  localStorage.setItem('looks', JSON.stringify(looks));
  fecharModoFoto();
  mostrarNotif('Look salvo! 🎀');
}

function renderizarAlbum() {
  const grid = document.getElementById('album-grid');
  document.getElementById('album-contador').textContent = `${looks.length} / 12 looks`;

  if (looks.length === 0) {
    grid.innerHTML = `<div class="album-vazio"><span>📷</span><span>Nenhum look salvo ainda!</span></div>`;
    return;
  }

  const rots = [-3,1.5,-1,2.5,-2,1,-1.5,2,-2.5,0.5];
  const ordem = ['paredes','meias','sapatos','calcas','blusas','vestidos','acessorios','casacos'];

  grid.innerHTML = looks.map((look, i) => {
    const layers = Object.entries(look.pecas)
      .filter(([cat, val]) => val !== null)
      .sort((a,b) => ordem.indexOf(a[0]) - ordem.indexOf(b[0]));

    const parede = look.pecas['paredes'];
    const semParede = layers.filter(([cat]) => cat !== 'paredes');

    const imgsHtml = `
      ${parede ? `<img src="${CATEGORIAS['paredes'].pasta}/${parede}.png" alt="" style="object-fit:cover;width:100%;height:100%;">` : ''}
      <img src="imagens/outros/corpo.png" alt="corpo">
      ${semParede.map(([cat,val]) => `<img src="${CATEGORIAS[cat].pasta}/${val}.png" alt="">`).join('')}`;

    return `
      <div class="polaroid" style="--rot:${rots[i % rots.length]}deg">
        <div class="polaroid-img-wrap">${imgsHtml}</div>
        <div class="polaroid-label"></div>
        <button class="polaroid-del" onclick="excluirLook(${look.id})">✕</button>
      </div>`;
  }).join('');
}

function excluirLook(id) {
  looks = looks.filter(l => l.id !== id);
  localStorage.setItem('looks', JSON.stringify(looks));
  renderizarAlbum();
  mostrarNotif('Look excluído.');
}

function tocarSomCamera() {
  try {
    const audio = new Audio('sons/flash.mp3');
    audio.play();
  } catch(e) {}
}

function tocarSomVestir() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch(e) {}
}

function mostrarNotif(msg) {
  clearTimeout(notifTimer);
  const notif = document.getElementById('notif');
  notif.textContent = msg;
  notif.classList.add('visivel');
  notifTimer = setTimeout(() => notif.classList.remove('visivel'), 3000);
}