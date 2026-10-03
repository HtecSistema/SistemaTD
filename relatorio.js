// parte 1
const API_URL = "https://script.google.com/macros/s/AKfycbyD0FNZ0mfON_t7ntAdYdbsxakY1ePeeR-ul5lDt-lX8TxB4hx6xTR1_H9lDSnoxVL2/exec";
if(typeof google === 'undefined' ||!google.script ||!google.script.run){
  window.google = { script: { run: {
    _s:null,_f:null,
    withSuccessHandler:function(cb){this._s=cb; return this;},
    withFailureHandler:function(cb){this._f=cb; return this;},
    limparCache:function(){var s=this; fetch(API_URL+"?action=limparCache&t="+Date.now()).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(e=>s._f&&s._f(e));},
    getProgressoAtual:function(){var s=this; fetch(API_URL+"?action=getProgressoAtual&t="+Date.now()).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(()=>s._s&&s._s({pct:"100",etapa:"Fim"}));},
    getQtdPorAmbito:function(){var s=this; fetch(API_URL+"?action=getQtdPorAmbito&t="+Date.now()).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(()=>s._s&&s._s({c1:0,c2:0,c3:0,c4:0,total:0}));},
    getDadosFiltrados:function(a,b,c){var s=this; fetch(API_URL+"?action=getDadosFiltrados&fCong="+encodeURIComponent(a||"")+"&fNome="+encodeURIComponent(b||"")+"&fMat="+encodeURIComponent(c||"")+"&t="+Date.now()).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(e=>s._f&&s._f(e));},
    getDetalheAluno:function(m){var s=this; fetch(API_URL+"?action=getDetalheAluno&mat="+encodeURIComponent(m||"")+"&t="+Date.now()).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(e=>s._f&&s._f(e));},
    getListaIgrejas:function(){var s=this; fetch(API_URL+"?action=getListaIgrejas&t="+Date.now()).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(e=>s._f&&s._f(e));},
    listarAcessosPendentes:function(){var s=this; fetch(API_URL+"?action=listarAcessosPendentes&t="+Date.now()).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(e=>s._f&&s._f(e));},
    checkAcessoGeral:function(n,sn){var s=this; fetch(API_URL+"?action=checkAcessoGeral&nome="+encodeURIComponent(n||"")+"&senha="+encodeURIComponent(sn||"")+"&t="+Date.now()).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(e=>s._f&&s._f(e));},
    cadastrarUsuario:function(dados){var s=this; fetch(API_URL+"?action=cadastrarUsuario",{method:"POST",body:JSON.stringify(dados)}).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(e=>s._f&&s._f(e));},
    gerarCertificadoWordDrive:function(m){var s=this; fetch(API_URL+"?action=gerarCertificadoWordDrive&mat="+encodeURIComponent(m||"")+"&t="+Date.now()).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(e=>s._f&&s._f(e));}
  }}};
}
window.CACHE_DETALHES = window.CACHE_DETALHES || {};
var TOTAL=[]; var ATUAL=[]; var SELECIONADO=null; var DETALHE=null; var idxSelecionado=-1;
var LIBERADO=false; var USUARIO_NOME="";
var CACHE_EDICAO=[]; var LINHA_EDICAO_ATUAL=null;
var LISTA_IGREJAS_CACHE=[]; var LISTA_ACESSO_CACHE=[];
var idxIgrejaSel=-1; var idxAcessoSel=-1;

function semAcentoJS(s){return (s||"").toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim().toUpperCase();}


function ensureHtml2pdf(cb){
  if(typeof html2pdf!== 'undefined'){ cb(); return; }
  var s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js';
  s.onload=function(){ setTimeout(cb, 500); };
  s.onerror=function(){
    var s2=document.createElement('script');
    s2.src='https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    s2.onload=function(){ setTimeout(cb, 500); };
    s2.onerror=function(){
      var s3=document.createElement('script');
      s3.src='https://unpkg.com/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js';
      s3.onload=function(){ setTimeout(cb, 500); };
      document.head.appendChild(s3);
    };
    document.head.appendChild(s2);
  };
  document.head.appendChild(s);
}


function salvarCacheB(lista){ try{ localStorage.setItem('cache_dusuario_b', JSON.stringify({t:Date.now(), lista})) }catch(e){} }
function carregarCacheB(){
  try{
    const c = JSON.parse(localStorage.getItem('cache_dusuario_b')||'null');
    if(c && c.lista && c.lista.length>0){ LISTA_ACESSO_CACHE = c.lista; return true; }
  }catch(e){}
  return false;
}
carregarCacheB();

function isMasterMat(mat){
  var m = String(mat||"").replace(/\D/g,"").padStart(5,'0');
  return m==="00425" || m==="00001";
}
function isMasterNome(nome){
  var n = semAcentoJS(nome||"");
  return n.indexOf("HELIO SOUZA SILVA")!==-1 || n.indexOf("ELIEZER MIRANDA BARBOSA")!==-1;
}

function travarPosMenu(matricula){
  var matFinal = String(matricula || localStorage.getItem('mat_logada') || localStorage.getItem('rel_mat') || "").replace(/\D/g,"").padStart(5,'0');
  var nomeFinal = USUARIO_NOME || localStorage.getItem('nome_logado') || "";
  var tipo = document.getElementById('tipoPesquisa'); if(tipo) tipo.value='CERTIFICACOES';
  var matH = document.getElementById('inputMatricula'); if(matH) matH.value=matFinal;
  var fNome = document.getElementById('fNome');
  var fMat = document.getElementById('fMatr');
  if(isMasterMat(matFinal) || isMasterNome(nomeFinal)){
    if(fNome){ fNome.disabled=false; fNome.readOnly=false; fNome.style.backgroundColor=''; fNome.style.opacity='1'; fNome.style.pointerEvents='auto'; }
    if(fMat){ fMat.disabled=false; fMat.readOnly=false; fMat.style.backgroundColor=''; fMat.style.opacity='1'; fMat.style.pointerEvents='auto'; }
    return;
  }
  if(fNome){
    if(nomeFinal) fNome.value = nomeFinal;
    fNome.readOnly = true; fNome.disabled = true;
    fNome.style.backgroundColor='#e5e7eb'; fNome.style.opacity='0.6'; fNome.style.pointerEvents='none';
  }
  if(fMat){
    if(matFinal) fMat.value = matFinal;
    fMat.readOnly = true; fMat.disabled = true;
    fMat.style.backgroundColor='#e5e7eb'; fMat.style.opacity='0.6'; fMat.style.pointerEvents='none';
  }
  var msgA = document.getElementById('msgAcesso');
  if(msgA){ msgA.style.color='#7c3aed'; msgA.innerText='🔒 Logado - Mat: '+matFinal+' | Filtros travados'; }
}

function destravarAposLogin(matricula){
  var matFinal = String(matricula || localStorage.getItem('mat_logada') || "").replace(/\D/g,"").padStart(5,'0');
  var nomeFinal = USUARIO_NOME || localStorage.getItem('nome_logado') || "";
  var fNome = document.getElementById('fNome');
  var fMat = document.getElementById('fMatr');
  if(isMasterMat(matFinal) || isMasterNome(nomeFinal)){
    if(fNome){ fNome.value=''; fNome.disabled=false; fNome.readOnly=false; fNome.style.backgroundColor=''; fNome.style.pointerEvents='auto'; fNome.style.opacity='1'; }
    if(fMat){ fMat.value=''; fMat.disabled=false; fMat.readOnly=false; fMat.style.backgroundColor=''; fMat.style.pointerEvents='auto'; fMat.style.opacity='1'; }
    ['buscar','fCong'].forEach(id=>{
      const el=document.getElementById(id); if(el){ el.disabled=false; el.style.opacity='1'; }
    });
    var msgA=document.getElementById('msgAcesso');
    if(msgA){ msgA.style.color='#198754'; msgA.innerText='✅ MASTER '+nomeFinal+' - Filtros liberados e limpaveis'; }
  }else{
    travarPosMenu(matFinal);
  }
  document.querySelectorAll('button').forEach(b=>{
    if((b.innerText||'').toUpperCase().includes('PESQUISAR')){ b.disabled=false; b.style.opacity='1'; }
  });
}

function entrarAcessoGeral(){
  var nome=document.getElementById('acessoNome').value.trim().toUpperCase();
  var senha=document.getElementById('acessoSenha').value.trim().toUpperCase();
  var msg=document.getElementById('msgAcesso');
  if(!nome ||!senha){ msg.style.color="#c00"; msg.innerText="Informe nome e senha"; return; }
  if(LISTA_ACESSO_CACHE.length==0){
    msg.style.color="#0d6efd"; msg.innerText="Carregando lista da coluna B...";
    carregarListaAcessoNomes();
    setTimeout(entrarAcessoGeral, 1000);
    return;
  }
  var usuario = LISTA_ACESSO_CACHE.find(u => semAcentoJS(u.nome||u.NomeUsuario||u.B||'') === semAcentoJS(nome));
  if(!usuario){ msg.style.color="#c00"; msg.innerText="❌ Nome não encontrado na coluna B"; return; }
  var senhaBanco = String(usuario.senha||'').toUpperCase().trim();
  if(senhaBanco!== senha){ msg.style.color="#c00"; msg.innerText="❌ Senha não compatível"; return; }
  LIBERADO=true; USUARIO_NOME=usuario.nome||usuario.NomeUsuario||usuario.B||'';
  localStorage.setItem('mat_logada', usuario.matricula||usuario.Matricula||'');
  localStorage.setItem('nome_logado', USUARIO_NOME);
  var inp=document.getElementById('inputMatricula'); if(inp) inp.value=usuario.matricula||usuario.Matricula||'';
  if(isMasterMat(usuario.matricula||usuario.Matricula||'') || isMasterNome(USUARIO_NOME)){
    msg.style.color="#198754"; msg.innerText="✅ Liberado "+USUARIO_NOME+" - Master";
    destravarAposLogin(usuario.matricula||usuario.Matricula||'');
  } else {
    msg.style.color="#7c3aed"; msg.innerText="🔒 Logado "+USUARIO_NOME+" - continua travado";
    travarPosMenu(usuario.matricula||usuario.Matricula||'');
  }
}

// ===== BUSCA COLUNA B - SO MOSTRA QUANDO DIGITA =====
function carregarListaAcessoNomes(){
  if(LISTA_ACESSO_CACHE.length>0){ return; }
  google.script.run.withSuccessHandler(function(lista){
    LISTA_ACESSO_CACHE=lista; salvarCacheB(lista);
  }).listarAcessosPendentes();
}

function renderDropdownAcessoNomes(lista){
  var drop=document.getElementById('dropdownAcessoNome'); if(!drop) return;
  drop.innerHTML='';
  var termo = (document.getElementById('acessoNome').value||'').trim();
  if(!termo){ drop.style.display='none'; return; }
  if(!lista || lista.length==0){ drop.style.display='none'; return; }
  lista.slice(0,50).forEach(function(a){
    var nome=(a.nome||a.NomeUsuario||a.B||"").toString().trim(); if(!nome) return;
    var st=(a.status||a.Status||"APROVADO").toUpperCase(); var cor=st=="APROVADO"?"#198754":"#dc3545";
    var mat=(a.matricula||a.Matricula||a.D||"").toString();
    var div=document.createElement('div'); div.className='dropdown-item';
    div.innerHTML='<b>'+nome+'</b><small style="color:'+cor+'">Mat: '+mat+' - '+st+'</small>';
    div.onclick=function(){ selecionarAcessoNome(nome); };
    drop.appendChild(div);
  });
  drop.style.display='block'; idxAcessoSel=-1;
}

function mostrarAcessoNomes(){
  var input = document.getElementById('acessoNome');
  var termo = (input.value||'').trim();
  if(!termo){ var drop=document.getElementById('dropdownAcessoNome'); if(drop){ drop.style.display='none'; drop.innerHTML=''; } return; }
  if(LISTA_ACESSO_CACHE.length==0){ if(!carregarCacheB()){ carregarListaAcessoNomes(); return; } }
  var termoSem = semAcentoJS(termo);
  var lista=LISTA_ACESSO_CACHE.filter(function(a){ var n=a.nome||a.NomeUsuario||a.B||""; return semAcentoJS(n).indexOf(termoSem)!=-1; });
  renderDropdownAcessoNomes(lista);
}

function filtrarAcessoNome(){
  mostrarAcessoNomes();
}

