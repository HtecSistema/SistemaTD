const URL_WEBAPP = "https://script.google.com/macros/s/AKfycbxLXw-nu5oXXtjE8HKik_W_bbT9CGjTNJWw-dUm4wWYv-hjcz1dOhMHLxoUTRHGJA3D0A/exec";
let allDados=[]; let dadosVisiveis=[]; let progressoInterval=null; let progresso=0;
let idxSelecionado=-1;

const KEY_FILTRO = "filtroLiberacao70";
const KEY_DADOS = "dadosLiberacao70";
const KEY_CICLO = "cicloLiberacao70";

// ADICIONADO - NÃO ATRAPALHA NADA, SÓ CONSERTA FILTRO
function normalizar(t){ return String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim(); }

// --- PERSISTENCIA ---
function salvarPersistencia(){
  try{
    let fMat = document.getElementById('fMat')?.value || "";
    let fNome = document.getElementById('fNome')?.value || "";
    let fCong = document.getElementById('fCong')?.value || "";
    let ciclo = document.getElementById('ciclo')?.value || "";
    localStorage.setItem(KEY_FILTRO, JSON.stringify({fMat, fNome, fCong}));
    localStorage.setItem(KEY_CICLO, ciclo);
    if(allDados && allDados.length) localStorage.setItem(KEY_DADOS, JSON.stringify(allDados));
  }catch(e){}
}

function restaurarPersistencia(){
  try{
    let cicloSalvo = localStorage.getItem(KEY_CICLO);
    if(cicloSalvo && document.getElementById('ciclo')) document.getElementById('ciclo').value = cicloSalvo;

    let fRaw = localStorage.getItem(KEY_FILTRO);
    if(fRaw){
      let f = JSON.parse(fRaw);
      if(document.getElementById('fMat')) document.getElementById('fMat').value = f.fMat || "";
      if(document.getElementById('fNome')) document.getElementById('fNome').value = f.fNome || "";
      if(document.getElementById('fCong')) document.getElementById('fCong').value = f.fCong || "";
    }

    let dRaw = localStorage.getItem(KEY_DADOS);
    if(dRaw){
      let dados = JSON.parse(dRaw);
      if(Array.isArray(dados) && dados.length){
        allDados = dados;
        render(allDados);
        document.querySelector('.list-wrap').style.display='block';
        document.getElementById('btnEnviar').style.display='block';
        let cicloSel = document.getElementById('ciclo').value;
        let cicloTxt = cicloSel==='TODOS'? 'TODOS' : 'CICLO '+String(cicloSel).padStart(2,'0');
        document.getElementById('msg').innerText = allDados.length+' <70 | '+cicloTxt+' | Restaurado';
        // reaplica filtro se tinha
        filtrar();
      }
    }
  }catch(e){}
}

function setProgresso(v,txt){
  document.getElementById('pWrap').style.display='block';
  document.getElementById('pBar').style.width=v+'%';
  document.getElementById('pBar').innerText=txt?txt:v+'%';
}
function iniciarProgressoFake(ciclo){
  document.querySelector('.list-wrap').style.display='none';
  progresso=0; setProgresso(0,'INICIANDO CICLO '+ciclo+'...');
  document.getElementById('msg').innerText='Buscando dados no Ciclo '+ciclo+' - 0%';
  progressoInterval=setInterval(()=>{
    if(progresso<85){
      progresso+=Math.random()*8;
      let p=Math.floor(progresso);
      setProgresso(p,'BUSCANDO CICLO '+ciclo+' '+p+'%');
      document.getElementById('msg').innerText='Buscando dados no Ciclo '+ciclo+' - '+p+'%';
    }
  },400);
}
function finalizarProgresso(){clearInterval(progressoInterval);setProgresso(100,'FINALIZADO 100%');setTimeout(()=>{document.getElementById('pWrap').style.display='none';},1500);}

function mostraResultado(retorno){
  clearInterval(progressoInterval);
  setProgresso(90,'PROCESSANDO...');
  let dados = retorno;
  if(typeof retorno==='string'){
    try{ dados = JSON.parse(retorno); }catch(e){ dados=[]; }
  }
  if(dados && dados.data) dados = dados.data;
  if(dados && dados.length>0 && typeof dados[0]==='object' &&!Array.isArray(dados[0])){
    dados = dados.map(it=>[it.MATRICULA||it.A||it[0]||'', it.CONGREGACAO||it.D||it[1]||'', it.CONTATO||it.C||it[2]||'', it.NOME||it.B||it[3]||'', it.CICLO||it.E||it[4]||'', it.TESTE||it.F||it[5]||'', it.NOTA||it.G||it[6]||'']);
  }
  mostraTabela(dados);
}

function buscarTabela(){
  setProgresso(95,'CARREGANDO LIBERACAO...');let s=document.createElement('script');s.src=URL_WEBAPP+"?action=getliberacao&callback=mostraTabela&t="+Date.now();document.body.appendChild(s);
}

function mostraTabela(dados){
  document.querySelector('.list-wrap').style.display='block';
  document.getElementById('btn').disabled=false;
  let arr = dados;
  if(dados && dados.data) arr = dados.data;
  if(!Array.isArray(arr)) arr=[];
  if(arr.length>0 && typeof arr[0]==='object' &&!Array.isArray(arr[0])){
    arr = arr.map(it=>[it.MATRICULA||it.A||it[0]||'', it.CONGREGACAO||it.D||it[1]||'', it.CONTATO||it.C||it[2]||'', it.NOME||it.B||it[3]||'', it.CICLO||it.E||it[4]||'', it.TESTE||it.F||it[5]||'', it.NOTA||it.G||it[6]||'']);
  }
  allDados=arr||[];
  idxSelecionado=-1;
  render(allDados);
  finalizarProgresso();
  salvarPersistencia(); // <-- SALVA
  let cicloSel = document.getElementById('ciclo').value;
  let cicloTxt = cicloSel==='TODOS'? 'TODOS' : 'CICLO '+String(cicloSel).padStart(2,'0');
  document.getElementById('msg').innerText=allDados.length+' <70 | '+cicloTxt+' | LINK H ainda não - só após ENVIAR';
  document.getElementById('lista').focus();
  if(allDados.length>0){
    document.getElementById('btnEnviar').style.display='block';
  }else{
    document.getElementById('btnEnviar').style.display='none';
  }
}

function selecionarLinha(i){
  let linhas=document.querySelectorAll('#tab tbody tr');
  if(!linhas.length) return;
  if(i<0) i=0; if(i>=linhas.length) i=linhas.length-1;
  linhas.forEach(r=>r.classList.remove('selecionada'));
  linhas[i].classList.add('selecionada');
  linhas[i].scrollIntoView({block:'nearest'});
  idxSelecionado=i;
}
function render(dados){
  dadosVisiveis = dados;
  let tb=document.querySelector('#tab tbody');tb.innerHTML='';
  if(!dados.length){
    tb.innerHTML='<tr><td colspan=7 style="text-align:center">NENHUM</td></tr>';
    document.getElementById('btnEnviar').style.display='none';
    return;
  }
  dados.forEach((l,i)=>{
    let num=String(l[5]||'').replace(/\D/g,'');
    let teste='TESTE '+num.padStart(2,'0');
    let ciclo=String(l[4]||'');
    if(ciclo &&!String(ciclo).toUpperCase().includes('CICLO')) ciclo='CICLO '+String(ciclo).replace(/\D/g,'').padStart(2,'0');
    let cong=String(l[1]||'').toUpperCase();
    let nome=String(l[3]||'').toUpperCase();
    let tr=document.createElement('tr');
    tr.innerHTML=`<td title="${cong}">${cong}</td><td>${l[0]||''}</td><td title="${nome}">${nome}</td><td>${ciclo}</td><td>${teste}</td><td class="nota">${l[6]||''}</td><td>${l[2]||''}</td>`;
    tr.addEventListener('click',()=>selecionarLinha(i));
    tb.appendChild(tr);
  });
}

function filtrar(){
  let m=normalizar(document.getElementById('fMat').value);
  let n=normalizar(document.getElementById('fNome').value);
  let c=normalizar(document.getElementById('fCong').value);
  salvarPersistencia(); // <-- SALVA FILTRO TODA VEZ QUE DIGITA
  if(!m&&!n&&!c){render(allDados);document.getElementById('msg').innerText=allDados.length+' registros';return;}
  let f=allDados.filter(l=>{
    let mat=normalizar(l[0]);
    let nome=normalizar(l[3]);
    let cong=normalizar(l[1]);
    return (!m||mat.includes(m))&&(!n||nome.includes(n))&&(!c||cong.includes(c));
  });
  idxSelecionado=-1; render(f);document.getElementById('msg').innerText=f.length+' de '+allDados.length;
}

function limparTudo(){
  localStorage.removeItem(KEY_FILTRO);
  localStorage.removeItem(KEY_DADOS);
  localStorage.removeItem(KEY_CICLO);
  document.getElementById('fMat').value='';
  document.getElementById('fNome').value='';
  document.getElementById('fCong').value='';
  allDados=[];
  dadosVisiveis=[];
  idxSelecionado=-1;
  let tb=document.querySelector('#tab tbody');
  if(tb) tb.innerHTML='<tr><td colspan=7 style="text-align:center">LISTA LIMPA</td></tr>';
  document.querySelector('.list-wrap').style.display='none';
  document.getElementById('btnEnviar').style.display='none';
  document.getElementById('btnEnviar').disabled=false;
  document.getElementById('btnEnviar').innerText='ENVIAR PARA LIBERAÇÃO';
  clearInterval(progressoInterval);
  progresso=0;
  document.getElementById('pWrap').style.display='none';
  document.getElementById('pBar').style.width='0%';
  document.getElementById('btn').disabled=false;
  document.getElementById('msg').innerText='Lista limpa - selecione o ciclo e clique em BUSCAR';
  document.getElementById('lista').focus();
}