function esconderAcessoNomes(){ var drop=document.getElementById('dropdownAcessoNome'); if(drop) drop.style.display='none'; }
function selecionarAcessoNome(nome){ document.getElementById('acessoNome').value=nome; esconderAcessoNomes(); document.getElementById('acessoSenha').focus(); }
function navegarAcessoNome(e){var drop=document.getElementById('dropdownAcessoNome'); var itens=drop?drop.querySelectorAll('.dropdown-item'):[]; if(!itens.length) return; if(e.key==='ArrowDown'){ e.preventDefault(); idxAcessoSel=Math.min(idxAcessoSel+1, itens.length-1); atualizarSelecaoAcesso(itens); } else if(e.key==='ArrowUp'){ e.preventDefault(); idxAcessoSel=Math.max(idxAcessoSel-1, 0); atualizarSelecaoAcesso(itens); } else if(e.key==='Enter'){ e.preventDefault(); if(idxAcessoSel>=0 && itens[idxAcessoSel]) itens[idxAcessoSel].click(); } else if(e.key==='Escape'){ esconderAcessoNomes(); }}
function atualizarSelecaoAcesso(itens){ itens.forEach(function(it){ it.classList.remove('selecionado'); }); if(idxAcessoSel>=0 && itens[idxAcessoSel]){ itens[idxAcessoSel].classList.add('selecionado'); itens[idxAcessoSel].scrollIntoView({block:'nearest'}); } }

window.addEventListener('message', function(e){
  if(e.data && e.data.tipo==='LOGIN_DADOS'){
    const mat = e.data.matricula||'';
    const nome = e.data.nome||'';
    if(mat){ localStorage.setItem('mat_logada', mat); }
    if(nome){ localStorage.setItem('nome_logado', nome); USUARIO_NOME=nome; }
    if(mat){ travarPosMenu(mat); }
  }
});

document.addEventListener('DOMContentLoaded', function(){
  carregarListaAcessoNomes();
  const matLogada = localStorage.getItem('mat_logada') || localStorage.getItem('rel_mat') || "";
  const nomeLogado = localStorage.getItem('nome_logado') || "";
  if(matLogada){
    USUARIO_NOME = nomeLogado || USUARIO_NOME;
    if(isMasterMat(matLogada) || isMasterNome(nomeLogado)){
      setTimeout(function(){ mudarTipo(); }, 300);
    }else{
      setTimeout(()=>travarPosMenu(matLogada), 300);
      setTimeout(()=>travarPosMenu(matLogada), 1000);
      setTimeout(()=>travarPosMenu(matLogada), 2000);
    }
  }else{
    setTimeout(function(){ mudarTipo(); }, 500);
  }
  // UNICO LISTENER - SO DIGITANDO ABRE, FOCUS NAO ABRE
  var inp = document.getElementById('acessoNome');
  if(inp){
    inp.addEventListener('input', filtrarAcessoNome);
    inp.addEventListener('keyup', navegarAcessoNome);
    inp.addEventListener('blur', function(){ setTimeout(esconderAcessoNomes, 200); });
  }
});

setTimeout(function(){
  window.limparOriginal = window.limpar;
  window.limpar = function(){
    var matSalva = localStorage.getItem('mat_logada') || "";
    var nomeSalvo = localStorage.getItem('nome_logado') || "";
    var ehMaster = isMasterMat(matSalva) || isMasterNome(nomeSalvo);
    document.getElementById('acessoNome').value='';
    document.getElementById('acessoSenha').value='';
    document.getElementById('buscar').value='';
    document.getElementById('fCong').value='';
    var fNome=document.getElementById('fNome');
    var fMat=document.getElementById('fMatr');
    if(ehMaster){
      if(fNome){ fNome.value=''; fNome.disabled=false; fNome.readOnly=false; fNome.style.backgroundColor=''; fNome.style.pointerEvents='auto'; fNome.style.opacity='1'; }
      if(fMat){ fMat.value=''; fMat.disabled=false; fMat.readOnly=false; fMat.style.backgroundColor=''; fMat.style.pointerEvents='auto'; fMat.style.opacity='1'; }
    } else {
      if(matSalva) travarPosMenu(matSalva);
    }
    document.querySelector('#tab thead').innerHTML='';
    document.querySelector('#tab tbody').innerHTML='';
    document.getElementById('tabWrap').style.display='none';
    document.getElementById('acoes-extra').style.display='none';
    document.getElementById('boletim').style.display='none';
    document.getElementById('boletim').innerHTML='';
    var drop=document.getElementById('dropdownAcessoNome');
    if(drop){ drop.style.display='none'; drop.innerHTML=''; }
    TOTAL=[]; ATUAL=[]; window.TOTAL_ORIGINAL=[]; window.CACHE_DETALHES={};
    SELECIONADO=null; DETALHE=null; idxSelecionado=-1; CACHE_EDICAO=[];
    if(ehMaster){
      document.getElementById('msg').innerText='Tudo limpo - Master pode digitar';
      document.getElementById('msgAcesso').innerText='Master - filtros livres';
    } else {
      document.getElementById('msg').innerText='Tudo limpo - filtros mantidos travados: '+matSalva;
      document.getElementById('msgAcesso').innerText='🔒 Mat: '+matSalva+' mantida travada';
    }
  };
}, 1000);


// parte 2
document.getElementById('tabWrap').addEventListener('keydown', function(e){
  if(!ATUAL.length || ATUAL.length<2) return;
  if(document.activeElement && document.activeElement.tagName==='INPUT' && document.activeElement.id!=='tabWrap'){ if(e.key==='ArrowDown' || e.key==='ArrowUp') return; }
  if(e.key==='ArrowDown'){ e.preventDefault(); var novoIdx=idxSelecionado+1; if(novoIdx<1) novoIdx=1; if(novoIdx>=ATUAL.length) novoIdx=ATUAL.length-1; selecionar(novoIdx); }
  else if(e.key==='ArrowUp'){ e.preventDefault(); var novoIdx=idxSelecionado-1; if(novoIdx<1) novoIdx=1; selecionar(novoIdx); }
});
function selecionar(idx){
  if(idx<1 || idx>=ATUAL.length) return;
  var row=ATUAL[idx]; idxSelecionado=idx;
  document.querySelectorAll('#tab tbody tr').forEach(function(tr){tr.classList.remove('selecionado');});
  var el=document.getElementById('row-'+idx); if(el){ el.classList.add('selecionado'); el.scrollIntoView({block:'nearest'}); }
  var qtd=parseInt(row[5]||0);
  var mat = (row[4]||'').toString().trim();
  var nome = (row[2]||'').toString().trim();
  SELECIONADO={cong:row[1], nome:nome, mat:mat, zap:row[3], qtd:qtd, row:row};
  window.ultimoPedidoMat=mat||nome;
  window.ultimoPedidoNome=nome;
  var detalhesJson = row[17]||row[16+1]||'';
  if(!detalhesJson && row.length>17) detalhesJson = row[row.length-1];
  if(detalhesJson && typeof detalhesJson==='string' && detalhesJson.indexOf('{')!=-1){
    try{
      var parsed = JSON.parse(detalhesJson);
      DETALHE = {
        cong: row[1], congOrig: row[1], nome: nome, mat: mat, zap: row[3],
        c1: parsed.c1||{}, c2: parsed.c2||{}, c3: parsed.c3||{}, c4: parsed.c4||{},
        r1: parsed.r1||{media:0,nas:0,qtd:parseInt(row[6]||0),soma:0, perc:0},
        r2: parsed.r2||{media:0,nas:0,qtd:parseInt(row[8]||0),soma:0, perc:0},
        r3: parsed.r3||{media:0,nas:0,qtd:parseInt(row[10]||0),soma:0, perc:0},
        r4: parsed.r4||{media:0,nas:0,qtd:parseInt(row[12]||0),soma:0, perc:0},
        totalFeitos: parsed.totalFeitos!=undefined? parsed.totalFeitos : qtd,
        totalPend: parsed.totalPend!=undefined? parsed.totalPend : (52-qtd),
        mediaGeral: parsed.mediaGeral||0,
        totalNA: parsed.totalNA||0,
        totalSoma: parsed.totalSoma||0,
        reprov: parsed.reprov||[],
        status: parsed.status||row[15]||'',
        daPlanilha: true
      };
      document.getElementById('msg').innerText='✅ REAL DA PLANILHA - Selecionado: '+nome+' | Mat: '+mat+' | Média: '+DETALHE.mediaGeral.toFixed(2)+' | Feitos: '+DETALHE.totalFeitos+'/52 | NA: '+DETALHE.totalNA+' | '+DETALHE.status+' | Clique em BOLETIM';
      document.getElementById('acoes-extra').style.display='flex';
      document.getElementById('boletim').style.display='none';
      try{ var bBol=document.getElementById('btnBoletim'); if(bBol){ bBol.disabled=false; bBol.innerText='📄 BOLETIM'; } var bCert=document.getElementById('btnCertificado'); if(bCert){ bCert.disabled=false; bCert.innerText='🎓 CERTIFICADO'; } var bWord=document.getElementById('btnWordDrive'); if(bWord){ bWord.disabled=true; } }catch(e){}
      if(!window.CACHE_DETALHES) window.CACHE_DETALHES={};
      window.CACHE_DETALHES[mat]=DETALHE;
      window.CACHE_DETALHES[nome]=DETALHE;
      return;
    }catch(eJson){ console.log('Erro parse JSON', eJson, detalhesJson.substring(0,200)); }
  }
  if(window.CACHE_DETALHES && (window.CACHE_DETALHES[mat] || window.CACHE_DETALHES[nome])){
    DETALHE = window.CACHE_DETALHES[mat] || window.CACHE_DETALHES[nome];
    document.getElementById('msg').innerText='✅ CACHE - Selecionado: '+DETALHE.nome+' | Mat: '+DETALHE.mat+' | Média: '+DETALHE.mediaGeral.toFixed(2)+' | Feitos: '+DETALHE.totalFeitos+'/52 | NA: '+DETALHE.totalNA+' | '+DETALHE.status;
    document.getElementById('acoes-extra').style.display='flex';
    document.getElementById('boletim').style.display='none';
    try{ var bBol=document.getElementById('btnBoletim'); if(bBol){ bBol.disabled=false; } var bCert=document.getElementById('btnCertificado'); if(bCert){ bCert.disabled=false; } }catch(e){}
    return;
  }
  DETALHE=null;
  document.getElementById('msg').innerText='⚠ Clique em PESQUISAR para carregar 100% da planilha - sem dados reais ainda';
  document.getElementById('acoes-extra').style.display='none';
}

function limpar(){ 
  var tipo = document.getElementById('tipoPesquisa')?.value || '';
  var manterMat = (tipo === 'CERTIFICACOES');
  var matSalva = document.getElementById('inputMatricula').value;

  // limpa só a tela
  document.getElementById('acessoNome').value='';
  document.getElementById('acessoSenha').value='';
  
  if(!manterMat){
    document.getElementById('inputMatricula').value='';
    localStorage.removeItem('mat_logada');
    localStorage.removeItem('rel_mat');
  }
  
  document.getElementById('msgAcesso').innerText='Tudo limpo - Entrar de novo.';
  
  document.getElementById('buscar').value=''; 
  document.getElementById('fCong').value=''; 
  document.getElementById('fNome').value=''; 
  document.getElementById('fMatr').value=''; 

  document.querySelector('#tab thead').innerHTML=''; 
  document.querySelector('#tab tbody').innerHTML=''; 
  document.getElementById('tabWrap').style.display='none'; 
  document.getElementById('acoes-extra').style.display='none'; 
  document.getElementById('boletim').style.display='none'; 
  document.getElementById('boletim').innerHTML=''; 

  var drop=document.getElementById('dropdownAcessoNome');
  if(drop){ drop.style.display='none'; drop.innerHTML=''; }

  LIBERADO=false;
  USUARIO_NOME="";

  TOTAL=[]; ATUAL=[]; window.TOTAL_ORIGINAL=[]; window.CACHE_DETALHES={};
  SELECIONADO=null; DETALHE=null; idxSelecionado=-1; CACHE_EDICAO=[];

  carregarCacheB();
  
  // se for Certificações, devolve a matrícula
  if(manterMat){
    document.getElementById('inputMatricula').value = matSalva;
  }

  document.getElementById('msg').innerText='Tudo limpo';
}

function exportarExcel(){ var dados=ATUAL; if(!dados||dados.length<2){alert('Pesquise primeiro'); return;} var csv=dados.map(function(r){return r.join(';');}).join('\n'); var blob=new Blob([csv],{type:'text/csv'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='RELATORIO.csv'; a.click(); }
function gerarBoletim(){
  if(!SELECIONADO){ alert("Clique em um nome na lista primeiro"); return; }
  if(!DETALHE){ alert("Clique na lista primeiro - os dados reais da planilha vêm no clique da lista (cache). Clique em PESQUISAR antes."); return; }
  if(DETALHE.mat!= SELECIONADO.mat && DETALHE.nome!= SELECIONADO.nome){
    var mat = SELECIONADO.mat;
    if(window.CACHE_DETALHES && window.CACHE_DETALHES[mat]){ DETALHE = window.CACHE_DETALHES[mat]; }
  }
  var a=DETALHE;
  var ano = new Date().getFullYear();
  var totalFeitosReal = parseInt(a.totalFeitos||0);
  var totalNAReal = parseInt(a.totalNA||0);
  var mediaReal = parseFloat(a.mediaGeral||0);
  var statusReal = (a.status||'').toString().toUpperCase();
  var ehAprovado = statusReal.indexOf('APROVADO')!=-1;
  var bloqueado = false;
  if(!ehAprovado){ if(totalNAReal>0) bloqueado=true; else if(totalFeitosReal<52) bloqueado=true; else if(mediaReal>0 && mediaReal<70) bloqueado=true; }
  if(totalNAReal==0 && totalFeitosReal>=52 && mediaReal>=70) bloqueado=false;
  function formatNota(n){ if(n===undefined) return {nota:'', obs:''}; if(n<70) return {nota:n, obs:'<span style="color:#c00; font-weight:900">NA</span>'}; return {nota:n, obs:''}; }
  var AZUL_CLARINHO = '#8ab4f8';
  var html='<div id="boletimPrint" style="background:#fff; padding:0; font-family:Arial, sans-serif; font-size:11px; color:#000; border:1px solid #000">'
  +'<div style="display:flex; align-items:center; gap:10px; padding:8px 10px; border-bottom:1px solid #000">'
  +'<img src="https://i.ibb.co/7hxL8x1/802853790-2155322575864895-5004929784006915147-n.png" style="width:70px; height:50px; object-fit:contain">'
  +'<div style="text-align:left; line-height:1.15"><b style="font-size:11px">IEADMI Igreja Evangélica Assembleia de Deus Missões</b><br><span style="font-size:14px; font-weight:900">Curso <i>Discipulado</i></span><br><span style="font-size:10px">Pr. Eliezer Miranda Barbosa – Presidente</span></div></div>'
  +'<div style="background:'+AZUL_CLARINHO+'; color:#000; font-weight:900; padding:6px; font-size:13px; text-align:center; letter-spacing:0.5px">BOLETIM DO ALUNO</div>'
  +'<div style="padding:10px">'
  +'<div style="display:flex; justify-content:space-between; font-size:11px; margin-top:6px"><div><b>Congregação:</b> '+(a.congOrig||a.cong||'')+'</div><div><b>Ano Curso:</b> '+ano+'</div></div>'
  +'<div style="display:flex; justify-content:space-between; font-size:11px; margin-top:2px"><div><b>Nome:</b> '+a.nome+'</div><div><b>Matrícula:</b> '+a.mat+'</div></div>';
  var calcPerc = function(total, qtd){ if(!qtd || qtd==0) return '0%'; return Math.round((total / (qtd*100) * 100))+'%'; };
  var perc1 = calcPerc(a.r1?a.r1.soma:0, a.r1?a.r1.qtd:0); var perc2 = calcPerc(a.r2?a.r2.soma:0, a.r2?a.r2.qtd:0); var perc3 = calcPerc(a.r3?a.r3.soma:0, a.r3?a.r3.qtd:0); var perc4 = calcPerc(a.r4?a.r4.soma:0, a.r4?a.r4.qtd:0);
  html+='<table style="width:100%; border-collapse:collapse; margin-top:8px; font-size:10px" border="1">'
  +'<tr style="background:'+AZUL_CLARINHO+'; color:#000; font-weight:900"><th style="text-align:left; padding:4px; background:'+AZUL_CLARINHO+'; color:#000">Ciclos Temas</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Média</th><th style="background:'+AZUL_CLARINHO+'; color:#000">NA</th><th style="background:'+AZUL_CLARINHO+'; color:#000">%</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Media Geral</th></tr>'
  +'<tr><td style="padding:4px; background:#fff">Ciclo 01: Conhecendo Jesus e o seu Reino</td><td style="text-align:center; background:#fff">'+(a.r1?a.r1.media.toFixed(2):'')+'</td><td style="text-align:center; background:#fff">'+(a.r1?a.r1.nas:0)+'</td><td style="text-align:center; background:#fff">'+perc1+'</td><td rowspan="4" style="text-align:center; font-weight:900; font-size:14px; vertical-align:middle; background:#fff">'+a.mediaGeral.toFixed(2)+'</td></tr>'
  +'<tr><td style="padding:4px; background:#fff">Ciclo 02: Conhecendo as Doutrinas Cristã</td><td style="text-align:center; background:#fff">'+(a.r2?a.r2.media.toFixed(2):'')+'</td><td style="text-align:center; background:#fff">'+(a.r2?a.r2.nas:0)+'</td><td style="text-align:center; background:#fff">'+perc2+'</td></tr>'
  +'<tr><td style="padding:4px; background:#fff">Ciclo 03: Vivendo as Verdades Bíblicas</td><td style="text-align:center; background:#fff">'+(a.r3?a.r3.media.toFixed(2):'')+'</td><td style="text-align:center; background:#fff">'+(a.r3?a.r3.nas:0)+'</td><td style="text-align:center; background:#fff">'+perc3+'</td></tr>'
  +'<tr><td style="padding:4px; background:#fff">Ciclo 04: Portando uma Nova Identidade</td><td style="text-align:center; background:#fff">'+(a.r4?a.r4.media.toFixed(2):'')+'</td><td style="text-align:center; background:#fff">'+(a.r4?a.r4.nas:0)+'</td><td style="text-align:center; background:#fff">'+perc4+'</td></tr>'
  +'</table>';
  html+='<table style="width:100%; border-collapse:collapse; margin-top:8px; font-size:9px" border="1">'
  +'<tr style="background:'+AZUL_CLARINHO+'; color:#000; font-weight:900"><th style="background:'+AZUL_CLARINHO+'; color:#000">Item</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Ciclo 01</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Nota</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Obs</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Ciclo 02</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Nota</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Obs</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Ciclo 03</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Nota</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Obs</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Ciclo 04</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Nota</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Obs</th></tr>';
  var totalC1=0, totalC2=0, totalC3=0, totalC4=0;
  for(var i=1;i<=13;i++){
    var n1 = a.c1[i]; var n2 = a.c2[i]; var n3 = a.c3[i]; var n4 = a.c4[i];
    if(n1!==undefined) totalC1+=parseFloat(n1); if(n2!==undefined) totalC2+=parseFloat(n2); if(n3!==undefined) totalC3+=parseFloat(n3); if(n4!==undefined) totalC4+=parseFloat(n4);
    var f1 = formatNota(n1); var f2 = formatNota(n2); var f3 = formatNota(n3); var f4 = formatNota(n4);
    var bg1 = (n1!==undefined && n1<70)?' style="background:#ffcccc"':''; var bg2 = (n2!==undefined && n2<70)?' style="background:#ffcccc"':''; var bg3 = (n3!==undefined && n3<70)?' style="background:#ffcccc"':''; var bg4 = (n4!==undefined && n4<70)?' style="background:#ffcccc"':'';
    html+='<tr><td style="text-align:center; background:#fff">'+(i<10?'0'+i:i)+'</td>'
    +'<td style="background:#fff">Teste '+(i<10?'0'+i:i)+'</td><td'+bg1+' style="text-align:center; background:#fff">'+(f1.nota!==''?f1.nota:'')+'</td><td style="text-align:center; background:#fff">'+f1.obs+'</td>'
    +'<td style="background:#fff">Teste '+(i<10?'0'+i:i)+'</td><td'+bg2+' style="text-align:center; background:#fff">'+(f2.nota!==''?f2.nota:'')+'</td><td style="text-align:center; background:#fff">'+f2.obs+'</td>'
    +'<td style="background:#fff">Teste '+(i<10?'0'+i:i)+'</td><td'+bg3+' style="text-align:center; background:#fff">'+(f3.nota!==''?f3.nota:'')+'</td><td style="text-align:center; background:#fff">'+f3.obs+'</td>'
    +'<td style="background:#fff">Teste '+(i<10?'0'+i:i)+'</td><td'+bg4+' style="text-align:center; background:#fff">'+(f4.nota!==''?f4.nota:'')+'</td><td style="text-align:center; background:#fff">'+f4.obs+'</td>'
    +'</tr>';
  }
  html+='<tr style="background:'+AZUL_CLARINHO+'; font-weight:900; color:#000"><td colspan="2" style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000">Total Pontos</td><td style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000">'+totalC1+'</td><td style="background:'+AZUL_CLARINHO+'"></td><td style="background:'+AZUL_CLARINHO+'"></td><td style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000">'+totalC2+'</td><td style="background:'+AZUL_CLARINHO+'"></td><td style="background:'+AZUL_CLARINHO+'"></td><td style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000">'+totalC3+'</td><td style="background:'+AZUL_CLARINHO+'"></td><td style="background:'+AZUL_CLARINHO+'"></td><td style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000">'+totalC4+'</td><td style="background:'+AZUL_CLARINHO+'"></td></tr></table>';
  html+='<div style="font-size:8px; margin-top:4px"><b>Legenda:</b> NA -> Nota não atingida | Total: '+a.totalFeitos+'/52 | Pend: '+a.totalPend+' | 100% REAL</div>';
  if(bloqueado){
    html+='<div style="margin-top:8px; background:#f8d7da; color:#721c24; padding:8px; border:1px solid #f5c6cb; text-align:center; font-weight:900">⛔ PENDENTE - '+(a.totalNA>0? a.totalNA+' nota(s) <70 (NA)' : a.totalFeitos<52? 'Faltam '+(52-a.totalFeitos)+' testes' : 'Média <70')+' - NÃO PODE IMPRIMIR CERTIFICADO</div>';
  } else {
    html+='<div style="margin-top:8px; background:#d4edda; color:#155724; padding:8px; border:1px solid #c3e6cb; text-align:center; font-weight:900">✅ APROVADO - Pode imprimir Certificado e Boletim - Média '+a.mediaGeral.toFixed(2)+' - 100% REAL</div>';
  }
  html+='</div></div>';
  html+='<div class="no-print" data-html2canvas-ignore="true" style="margin-top:10px; display:flex; gap:8px; flex-wrap:nowrap">'
  +'<button onclick="window.print()" style="flex:1; min-width:0; height:44px; background:#0d6efd; color:#fff; border:0; border-radius:8px; font-weight:900; font-size:10px">🖨 IMPRIMIR</button>'
  +'<button onclick="enviarPdfZap()" style="flex:1; min-width:0; height:44px; background:#25D366; color:#fff; border:0; border-radius:8px; font-weight:900; font-size:10px">📄 PDF + ZAP</button>'
  +'<button onclick="enviarBoletimZap()" style="flex:1; min-width:0; height:44px; background:#128C7E; color:#fff; border:0; border-radius:8px; font-weight:900; font-size:10px">📱 TEXTO ZAP</button>'
  +'<button onclick="document.getElementById(\'boletim\').style.display=\'none\'" style="flex:1; min-width:0; height:44px; background:#6c757d; color:#fff; border:0; border-radius:8px; font-weight:900; font-size:10px">FECHAR</button>'
  +'</div>';
  document.getElementById('boletim').innerHTML=html;
  document.getElementById('boletim').style.display='block';
  document.getElementById('boletim').scrollIntoView({behavior:'smooth'});
}
function listarPendentesNA(a){
  var lista=[];
  for(var ciclo=1;ciclo<=4;ciclo++){
    var chave='c'+ciclo;
    var obj = a[chave] || {};
    for(var i=1;i<=13;i++){
      var v = obj[i];
      var teste = (i<10?'0'+i:i);
      if(v===undefined || v==='' || v===null){
        lista.push('C'+ciclo+'-Teste '+teste+' - Pendente');
      }else{
        var num=parseFloat(v);
        if(!isNaN(num) && num<70){
          lista.push('C'+ciclo+'-Teste '+teste+' - Nota abaixo de 70 (Nota: '+num+')');
        }
      }
    }
  }
  return lista;
}


function gerarCertificado(){
  if(!SELECIONADO &&!DETALHE){
    var mat = document.getElementById("inputMatricula").value.trim();
    if(mat){ pesquisar(); return; }
    alert("Selecione aluno"); return;
  }
  var a=DETALHE;
  if(a.totalNA>0 || a.totalFeitos<52 || a.mediaGeral<70){
    var motivo = '';
    if(a.totalNA>0) motivo = a.totalNA+' nota(s) abaixo de 70 (NA)';
    else if(a.totalFeitos<52) motivo = 'Faltam '+(52-a.totalFeitos)+' testes';
    else motivo = 'Média '+a.mediaGeral.toFixed(2)+' abaixo de 70';
    var htmlBloq='<div style="background:#fff; padding:20px; border-radius:12px; border:3px solid #dc3545; text-align:center">'
    +'<h2 style="color:#dc3545; margin:0">⛔ CERTIFICADO BLOQUEADO</h2>'
    +'<div style="margin-top:12px"><b>'+a.nome+'</b><br>Mat: '+a.mat+'<br><br>Motivo: <b>'+motivo+'</b><br>Status: '+a.status+'</div>'
    +'<div style="margin-top:12px"><button onclick="gerarBoletim()" style="background:#0d6efd; color:#fff; border:0; border-radius:8px; padding:10px 16px; font-weight:800">VER BOLETIM</button> <button onclick="document.getElementById(\'boletim\').style.display=\'none\'" style="background:#888; color:#fff; border:0; border-radius:8px; padding:10px 16px; font-weight:800">FECHAR</button></div>'
    +'</div>';
    document.getElementById('boletim').innerHTML=htmlBloq;
    document.getElementById('boletim').style.display='block';
    return;
  }
  var meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  var dataHoje = new Date();
  var dataExtenso = 'Paragominas-PA, '+dataHoje.getDate()+' de '+meses[dataHoje.getMonth()]+' de '+dataHoje.getFullYear();
  var html='<div id="certPrint" style="background:#fff; font-family:Arial, sans-serif; border:1px solid #ccc; overflow:hidden">'
  +'<div style="display:flex; justify-content:flex-end; padding:8px 16px">'
  +'<div style="display:flex; align-items:center; gap:8px; text-align:left">'
  +'<img src="https://i.ibb.co/7hxL8x1/802853790-2155322575864895-5004929784006915147-n.png" style="width:40px">'
  +'<div style="line-height:1.1; font-size:8px"><b>IEADMI</b> Igreja Evangélica Assembleia de Deus Missões<br><span style="font-size:11px; font-weight:900; color:#c9a86a">Curso</span> <span style="font-size:13px; font-weight:900; color:#d4b87a">Discipulado</span><br>Pr. Eliezer Miranda Barbosa – Presidente</div>'
  +'</div>'
  +'</div>'
  +'<div style="display:flex; min-height:380px">'
  +'<div style="width:38%; background:#8aa8c8; padding:30px 20px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; position:relative">'
  +'<div style="position:absolute; top:-10px; right:-20px; width:40px; height:100%; background:#8aa8c8; transform:skewX(-10deg); z-index:0"></div>'
  +'<div style="z-index:1">'
  +'<div style="width:110px; height:110px; background:radial-gradient(circle, #e8d5a0 0%, #c9a86a 100%); border-radius:50%; display:flex; align-items:center; justify-content:center; border:3px solid #d4b87a; box-shadow:0 0 0 4px rgba(212,184,122,0.3)"><span style="font-size:50px">🏅</span></div>'
  +'<div style="margin-top:30px; color:#fff; font-size:26px; line-height:1.2; font-weight:300">Conclusão<br>de Curso<br><span style="font-weight:700">Discipulado</span></div>'
  +'</div>'
  +'</div>'
  +'<div style="width:62%; background:#7a8a9e; padding:30px 30px 20px; color:#fff; display:flex; flex-direction:column; justify-content:center; position:relative">'
  +'<div style="font-family:serif; font-size:42px; color:#d4c5a0; font-weight:300; letter-spacing:3px">CERTIFICADO</div>'
  +'<div style="width:100%; height:2px; background:#d4c5a0; margin:12px 0 20px"></div>'
  +'<div style="font-size:11px; line-height:1.6; color:#e8edf2; font-style:italic">'
  +'Declaramos que <b style="color:#fff; font-style:normal; font-size:12px">'+a.nome+'</b>, concluiu com êxito o Curso de Discipulado, realizado nesta instituição, Assembleia de Deus, num período de específico, atingindo a média mínima para a aprovação nos 4 Ciclos definidos. Dessa forma, mui respeitosamente reconhecemos sua dedicação aprovação.'
  +'</div>'
  +'<div style="margin-top:30px; font-size:10px; color:#cbd5df; font-style:italic; text-align:right">'+dataExtenso+'</div>'
  +'</div>'
  +'</div>'
  +'<div style="background:#fff; padding:30px 20px; display:flex; justify-content:flex-end">'
  +'<div style="text-align:center">'
  +'<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA" style="width:180px; height:auto; display:block; margin:0 auto">'
  +'<div style="border-top:1px solid #000; width:200px; margin:2px auto 0; padding-top:4px; font-size:10px; line-height:1.2"><b>Pr. Eliezer Miranda Barbosa</b><br>Pr Presidente</div>'
  +'</div>'
  +'</div>'
  +'<div class="no-print" style="background:#fff; padding:12px; display:flex; gap:8px; justify-content:center; border-top:1px solid #eee"><button onclick="window.print()" style="background:#198754; color:#fff; border:0; border-radius:8px; padding:10px 20px; font-weight:800">🖨 IMPRIMIR CERTIFICADO</button><button onclick="document.getElementById(\'boletim\').style.display=\'none\'" style="background:#888; color:#fff; border:0; border-radius:8px; padding:10px 20px; font-weight:800">FECHAR</button></div>'
  +'</div>';
  document.getElementById('boletim').innerHTML=html;
  document.getElementById('boletim').style.display='block';
}
function gerarWordDrive(){
  if(!DETALHE){
    var mat = document.getElementById('inputMatricula').value.trim() || (SELECIONADO?SELECIONADO.mat:'');
    if(!mat){ alert('Selecione aluno na lista ou digite matrícula e clique PESQUISAR'); return; }
    google.script.run.withSuccessHandler(function(d){ if(!d){ alert('Aluno não encontrado'); return; } DETALHE=d; gerarWordDrive(); }).getDetalheAluno(mat);
    return;
  }
  var mat = DETALHE?DETALHE.mat : (SELECIONADO?SELECIONADO.mat:'');
  if(!mat){ alert('Matrícula não encontrada'); return; }
  if(DETALHE && (DETALHE.totalNA>0 || DETALHE.totalFeitos<52 || DETALHE.mediaGeral<70)){
    alert('⛔ Não pode gerar Word - Aluno Pendente: '+DETALHE.status); return;
  }
  document.getElementById('msg').innerText='Gerando certificado Word no Drive para '+ (DETALHE?DETALHE.nome:mat)+'... aguarde';
  document.getElementById('boletim').innerHTML='<div style="background:#fff; padding:20px; text-align:center; border-radius:10px"><b>⏳ Gerando Word no Drive...</b><br>Salvando em pasta CERTIFICADOS DISCIPULADO</div>';
  document.getElementById('boletim').style.display='block';
  google.script.run.withSuccessHandler(function(r){
    if(!r.ok){ document.getElementById('msg').innerText='Erro: '+r.msg; document.getElementById('boletim').innerHTML='<div style="background:#f8d7da; padding:15px; border-radius:8px; color:#721c24; text-align:center">❌ '+r.msg+'</div>'; return; }
    document.getElementById('msg').innerText='Word gerado: '+r.nome;
    var html='<div style="background:#fff; padding:20px; border-radius:12px; border:2px solid #2b579a; text-align:center">'
    +'<h3 style="color:#2b579a; margin:0">✅ CERTIFICADO WORD CRIADO NO DRIVE</h3>'
    +'<div style="margin-top:10px; font-size:12px"><b>'+r.nome+'</b><br>Mat: '+r.mat+'</div>'
    +'<div style="margin-top:12px; display:flex; flex-direction:column; gap:8px">'
    +'<a href="'+r.urlDocs+'" target="_blank" style="background:#4285f4; color:#fff; padding:10px; border-radius:6px; text-decoration:none; font-weight:800">📄 Abrir Google Docs</a>'
    +(r.urlDocx?'<a href="'+r.urlDocx+'" target="_blank" style="background:#2b579a; color:#fff; padding:10px; border-radius:6px; text-decoration:none; font-weight:800">📝 Abrir Word.docx no Drive</a>':'')
    +(r.pasta?'<a href="'+r.pasta+'" target="_blank" style="background:#555; color:#fff; padding:10px; border-radius:6px; text-decoration:none; font-weight:800">📁 Abrir Pasta CERTIFICADOS</a>':'')
    +'</div>'
    +'<div style="margin-top:10px; font-size:9px; color:#666">Para baixar como Word no computador: Abra o Google Docs > Arquivo > Fazer download > Microsoft Word (.docx)</div>'
    +'<button onclick="document.getElementById(\'boletim\').style.display=\'none\'" style="margin-top:12px; background:#888; color:#fff; border:0; border-radius:6px; padding:8px 16px">FECHAR</button>'
    +'</div>';
    document.getElementById('boletim').innerHTML=html;
    document.getElementById('boletim').scrollIntoView({behavior:'smooth'});
  }).withFailureHandler(function(err){
    document.getElementById('msg').innerText='Erro: '+(err.message||err);
    document.getElementById('boletim').innerHTML='<div style="background:#f8d7da; padding:15px">Erro: '+(err.message||err)+'</div>';
  }).gerarCertificadoWordDrive(mat);
}
function puxarDoCadastro(){
  let p = new URLSearchParams(window.location.search);
  let mat = p.get('matricula') || localStorage.getItem('rel_mat') || "";
  if(!mat) return;
  let sel = document.getElementById('tipoPesquisa');
  if(sel){ sel.value = 'CERTIFICACOES'; mudarTipo(); document.getElementById('boxMatricula').style.display = 'block'; }
  let m1 = document.getElementById('inputMatricula');
  let m2 = document.getElementById('fMatr');
  if(m1) m1.value = mat;
  if(m2) m2.value = mat;
}
window.addEventListener('load', function(){ setTimeout(puxarDoCadastro, 600); });

function carregarIgrejas(){
  google.script.run.withSuccessHandler(function(lista){ LISTA_IGREJAS_CACHE=lista; }).getListaIgrejas();
}
function filtrarIgrejas(){
  var termo=semAcentoJS(document.getElementById('cadIgreja').value);
  var lista=LISTA_IGREJAS_CACHE.filter(function(n){ return!termo || semAcentoJS(n).indexOf(termo)!=-1; });
  renderDropdownIgrejas(lista);
  mostrarIgrejas();
}
function renderDropdownIgrejas(lista){
  var drop=document.getElementById('dropdownIgrejas'); if(!drop) return;
  drop.innerHTML='';
  lista.slice(0,50).forEach(function(nome){
    var div=document.createElement('div'); div.className='dropdown-item'; div.innerHTML='<b>'+nome+'</b>';
    div.onclick=function(){ document.getElementById('cadIgreja').value=nome; esconderIgrejas(); };
    drop.appendChild(div);
  });
}
function mostrarIgrejas(){ var d=document.getElementById('dropdownIgrejas'); if(d) d.style.display='block'; }
function esconderIgrejas(){ var d=document.getElementById('dropdownIgrejas'); if(d) d.style.display='none'; }
function navegarIgrejas(e){
  var drop=document.getElementById('dropdownIgrejas');
  var itens=drop?drop.querySelectorAll('.dropdown-item'):[];
  if(!itens.length) return;
  if(e.key==='ArrowDown'){ e.preventDefault(); idxIgrejaSel=Math.min(idxIgrejaSel+1, itens.length-1); itens.forEach(function(it){it.classList.remove('selecionado');}); if(itens[idxIgrejaSel]){itens[idxIgrejaSel].classList.add('selecionado'); itens[idxIgrejaSel].scrollIntoView({block:'nearest'});} }
  else if(e.key==='ArrowUp'){ e.preventDefault(); idxIgrejaSel=Math.max(idxIgrejaSel-1, 0); itens.forEach(function(it){it.classList.remove('selecionado');}); if(itens[idxIgrejaSel]){itens[idxIgrejaSel].classList.add('selecionado');} }
  else if(e.key==='Enter'){ e.preventDefault(); if(idxIgrejaSel>=0 && itens[idxIgrejaSel]) itens[idxIgrejaSel].click(); }
  else if(e.key==='Escape'){ esconderIgrejas(); }
}
document.addEventListener('click', function(e){
  var w1=document.querySelector('#modalCadastro.dropdown-wrapper');
  var i1=document.getElementById('cadIgreja');
  if(w1 &&!w1.contains(e.target) && e.target!==i1){ esconderIgrejas(); }
  var w2=document.getElementById('dropdownAcessoNome');
  var i2=document.getElementById('acessoNome');
  var wrap2=w2?w2.parentElement:null;
  if(wrap2 &&!wrap2.contains(e.target) && e.target!==i2){ esconderAcessoNomes(); }
});
function abrirCadastro(){
  document.getElementById('modalCadastro').style.display='flex';
  document.getElementById('msgCadastro').innerText='';
  carregarIgrejas();
  LINHA_EDICAO_ATUAL=null;
  var btn=document.getElementById('btnSalvarCadastro'); if(btn){ btn.innerText='Cadastro de administrador'; btn.style.background='#198754'; }
  var boxStatus=document.getElementById('boxStatusCadastro');
  var area=document.getElementById('areaEdicao');
  var igrejaWrapper=document.querySelector('#modalCadastro.dropdown-wrapper');
  var nomeAcesso = (document.getElementById('acessoNome').value||'').toString().trim();
  var senhaAcesso = (document.getElementById('acessoSenha').value||'').toString().trim();
  var nomeAcessoNorm = nomeAcesso.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim();
  var ehHelioMaster = (nomeAcessoNorm === 'HELIO SOUZA SILVA' || nomeAcessoNorm === 'HELIO SOUZA' || nomeAcessoNorm === 'HELIO') && senhaAcesso === 'he282';
  var ehHelioLiberado = LIBERADO && USUARIO_NOME && USUARIO_NOME.toUpperCase().indexOf('HELIO')!=-1;
  if(ehHelioMaster || ehHelioLiberado){
    if(area) area.style.display='block';
    if(boxStatus) boxStatus.style.display='block';
    if(igrejaWrapper) igrejaWrapper.style.flex='1';
    carregarEdicaoCadastro();
  } else {
    if(area) area.style.display='none';
    if(boxStatus) boxStatus.style.display='none';
    if(igrejaWrapper) igrejaWrapper.style.flex='1';
  }
}
function fecharCadastro(){ document.getElementById('modalCadastro').style.display='none'; limparCadastro(); }
function limparCadastro(){
  document.getElementById('cadNomeUsuario').value='';
  document.getElementById('cadCPF').value='';
  document.getElementById('cadSexo').value='';
  document.getElementById('cadIgreja').value='';
  document.getElementById('cadMatricula').value='';
  document.getElementById('cadContato').value='';
  document.getElementById('cadSenha').value='';
  var st=document.getElementById('cadStatus'); if(st) st.value='EM ANALISE';
  LINHA_EDICAO_ATUAL=null;
  var btn=document.getElementById('btnSalvarCadastro'); if(btn){ btn.innerText='Cadastro de administrador'; btn.style.background='#198754'; }
  var msg=document.getElementById('msgCadastro'); if(msg){ msg.innerText='Campos limpos - pronto para novo cadastro'; msg.style.color='#555'; }
}
function fazerCadastroNovo(){
  var msg=document.getElementById('msgCadastro');
  var dados={
    nomeUsuario: document.getElementById('cadNomeUsuario').value.trim(),
    cpf: document.getElementById('cadCPF').value,
    matricula: document.getElementById('cadMatricula').value,
    contato: document.getElementById('cadContato').value,
    sexo: document.getElementById('cadSexo').value,
    igreja: document.getElementById('cadIgreja').value,
    senha: document.getElementById('cadSenha').value,
    status: document.getElementById('cadStatus')? document.getElementById('cadStatus').value : 'EM ANALISE',
    linha: LINHA_EDICAO_ATUAL
  };
  if(dados.nomeUsuario.split(/\s+/).filter(function(w){return w.length>0}).length<3){ msg.style.color="#c00"; msg.innerText="Nome precisa 3 palavras"; return; }
  if(!validarCPFjs(dados.cpf)){ msg.style.color="#c00"; msg.innerText="CPF invalido"; return; }
  var matNum=dados.matricula.replace(/\D/g,''); if(!matNum){ msg.style.color="#c00"; msg.innerText="Matricula 5 numeros"; return; }
  if(dados.contato.replace(/\D/g,'').length!=11){ msg.style.color="#c00"; msg.innerText="Contato 11 digitos"; return; }
  if(!dados.sexo){ msg.style.color="#c00"; msg.innerText="Informe sexo"; return; }
  if(!dados.igreja){ msg.style.color="#c00"; msg.innerText="Informe igreja"; return; }
  if(!dados.senha || dados.senha.length<4){ msg.style.color="#c00"; msg.innerText="Senha min 4"; return; }
  msg.style.color="#0d6efd"; msg.innerText="Salvando...";
  google.script.run.withSuccessHandler(function(r){
    msg.style.color=r.ok?"#198754":"#c00"; msg.innerText=r.msg;
    if(r.ok){ carregarListaAcessoNomes(); carregarEdicaoCadastro(); }
  }).cadastrarUsuario(dados);
}

var CACHE_EDICAO = [];

function carregarEdicaoCadastro(){
  var listaDiv=document.getElementById('listaEdicaoCadastro');
  if(!listaDiv) return;
  listaDiv.innerHTML='<div style="padding:20px; text-align:center;">Carregando...</div>';
  
  // SE SEU HTML ESTÁ FORA DO APPS SCRIPT (com API_URL) USA ISSO:
  fetch(API_URL + "?action=getlistaedicaocadastro")
  .then(r=>r.json())
  .then(lista=>{
    CACHE_EDICAO=lista;
    renderEdicaoCadastro(lista);
  });

  // SE SEU HTML ESTÁ DENTRO DO APPS SCRIPT (Liberacao) USA ISSO:
  // google.script.run.withSuccessHandler(function(lista){
  //   CACHE_EDICAO=lista;
  //   renderEdicaoCadastro(lista);
  // }).listarAcessosPendentes();
}

function renderEdicaoCadastro(lista){
  var div=document.getElementById('listaEdicaoCadastro');
  if(!div) return;
  if(!lista || lista.length==0){ div.innerHTML='<div style="padding:20px; text-align:center; color:#888">Nenhum cadastro</div>'; return; }
  
  var html='<table style="width:100%; border-collapse:collapse; font-size:12px; font-family:Arial; background:#fff; border-radius:8px; overflow:hidden;">';
  html+='<tr style="background:#000; color:#fff; text-align:left;"><th style="padding:12px;">NOME</th><th style="text-align:center;">STATUS</th><th style="text-align:center;">MAT</th><th style="text-align:center;">ACAO</th></tr>';
  
  lista.forEach(function(it){
    var cor=it.status=='APROVADO'?'#16a34a':'#dc2626';
    html+='<tr style="border-bottom:1px solid #eee">';
    html+='<td style="padding:10px; font-weight:700; text-transform:uppercase;">'+it.nome+'</td>';
    html+='<td style="text-align:center;"><span style="background:'+cor+'; color:#fff; padding:4px 10px; border-radius:6px; font-size:10px; font-weight:800;">'+it.status+'</span></td>';
    html+='<td style="text-align:center;">'+it.matricula+'</td>';
    html+='<td style="text-align:center;"><button onclick="editarCadastro(\''+it.matricula+'\')" style="background:#0d6efd; color:#fff; border:0; border-radius:6px; padding:6px 12px; font-size:10px; font-weight:800; cursor:pointer;">EDITAR</button></td>';
    html+='</tr>';
  });
  html+='</table>';
  div.innerHTML=html;
}

function filtrarEdicaoCadastro(){
  var termo=semAcentoJS(document.getElementById('pesqEdicao').value.toUpperCase());
  var lista=CACHE_EDICAO.filter(function(a){ 
    return !termo || semAcentoJS(a.nome).indexOf(termo)!=-1 || String(a.matricula).indexOf(termo)!=-1; 
  });
  renderEdicaoCadastro(lista);
}

function editarCadastro(linha){
  var item=CACHE_EDICAO.find(function(a){return a.linha==linha});
  if(!item) return;
  document.getElementById('cadNomeUsuario').value=item.nome;
  document.getElementById('cadCPF').value=item.cpf||'';
  document.getElementById('cadMatricula').value=item.matricula||'';
  document.getElementById('cadContato').value=item.contato||'';
  document.getElementById('cadSexo').value=item.sexo||'';
  document.getElementById('cadIgreja').value=item.igreja||'';
  document.getElementById('cadSenha').value=item.senha||'';
  var st=document.getElementById('cadStatus'); if(st) st.value=item.status||'EM ANALISE';
  LINHA_EDICAO_ATUAL=linha;
  var btn=document.getElementById('btnSalvarCadastro'); if(btn){ btn.innerText='ATUALIZAR'; btn.style.background='#0d6efd'; }
  document.getElementById('msgCadastro').innerText='Editando linha '+linha;
}
function filtrar(){
  var termo=semAcentoJS(document.getElementById('buscar').value);
  var fCong=semAcentoJS(document.getElementById('fCong').value);
  var fNome=semAcentoJS(document.getElementById('fNome').value);
  var fMat=semAcentoJS(document.getElementById('fMatr').value);
  var matCert=semAcentoJS(document.getElementById('inputMatricula').value);
  var lista = window.TOTAL_ORIGINAL || TOTAL || ATUAL;
  if(!lista || lista.length<2){ lista = ATUAL; if(!lista || lista.length<2) return; }
  var cab=lista[0]; var corpo=lista.slice(1);
  if(termo) corpo=corpo.filter(function(r){ return semAcentoJS(r[1]).indexOf(termo)!=-1; });
  if(fCong) corpo=corpo.filter(function(r){ return semAcentoJS(r[15]||'').indexOf(fCong)!=-1; });
  if(fNome) corpo=corpo.filter(function(r){ return semAcentoJS(r[2]).indexOf(fNome)!=-1; });
  if(fMat) corpo=corpo.filter(function(r){ var mat=semAcentoJS(r[4]); var mat5=("00000"+(r[4]||"").replace(/\D/g,'')).slice(-5); return mat.indexOf(fMat)!=-1 || mat5.indexOf(fMat)!=-1 || semAcentoJS(r[2]).indexOf(fMat)!=-1; });
  if(matCert) corpo=corpo.filter(function(r){ var mat=semAcentoJS(r[4]); var mat5=("00000"+(r[4]||"").replace(/\D/g,'')).slice(-5); return mat.indexOf(matCert)!=-1 || mat5.indexOf(matCert)!=-1 || semAcentoJS(r[2]).indexOf(matCert)!=-1; });
  ATUAL = [cab].concat(corpo); render(ATUAL); document.getElementById('msg').innerText=corpo.length+' Localizados';
}


// parte 3
function pesquisar(){
var fCong=document.getElementById('buscar')?.value||document.getElementById('fCong')?.value||'';
var fNome=document.getElementById('fNome')?.value||'';
var fMat=document.getElementById('fMatr')?.value||'';
  var fCong=document.getElementById('buscar')?.value||document.getElementById('fCong')?.value||'';
  var fNome=document.getElementById('fNome')?.value||'';
  var fMat=document.getElementById('fMatr')?.value||'';
  try{ google.script.run.limparCache(); }catch(e){}

  document.getElementById('msg').innerText='Buscando dados no Ciclo 01 - 0%';
  document.getElementById('progressContainer').style.cssText='width:100%;background:#e0e0e0;height:26px;border-radius:13px;margin-top:8px;overflow:hidden;display:block;';
  document.getElementById('progressBar').style.cssText='height:26px;width:0%;background:#000;border-radius:13px;transition:width 0.4s;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:13px;';
  document.getElementById('progressBar').innerText='0%';

  if(!document.getElementById('labelQtdAmbito')){
    var q=document.createElement('div'); q.id='labelQtdAmbito';
    q.style.cssText='font-size:13px;font-weight:bold;margin-top:8px;display:block;';
    q.innerText='Encontrados | Ciclo 01 - 0 | Ciclo 02 - 0 | Ciclo 03 - 0 | Ciclo 04 - 0 | Total: 0';
    document.getElementById('progressContainer').after(q);
  }
  document.getElementById('labelQtdAmbito').style.display='block';
  document.getElementById('tabWrap').style.display='block';
  document.querySelector('#tab tbody').innerHTML='<tr><td colspan="18" style="text-align:center;">Carregando...</td></tr>';

  // BARRA RETA DE 25 EM 25 IGUAL A FOTO
  var pct=0;
  var intervalo = setInterval(function(){
    if(pct==0) pct=25;
    else if(pct==25) pct=50;
    else if(pct==50) pct=75;
    else if(pct==75) pct=95;
    else if(pct==95) pct=95;

    var ciclo = 1;
    if(pct>=25) ciclo=1;
    if(pct>=50) ciclo=2;
    if(pct>=75) ciclo=3;
    if(pct>=95) ciclo=4;

    document.getElementById('msg').innerText = 'Buscando dados no Ciclo 0'+ciclo+' - '+pct+'%';
    document.getElementById('progressBar').style.width = pct+'%';
    document.getElementById('progressBar').innerText = pct+'%';
  }, 500);

  var url = API_URL+"?action=getDadosFiltrados&fCong="+encodeURIComponent(fCong)+"&fNome="+encodeURIComponent(fNome)+"&fMat="+encodeURIComponent(fMat)+"&t="+Date.now();
  fetch(url).then(r=>r.json()).then(d=>{
    clearInterval(intervalo);
    document.getElementById('msg').innerText='Buscando dados no Ciclo 04 - 100%';
    document.getElementById('progressBar').style.width='100%';
    document.getElementById('progressBar').innerText='100%';

    var total = d.length-1;
    var c1=0,c2=0,c3=0,c4=0;
    for(var i=1;i<d.length;i++){
      if(parseInt(d[i][6]||0)>0) c1++;
      if(parseInt(d[i][8]||0)>0) c2++;
      if(parseInt(d[i][10]||0)>0) c3++;
      if(parseInt(d[i][12]||0)>0) c4++;
    }
    document.getElementById('labelQtdAmbito').innerText = 'Encontrados | Ciclo 01 - '+c1+' | Ciclo 02 - '+c2+' | Ciclo 03 - '+c3+' | Ciclo 04 - '+c4+' | Total: '+total;
    document.getElementById('msg').innerText='Dados 100% Localizados';

    setTimeout(function(){ document.getElementById('progressContainer').style.display='none'; }, 2000);
    setTimeout(function(){
      var el=document.getElementById('labelQtdAmbito');
      if(el){ el.style.transition='opacity 0.5s'; el.style.opacity='0'; setTimeout(function(){ el.style.display='none'; el.style.opacity='1'; },500); }
    }, 4000);

    TOTAL=d; ATUAL=d; window.TOTAL_ORIGINAL=d.slice(); render(d);
  }).catch(e=>{
    clearInterval(intervalo);
    document.getElementById('msg').innerText='Erro: '+e.message;
  });
}
  
function render(listaComCab){
  var thead=document.querySelector('#tab thead'); var tbody=document.querySelector('#tab tbody');
  thead.innerHTML=''; tbody.innerHTML='';
  if(!listaComCab || listaComCab.length<2){ document.getElementById('tabWrap').style.display='none'; ATUAL=listaComCab||[]; return; }
  var cab=listaComCab[0].slice(); cab[6]="C1"; cab[8]="C2"; cab[10]="C3"; cab[12]="C4"; if(cab.length>17) cab=cab.slice(0,16);
  var htmlHead='<tr>'; cab.forEach(function(h,i){ var cls=(i==7||i==9||i==11||i==13||i==14||i==16)?' class="col-pend"':''; htmlHead+='<th'+cls+'>'+h+'</th>'; }); htmlHead+='</tr>'; thead.innerHTML=htmlHead;
  var corpo=listaComCab.slice(1);
  corpo.forEach(function(r,i){
    var tr=document.createElement('tr'); tr.id='row-'+(i+1);
    var htmlRow=''; r.slice(0,16).forEach(function(c,j){ var cls=(j==7||j==9||j==11||j==13||j==14)?' class="col-pend"':''; htmlRow+='<td'+cls+'>'+c+'</td>'; });
    tr.innerHTML=htmlRow; tr.onclick=function(){ selecionar(i+1); }; tbody.appendChild(tr);
  });
  document.getElementById('tabWrap').style.display='block'; ATUAL=listaComCab; idxSelecionado=-1;
}

document.getElementById('tabWrap').addEventListener('keydown', function(e){
  if(!ATUAL.length || ATUAL.length<2) return;
  if(document.activeElement && document.activeElement.tagName==='INPUT' && document.activeElement.id!=='tabWrap'){ if(e.key==='ArrowDown' || e.key==='ArrowUp') return; }
  if(e.key==='ArrowDown'){ e.preventDefault(); var novoIdx=idxSelecionado+1; if(novoIdx<1) novoIdx=1; if(novoIdx>=ATUAL.length) novoIdx=ATUAL.length-1; selecionar(novoIdx); }
  else if(e.key==='ArrowUp'){ e.preventDefault(); var novoIdx=idxSelecionado-1; if(novoIdx<1) novoIdx=1; selecionar(novoIdx); }
});
function selecionar(idx){
  if(idx<1 || idx>=ATUAL.length) return;
  var row=ATUAL[idx]; idxSelecionado=idx;
  document.querySelectorAll('#tab tbody tr').forEach(function(tr){tr.classList.remove('selecionado');});
  var el=document.getElementById('row-'+idx); if(el){ el.classList.add('selecionado'); el.scrollIntoView({block:'nearest'}); }
  var qtd=parseInt(row[5]||0);
  var mat = (row[4]||'').toString().trim();
  var nome = (row[2]||'').toString().trim();
  SELECIONADO={cong:row[1], nome:nome, mat:mat, zap:row[3], qtd:qtd, row:row};
  window.ultimoPedidoMat=mat||nome;
  window.ultimoPedidoNome=nome;
  var detalhesJson = row[17]||row[16+1]||'';
  if(!detalhesJson && row.length>17) detalhesJson = row[row.length-1];
  if(detalhesJson && typeof detalhesJson==='string' && detalhesJson.indexOf('{')!=-1){
    try{
      var parsed = JSON.parse(detalhesJson);
      DETALHE = {
        cong: row[1], congOrig: row[1], nome: nome, mat: mat, zap: row[3],
        c1: parsed.c1||{}, c2: parsed.c2||{}, c3: parsed.c3||{}, c4: parsed.c4||{},
        r1: parsed.r1||{media:0,nas:0,qtd:parseInt(row[6]||0),soma:0, perc:0},
        r2: parsed.r2||{media:0,nas:0,qtd:parseInt(row[8]||0),soma:0, perc:0},
        r3: parsed.r3||{media:0,nas:0,qtd:parseInt(row[10]||0),soma:0, perc:0},
        r4: parsed.r4||{media:0,nas:0,qtd:parseInt(row[12]||0),soma:0, perc:0},
        totalFeitos: parsed.totalFeitos!=undefined? parsed.totalFeitos : qtd,
        totalPend: parsed.totalPend!=undefined? parsed.totalPend : (52-qtd),
        mediaGeral: parsed.mediaGeral||0,
        totalNA: parsed.totalNA||0,
        totalSoma: parsed.totalSoma||0,
        reprov: parsed.reprov||[],
        status: parsed.status||row[15]||'',
        daPlanilha: true
      };
      document.getElementById('msg').innerText='✅ REAL DA PLANILHA - Selecionado: '+nome+' | Mat: '+mat+' | Média: '+DETALHE.mediaGeral.toFixed(2)+' | Feitos: '+DETALHE.totalFeitos+'/52 | NA: '+DETALHE.totalNA+' | '+DETALHE.status+' | Clique em BOLETIM';
      document.getElementById('acoes-extra').style.display='flex';
      document.getElementById('boletim').style.display='none';
      try{ var bBol=document.getElementById('btnBoletim'); if(bBol){ bBol.disabled=false; bBol.innerText='📄 BOLETIM'; } var bCert=document.getElementById('btnCertificado'); if(bCert){ bCert.disabled=false; bCert.innerText='🎓 CERTIFICADO'; } var bWord=document.getElementById('btnWordDrive'); if(bWord){ bWord.disabled=true; } }catch(e){}
      if(!window.CACHE_DETALHES) window.CACHE_DETALHES={};
      window.CACHE_DETALHES[mat]=DETALHE;
      window.CACHE_DETALHES[nome]=DETALHE;
      return;
    }catch(eJson){ console.log('Erro parse JSON', eJson, detalhesJson.substring(0,200)); }
  }
  if(window.CACHE_DETALHES && (window.CACHE_DETALHES[mat] || window.CACHE_DETALHES[nome])){
    DETALHE = window.CACHE_DETALHES[mat] || window.CACHE_DETALHES[nome];
    document.getElementById('msg').innerText='✅ CACHE - Selecionado: '+DETALHE.nome+' | Mat: '+DETALHE.mat+' | Média: '+DETALHE.mediaGeral.toFixed(2)+' | Feitos: '+DETALHE.totalFeitos+'/52 | NA: '+DETALHE.totalNA+' | '+DETALHE.status;
    document.getElementById('acoes-extra').style.display='flex';
    document.getElementById('boletim').style.display='none';
    try{ var bBol=document.getElementById('btnBoletim'); if(bBol){ bBol.disabled=false; } var bCert=document.getElementById('btnCertificado'); if(bCert){ bCert.disabled=false; } }catch(e){}
    return;
  }
  DETALHE=null;
  document.getElementById('msg').innerText='⚠ Clique em PESQUISAR para carregar 100% da planilha - sem dados reais ainda';
  document.getElementById('acoes-extra').style.display='none';
}

function exportarExcel(){ var dados=ATUAL; if(!dados||dados.length<2){alert('Pesquise primeiro'); return;} var csv=dados.map(function(r){return r.join(';');}).join('\n'); var blob=new Blob([csv],{type:'text/csv'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='RELATORIO.csv'; a.click(); }


function gerarBoletim(){
  if(!SELECIONADO){ alert("Clique em um nome na lista primeiro"); return; }
  if(!DETALHE){ alert("Clique na lista primeiro - os dados reais da planilha vêm no clique da lista (cache). Clique em PESQUISAR antes."); return; }
  if(DETALHE.mat!= SELECIONADO.mat && DETALHE.nome!= SELECIONADO.nome){
    var mat = SELECIONADO.mat;
    if(window.CACHE_DETALHES && window.CACHE_DETALHES[mat]){ DETALHE = window.CACHE_DETALHES[mat]; }
  }
  var a=DETALHE;
  var ano = new Date().getFullYear();
  var totalFeitosReal = parseInt(a.totalFeitos||0);
  var totalNAReal = parseInt(a.totalNA||0);
  var mediaReal = parseFloat(a.mediaGeral||0);
  var statusReal = (a.status||'').toString().toUpperCase();
  var ehAprovado = statusReal.indexOf('APROVADO')!=-1;
  var bloqueado = false;
  if(!ehAprovado){ if(totalNAReal>0) bloqueado=true; else if(totalFeitosReal<52) bloqueado=true; else if(mediaReal>0 && mediaReal<70) bloqueado=true; }
  if(totalNAReal==0 && totalFeitosReal>=52 && mediaReal>=70) bloqueado=false;
  function formatNota(n){ if(n===undefined) return {nota:'', obs:''}; if(n<70) return {nota:n, obs:'<span style="color:#c00; font-weight:900">NA</span>'}; return {nota:n, obs:''}; }
  var AZUL_CLARINHO = '#8ab4f8';
  var html='<div id="boletimPrint" style="background:#fff; padding:0; font-family:Arial, sans-serif; font-size:11px; color:#000; border:1px solid #000">'
  +'<div style="display:flex; align-items:center; gap:10px; padding:8px 10px; border-bottom:1px solid #000">'
  +'<img src="https://i.ibb.co/7hxL8x1/802853790-2155322575864895-5004929784006915147-n.png" style="width:70px; height:50px; object-fit:contain">'
  +'<div style="text-align:left; line-height:1.15"><b style="font-size:11px">IEADMI Igreja Evangélica Assembleia de Deus Missões</b><br><span style="font-size:14px; font-weight:900">Curso <i>Discipulado</i></span><br><span style="font-size:10px">Pr. Eliezer Miranda Barbosa – Presidente</span></div></div>'
  +'<div style="background:'+AZUL_CLARINHO+'; color:#000; font-weight:900; padding:6px; font-size:13px; text-align:center; letter-spacing:0.5px">BOLETIM DO ALUNO</div>'
  +'<div style="padding:10px">'
  +'<div style="display:flex; justify-content:space-between; font-size:11px; margin-top:6px"><div><b>Congregação:</b> '+(a.congOrig||a.cong||'')+'</div><div><b>Ano Curso:</b> '+ano+'</div></div>'
  +'<div style="display:flex; justify-content:space-between; font-size:11px; margin-top:2px"><div><b>Nome:</b> '+a.nome+'</div><div><b>Matrícula:</b> '+a.mat+'</div></div>';
  var calcPerc = function(total, qtd){ if(!qtd || qtd==0) return '0%'; return Math.round((total / (qtd*100) * 100))+'%'; };
  var perc1 = calcPerc(a.r1?a.r1.soma:0, a.r1?a.r1.qtd:0); var perc2 = calcPerc(a.r2?a.r2.soma:0, a.r2?a.r2.qtd:0); var perc3 = calcPerc(a.r3?a.r3.soma:0, a.r3?a.r3.qtd:0); var perc4 = calcPerc(a.r4?a.r4.soma:0, a.r4?a.r4.qtd:0);
  html+='<table style="width:100%; border-collapse:collapse; margin-top:8px; font-size:10px" border="1">'
  +'<tr style="background:'+AZUL_CLARINHO+'; color:#000; font-weight:900"><th style="text-align:left; padding:4px; background:'+AZUL_CLARINHO+'; color:#000">Ciclos Temas</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Média</th><th style="background:'+AZUL_CLARINHO+'; color:#000">NA</th><th style="background:'+AZUL_CLARINHO+'; color:#000">%</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Media Geral</th></tr>'
  +'<tr><td style="padding:4px; background:#fff">Ciclo 01: Conhecendo Jesus e o seu Reino</td><td style="text-align:center; background:#fff">'+(a.r1?a.r1.media.toFixed(2):'')+'</td><td style="text-align:center; background:#fff">'+(a.r1?a.r1.nas:0)+'</td><td style="text-align:center; background:#fff">'+perc1+'</td><td rowspan="4" style="text-align:center; font-weight:900; font-size:14px; vertical-align:middle; background:#fff">'+a.mediaGeral.toFixed(2)+'</td></tr>'
  +'<tr><td style="padding:4px; background:#fff">Ciclo 02: Conhecendo as Doutrinas Cristã</td><td style="text-align:center; background:#fff">'+(a.r2?a.r2.media.toFixed(2):'')+'</td><td style="text-align:center; background:#fff">'+(a.r2?a.r2.nas:0)+'</td><td style="text-align:center; background:#fff">'+perc2+'</td></tr>'
  +'<tr><td style="padding:4px; background:#fff">Ciclo 03: Vivendo as Verdades Bíblicas</td><td style="text-align:center; background:#fff">'+(a.r3?a.r3.media.toFixed(2):'')+'</td><td style="text-align:center; background:#fff">'+(a.r3?a.r3.nas:0)+'</td><td style="text-align:center; background:#fff">'+perc3+'</td></tr>'
  +'<tr><td style="padding:4px; background:#fff">Ciclo 04: Portando uma Nova Identidade</td><td style="text-align:center; background:#fff">'+(a.r4?a.r4.media.toFixed(2):'')+'</td><td style="text-align:center; background:#fff">'+(a.r4?a.r4.nas:0)+'</td><td style="text-align:center; background:#fff">'+perc4+'</td></tr>'
  +'</table>';
  html+='<table style="width:100%; border-collapse:collapse; margin-top:8px; font-size:9px" border="1">'
  +'<tr style="background:'+AZUL_CLARINHO+'; color:#000; font-weight:900"><th style="background:'+AZUL_CLARINHO+'; color:#000">Item</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Ciclo 01</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Nota</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Obs</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Ciclo 02</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Nota</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Obs</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Ciclo 03</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Nota</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Obs</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Ciclo 04</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Nota</th><th style="background:'+AZUL_CLARINHO+'; color:#000">Obs</th></tr>';
  var totalC1=0, totalC2=0, totalC3=0, totalC4=0;
  for(var i=1;i<=13;i++){
    var n1 = a.c1[i]; var n2 = a.c2[i]; var n3 = a.c3[i]; var n4 = a.c4[i];
    if(n1!==undefined) totalC1+=parseFloat(n1); if(n2!==undefined) totalC2+=parseFloat(n2); if(n3!==undefined) totalC3+=parseFloat(n3); if(n4!==undefined) totalC4+=parseFloat(n4);
    var f1 = formatNota(n1); var f2 = formatNota(n2); var f3 = formatNota(n3); var f4 = formatNota(n4);
    var bg1 = (n1!==undefined && n1<70)?' style="background:#ffcccc"':''; var bg2 = (n2!==undefined && n2<70)?' style="background:#ffcccc"':''; var bg3 = (n3!==undefined && n3<70)?' style="background:#ffcccc"':''; var bg4 = (n4!==undefined && n4<70)?' style="background:#ffcccc"':'';
    html+='<tr><td style="text-align:center; background:#fff">'+(i<10?'0'+i:i)+'</td>'
    +'<td style="background:#fff">Teste '+(i<10?'0'+i:i)+'</td><td'+bg1+' style="text-align:center; background:#fff">'+(f1.nota!==''?f1.nota:'')+'</td><td style="text-align:center; background:#fff">'+f1.obs+'</td>'
    +'<td style="background:#fff">Teste '+(i<10?'0'+i:i)+'</td><td'+bg2+' style="text-align:center; background:#fff">'+(f2.nota!==''?f2.nota:'')+'</td><td style="text-align:center; background:#fff">'+f2.obs+'</td>'
    +'<td style="background:#fff">Teste '+(i<10?'0'+i:i)+'</td><td'+bg3+' style="text-align:center; background:#fff">'+(f3.nota!==''?f3.nota:'')+'</td><td style="text-align:center; background:#fff">'+f3.obs+'</td>'
    +'<td style="background:#fff">Teste '+(i<10?'0'+i:i)+'</td><td'+bg4+' style="text-align:center; background:#fff">'+(f4.nota!==''?f4.nota:'')+'</td><td style="text-align:center; background:#fff">'+f4.obs+'</td>'
    +'</tr>';
  }
  html+='<tr style="background:'+AZUL_CLARINHO+'; font-weight:900; color:#000"><td colspan="2" style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000">Total Pontos</td><td style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000">'+totalC1+'</td><td style="background:'+AZUL_CLARINHO+'"></td><td style="background:'+AZUL_CLARINHO+'"></td><td style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000">'+totalC2+'</td><td style="background:'+AZUL_CLARINHO+'"></td><td style="background:'+AZUL_CLARINHO+'"></td><td style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000">'+totalC3+'</td><td style="background:'+AZUL_CLARINHO+'"></td><td style="background:'+AZUL_CLARINHO+'"></td><td style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000">'+totalC4+'</td><td style="background:'+AZUL_CLARINHO+'"></td></tr></table>';
  html+='<div style="font-size:8px; margin-top:4px"><b>Legenda:</b> NA -> Nota não atingida | Total: '+a.totalFeitos+'/52 | Pend: '+a.totalPend+' | 100% REAL</div>';
  if(bloqueado){
    html+='<div style="margin-top:8px; background:#f8d7da; color:#721c24; padding:8px; border:1px solid #f5c6cb; text-align:center; font-weight:900">⛔ PENDENTE - '+(a.totalNA>0? a.totalNA+' nota(s) <70 (NA)' : a.totalFeitos<52? 'Faltam '+(52-a.totalFeitos)+' testes' : 'Média <70')+' - NÃO PODE IMPRIMIR CERTIFICADO</div>';
  } else {
    html+='<div style="margin-top:8px; background:#d4edda; color:#155724; padding:8px; border:1px solid #c3e6cb; text-align:center; font-weight:900">✅ APROVADO - Pode imprimir Certificado e Boletim - Média '+a.mediaGeral.toFixed(2)+' - 100% REAL</div>';
  }
  html+='</div></div>';
  html+='<div class="no-print" data-html2canvas-ignore="true" style="margin-top:10px; display:flex; gap:8px; flex-wrap:nowrap">'
  +'<button onclick="window.print()" style="flex:1; min-width:0; height:44px; background:#0d6efd; color:#fff; border:0; border-radius:8px; font-weight:900; font-size:10px">🖨 IMPRIMIR</button>'
  +'<button onclick="enviarPdfZap()" style="flex:1; min-width:0; height:44px; background:#25D366; color:#fff; border:0; border-radius:8px; font-weight:900; font-size:10px">📄 PDF + ZAP</button>'
  +'<button onclick="enviarBoletimZap()" style="flex:1; min-width:0; height:44px; background:#128C7E; color:#fff; border:0; border-radius:8px; font-weight:900; font-size:10px">📱 TEXTO ZAP</button>'
  +'<button onclick="document.getElementById(\'boletim\').style.display=\'none\'" style="flex:1; min-width:0; height:44px; background:#6c757d; color:#fff; border:0; border-radius:8px; font-weight:900; font-size:10px">FECHAR</button>'
  +'</div>';
  document.getElementById('boletim').innerHTML=html;
  document.getElementById('boletim').style.display='block';
  document.getElementById('boletim').scrollIntoView({behavior:'smooth'});
}


function listarPendentesNA(a){
  var lista=[];
  for(var ciclo=1;ciclo<=4;ciclo++){
    var chave='c'+ciclo;
    var obj = a[chave] || {};
    for(var i=1;i<=13;i++){
      var v = obj[i];
      var teste = (i<10?'0'+i:i);
      if(v===undefined || v==='' || v===null){
        lista.push('C'+ciclo+'-Teste '+teste+' - Pendente');
      }else{
        var num=parseFloat(v);
        if(!isNaN(num) && num<70){
          lista.push('C'+ciclo+'-Teste '+teste+' - Nota abaixo de 70 (Nota: '+num+')');
        }
      }
    }
  }
  return lista;
}
function enviarBoletimZap(){
  if(!DETALHE){ alert('Gere o boletim primeiro'); return; }
  var zapRaw = (DETALHE.zap || SELECIONADO?.zap || '').toString();
  var zap = zapRaw.replace(/\D/g,'');
  var nome = DETALHE.nome || '';
  var cong = DETALHE.congOrig || DETALHE.cong || '';
  var mat = DETALHE.mat || '';
  var totalPontos = DETALHE.totalSoma || 0;
  var feitos = (DETALHE.totalFeitos||0) + '/52';
  var mediaGeral = (DETALHE.mediaGeral||0).toFixed(2);
  var status = DETALHE.status || '';
  var pend = listarPendentesNA(DETALHE);
  var blocoPend = pend.length>0? '\n\nPENDÊNCIAS:\n'+pend.join('\n') : '\n\nNenhuma pendência - Tudo OK';
  var relatorio = `BOLETIM DISCIPULADO - IEADMI\n\nAluno: ${nome}\nCongregação: ${cong}\nMatrícula: ${mat}\nTotal Pontos: ${totalPontos}\nFeitos: ${feitos}\nMédia Geral: ${mediaGeral}\nStatus: ${status}${blocoPend}\n\nRelatório 100% REAL`;
  if(!zap || zap.length < 10){
    window.open('https://wa.me/?text='+encodeURIComponent(relatorio), '_blank');
    return;
  }
  if(zap.length==10 || zap.length==11) zap = '55'+zap;
  window.open('https://wa.me/'+zap+'?text='+encodeURIComponent(relatorio), '_blank');
}
async function enviarPdfZap(){
  if(!DETALHE){ alert('Gere o boletim primeiro'); return; }
  ensureHtml2pdf(async function(){
  var elemento = document.getElementById('boletimPrint');
  if(!elemento){ alert('Boletim não encontrado'); return; }
  var zap = (DETALHE.zap || SELECIONADO?.zap || '').toString().replace(/\D/g,'');
  var nome = DETALHE.nome || '';
  var cong = DETALHE.congOrig || DETALHE.cong || '';
  var mat = DETALHE.mat || '';
  var totalPontos = DETALHE.totalSoma || 0;
  var feitos = (DETALHE.totalFeitos||0) + '/52';
  var mediaGeral = (DETALHE.mediaGeral||0).toFixed(2);
  var status = DETALHE.status || '';
  var pend = listarPendentesNA(DETALHE);
  var blocoPend = pend.length>0? '\n\nPENDÊNCIAS:\n'+pend.join('\n') : '\n\nNenhuma pendência - Tudo OK';
  var relatorio = `BOLETIM DISCIPULADO - IEADMI\n\nAluno: ${nome}\nCongregação: ${cong}\nMatrícula: ${mat}\nTotal Pontos: ${totalPontos}\nFeitos: ${feitos}\nMédia Geral: ${mediaGeral}\nStatus: ${status}${blocoPend}\n\nRelatório 100% REAL`;
  var nomeArquivo = 'BOLETIM_'+nome.replace(/\s+/g,'_')+'_'+mat+'.pdf';
  var btn = event?.target;
  if(btn){ btn.innerText='⏳ GERANDO...'; btn.disabled=true; }
  try{
    var opt = {
      margin: 2,
      filename: nomeArquivo,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, ignoreElements: function(el){ return el.classList && el.classList.contains('no-print'); } },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    var pdfBlob = await html2pdf().set(opt).from(elemento).outputPdf('blob');
    var file = new File([pdfBlob], nomeArquivo, { type: 'application/pdf' });
    if(zap && (zap.length==10 || zap.length==11)) zap = '55'+zap;
    if(navigator.canShare && navigator.canShare({ files: [file] })){
      await navigator.share({ files: [file], title: 'Boletim '+nome, text: relatorio });
      if(zap) setTimeout(function(){ window.open('https://wa.me/'+zap+'?text='+encodeURIComponent(relatorio), '_blank'); }, 800);
    }else{
      html2pdf().set(opt).from(elemento).save();
      if(zap) window.open('https://wa.me/'+zap+'?text='+encodeURIComponent(relatorio), '_blank');
      else window.open('https://wa.me/?text='+encodeURIComponent(relatorio), '_blank');
    }
  }catch(e){ alert('Erro: '+e.message); }
  finally{ if(btn){ btn.innerText='📄 PDF + ZAP'; btn.disabled=false; } }
  });
}

function gerarCertificado(){
  if(!SELECIONADO &&!DETALHE){
    var mat = document.getElementById("inputMatricula").value.trim();
    if(mat){ pesquisar(); return; }
    alert("Selecione aluno"); return;
  }
  var a=DETALHE;
  if(a.totalNA>0 || a.totalFeitos<52 || a.mediaGeral<70){
    var motivo = '';
    if(a.totalNA>0) motivo = a.totalNA+' nota(s) abaixo de 70 (NA)';
    else if(a.totalFeitos<52) motivo = 'Faltam '+(52-a.totalFeitos)+' testes';
    else motivo = 'Média '+a.mediaGeral.toFixed(2)+' abaixo de 70';
    var htmlBloq='<div style="background:#fff; padding:20px; border-radius:12px; border:3px solid #dc3545; text-align:center">'
    +'<h2 style="color:#dc3545; margin:0">⛔ CERTIFICADO BLOQUEADO</h2>'
    +'<div style="margin-top:12px"><b>'+a.nome+'</b><br>Mat: '+a.mat+'<br><br>Motivo: <b>'+motivo+'</b><br>Status: '+a.status+'</div>'
    +'<div style="margin-top:12px"><button onclick="gerarBoletim()" style="background:#0d6efd; color:#fff; border:0; border-radius:8px; padding:10px 16px; font-weight:800">VER BOLETIM</button> <button onclick="document.getElementById(\'boletim\').style.display=\'none\'" style="background:#888; color:#fff; border:0; border-radius:8px; padding:10px 16px; font-weight:800">FECHAR</button></div>'
    +'</div>';
    document.getElementById('boletim').innerHTML=htmlBloq;
    document.getElementById('boletim').style.display='block';
    return;
  }
  var meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  var dataHoje = new Date();
  var dataExtenso = 'Paragominas-PA, '+dataHoje.getDate()+' de '+meses[dataHoje.getMonth()]+' de '+dataHoje.getFullYear();
  var html='<div id="certPrint" style="background:#fff; font-family:Arial, sans-serif; border:1px solid #ccc; overflow:hidden">'
  +'<div style="display:flex; justify-content:flex-end; padding:8px 16px">'
  +'<div style="display:flex; align-items:center; gap:8px; text-align:left">'
  +'<img src="https://i.ibb.co/7hxL8x1/802853790-2155322575864895-5004929784006915147-n.png" style="width:40px">'
  +'<div style="line-height:1.1; font-size:8px"><b>IEADMI</b> Igreja Evangélica Assembleia de Deus Missões<br><span style="font-size:11px; font-weight:900; color:#c9a86a">Curso</span> <span style="font-size:13px; font-weight:900; color:#d4b87a">Discipulado</span><br>Pr. Eliezer Miranda Barbosa – Presidente</div>'
  +'</div>'
  +'</div>'
  +'<div style="display:flex; min-height:380px">'
  +'<div style="width:38%; background:#8aa8c8; padding:30px 20px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; position:relative">'
  +'<div style="position:absolute; top:-10px; right:-20px; width:40px; height:100%; background:#8aa8c8; transform:skewX(-10deg); z-index:0"></div>'
  +'<div style="z-index:1">'
  +'<div style="width:110px; height:110px; background:radial-gradient(circle, #e8d5a0 0%, #c9a86a 100%); border-radius:50%; display:flex; align-items:center; justify-content:center; border:3px solid #d4b87a; box-shadow:0 0 0 4px rgba(212,184,122,0.3)"><span style="font-size:50px">🏅</span></div>'
  +'<div style="margin-top:30px; color:#fff; font-size:26px; line-height:1.2; font-weight:300">Conclusão<br>de Curso<br><span style="font-weight:700">Discipulado</span></div>'
  +'</div>'
  +'</div>'
  +'<div style="width:62%; background:#7a8a9e; padding:30px 30px 20px; color:#fff; display:flex; flex-direction:column; justify-content:center; position:relative">'
  +'<div style="font-family:serif; font-size:42px; color:#d4c5a0; font-weight:300; letter-spacing:3px">CERTIFICADO</div>'
  +'<div style="width:100%; height:2px; background:#d4c5a0; margin:12px 0 20px"></div>'
  +'<div style="font-size:11px; line-height:1.6; color:#e8edf2; font-style:italic">'
  +'Declaramos que <b style="color:#fff; font-style:normal; font-size:12px">'+a.nome+'</b>, concluiu com êxito o Curso de Discipulado, realizado nesta instituição, Assembleia de Deus, num período de específico, atingindo a média mínima para a aprovação nos 4 Ciclos definidos. Dessa forma, mui respeitosamente reconhecemos sua dedicação aprovação.'
  +'</div>'
  +'<div style="margin-top:30px; font-size:10px; color:#cbd5df; font-style:italic; text-align:right">'+dataExtenso+'</div>'
  +'</div>'
  +'</div>'
  +'<div style="background:#fff; padding:30px 20px; display:flex; justify-content:flex-end">'
  +'<div style="text-align:center">'
  +'<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA" style="width:180px; height:auto; display:block; margin:0 auto">'
  +'<div style="border-top:1px solid #000; width:200px; margin:2px auto 0; padding-top:4px; font-size:10px; line-height:1.2"><b>Pr. Eliezer Miranda Barbosa</b><br>Pr Presidente</div>'
  +'</div>'
  +'</div>'
  +'<div class="no-print" style="background:#fff; padding:12px; display:flex; gap:8px; justify-content:center; border-top:1px solid #eee"><button onclick="window.print()" style="background:#198754; color:#fff; border:0; border-radius:8px; padding:10px 20px; font-weight:800">🖨 IMPRIMIR CERTIFICADO</button><button onclick="document.getElementById(\'boletim\').style.display=\'none\'" style="background:#888; color:#fff; border:0; border-radius:8px; padding:10px 20px; font-weight:800">FECHAR</button></div>'
  +'</div>';
  document.getElementById('boletim').innerHTML=html;
  document.getElementById('boletim').style.display='block';
}
function gerarWordDrive(){
  if(!DETALHE){
    var mat = document.getElementById('inputMatricula').value.trim() || (SELECIONADO?SELECIONADO.mat:'');
    if(!mat){ alert('Selecione aluno na lista ou digite matrícula e clique PESQUISAR'); return; }
    google.script.run.withSuccessHandler(function(d){ if(!d){ alert('Aluno não encontrado'); return; } DETALHE=d; gerarWordDrive(); }).getDetalheAluno(mat);
    return;
  }
  var mat = DETALHE?DETALHE.mat : (SELECIONADO?SELECIONADO.mat:'');
  if(!mat){ alert('Matrícula não encontrada'); return; }
  if(DETALHE && (DETALHE.totalNA>0 || DETALHE.totalFeitos<52 || DETALHE.mediaGeral<70)){
    alert('⛔ Não pode gerar Word - Aluno Pendente: '+DETALHE.status); return;
  }
  document.getElementById('msg').innerText='Gerando certificado Word no Drive para '+ (DETALHE?DETALHE.nome:mat)+'... aguarde';
  document.getElementById('boletim').innerHTML='<div style="background:#fff; padding:20px; text-align:center; border-radius:10px"><b>⏳ Gerando Word no Drive...</b><br>Salvando em pasta CERTIFICADOS DISCIPULADO</div>';
  document.getElementById('boletim').style.display='block';
  google.script.run.withSuccessHandler(function(r){
    if(!r.ok){ document.getElementById('msg').innerText='Erro: '+r.msg; document.getElementById('boletim').innerHTML='<div style="background:#f8d7da; padding:15px; border-radius:8px; color:#721c24; text-align:center">❌ '+r.msg+'</div>'; return; }
    document.getElementById('msg').innerText='Word gerado: '+r.nome;
    var html='<div style="background:#fff; padding:20px; border-radius:12px; border:2px solid #2b579a; text-align:center">'
    +'<h3 style="color:#2b579a; margin:0">✅ CERTIFICADO WORD CRIADO NO DRIVE</h3>'
    +'<div style="margin-top:10px; font-size:12px"><b>'+r.nome+'</b><br>Mat: '+r.mat+'</div>'
    +'<div style="margin-top:12px; display:flex; flex-direction:column; gap:8px">'
    +'<a href="'+r.urlDocs+'" target="_blank" style="background:#4285f4; color:#fff; padding:10px; border-radius:6px; text-decoration:none; font-weight:800">📄 Abrir Google Docs</a>'
    +(r.urlDocx?'<a href="'+r.urlDocx+'" target="_blank" style="background:#2b579a; color:#fff; padding:10px; border-radius:6px; text-decoration:none; font-weight:800">📝 Abrir Word.docx no Drive</a>':'')
    +(r.pasta?'<a href="'+r.pasta+'" target="_blank" style="background:#555; color:#fff; padding:10px; border-radius:6px; text-decoration:none; font-weight:800">📁 Abrir Pasta CERTIFICADOS</a>':'')
    +'</div>'
    +'<div style="margin-top:10px; font-size:9px; color:#666">Para baixar como Word no computador: Abra o Google Docs > Arquivo > Fazer download > Microsoft Word (.docx)</div>'
    +'<button onclick="document.getElementById(\'boletim\').style.display=\'none\'" style="margin-top:12px; background:#888; color:#fff; border:0; border-radius:6px; padding:8px 16px">FECHAR</button>'
    +'</div>';
    document.getElementById('boletim').innerHTML=html;
    document.getElementById('boletim').scrollIntoView({behavior:'smooth'});
  }).withFailureHandler(function(err){
    document.getElementById('msg').innerText='Erro: '+(err.message||err);
    document.getElementById('boletim').innerHTML='<div style="background:#f8d7da; padding:15px">Erro: '+(err.message||err)+'</div>';
  }).gerarCertificadoWordDrive(mat);
}
function puxarDoCadastro(){
  let p = new URLSearchParams(window.location.search);
  let mat = p.get('matricula') || localStorage.getItem('rel_mat') || "";
  if(!mat) return;
  let sel = document.getElementById('tipoPesquisa');
  if(sel){ sel.value = 'CERTIFICACOES'; mudarTipo(); document.getElementById('boxMatricula').style.display = 'block'; }
  let m1 = document.getElementById('inputMatricula');
  let m2 = document.getElementById('fMatr');
  if(m1) m1.value = mat;
  if(m2) m2.value = mat;
}
window.addEventListener('load', function(){ setTimeout(puxarDoCadastro, 600); });