function gerar(){
  let mat = '';
  try{
    mat = localStorage.getItem('mat_logada') || '';
    if(!mat && window.parent) mat = window.parent.localStorage.getItem('mat_logada') || '';
    if(!mat && window.parent && window.parent.document){
      let txt = window.parent.document.body.innerText || "";
      let m = txt.match(/USUÁRIO LOGADO\s*0*(\d{3,5})/i);
      if(m) mat = m[1];
    }
  }catch(e){}
  let matNorm = String(mat).replace(/\D/g,'').padStart(5,'0');

  if(matNorm!== '00425'){
    let msgEl = document.getElementById('msg');
    msgEl.style.display='block';
    msgEl.style.whiteSpace='pre-line';
    msgEl.style.textAlign='center';
    msgEl.style.background='#fef2f2';
    msgEl.style.border='1px solid #fecaca';
    msgEl.style.color='#b91c1c';
    msgEl.style.padding='16px';
    msgEl.style.borderRadius='10px';
    msgEl.style.fontWeight='700';
    msgEl.innerText = "Perdão,\nMas vossa senhoria nao tem permissão\npara este procedimento\nProcure o Administrador Htec";
    document.querySelector('.list-wrap').style.display='none';
    document.getElementById('btnEnviar').style.display='none';
    document.getElementById('btn').disabled=false;
    document.getElementById('pWrap').style.display='none';
    return;
  }

  let ciclo=document.getElementById('ciclo').value;
  salvarPersistencia(); // salva ciclo antes
  document.querySelector('.list-wrap').style.display='none';
  document.getElementById('btn').disabled=true;
  document.getElementById('btnEnviar').style.display='none';
  iniciarProgressoFake(ciclo);
  document.getElementById('msg').innerText='Buscando ciclo '+ciclo+'...';
  let agora=new Date().toLocaleString('pt-BR');
  let s=document.createElement('script');s.src=URL_WEBAPP+"?action=executarliberacao&data="+encodeURIComponent(agora)+"&ciclo="+encodeURIComponent(ciclo)+"&callback=mostraResultado&t="+Date.now();document.body.appendChild(s);
}

async function enviarParaLiberacao(){
  if(!dadosVisiveis.length){ alert("Nenhum dado"); return; }
  if(!confirm("Enviar "+dadosVisiveis.length+" para LIBERACAO? Vai limpar A2:J e gerar LINK na coluna H com CICLO 01 / TESTE 01")) return;
  let btn=document.getElementById('btnEnviar');
  btn.disabled=true;
  btn.innerText="ENVIANDO...";
  setProgresso(50,'ENVIANDO... LIMPANDO A2:J E GERANDO LINK H');
  try{
    let resp = await fetch(URL_WEBAPP, {
      method:'POST',
      headers:{'Content-Type':'text/plain'},
      body: JSON.stringify({acao:'salvarliberacao', dados:dadosVisiveis})
    });
    let txt = await resp.text();
    let res = {};
    try{ res = JSON.parse(txt); }catch(e){ res = {ok:false, err:txt}; }
    retornoEnvio(res);
  }catch(err){
    let dadosEncoded = encodeURIComponent(JSON.stringify(dadosVisiveis));
    let s=document.createElement('script');
    s.src=URL_WEBAPP+"?acao=salvarliberacao&dados="+dadosEncoded+"&callback=retornoEnvio&t="+Date.now();
    document.body.appendChild(s);
  }
}
function retornoEnvio(res){
  let btn=document.getElementById('btnEnviar');
  btn.disabled=false;
  btn.innerText="ENVIAR PARA LIBERACAO";
  finalizarProgresso();
  if(res && (res.ok || res.qtd>0)){
    setProgresso(100,'ENVIADO! '+res.qtd+' registros - CICLO 01 / TESTE 01 / LINK H');
    document.getElementById('msg').innerText=res.qtd+" enviados para LIBERACAO! "+ (res.msg||'');
    alert("✅ "+res.qtd+" enviados! A2:J limpo e coluna H com LINK.");
    document.getElementById('btnEnviar').style.display='none';
  }else{
    setProgresso(0,'ERRO');
    alert("ERRO: "+(res.err||res.message||JSON.stringify(res)));
  }
}

// --- RESTAURA AUTOMATICO QUANDO VOLTA PRA PAGINA ---
window.addEventListener("DOMContentLoaded", restaurarPersistencia);
setTimeout(restaurarPersistencia, 600);