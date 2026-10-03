// RELATORIO.JS COMPLETO - FINAL - FILTRO + PDF 100% - 03/10/2026 - ORGANIZADO
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
function ensureHtml2pdf(cb){ if(typeof html2pdf!== 'undefined'){ cb(); return; } var s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'; s.onload=function(){ setTimeout(cb, 400); }; document.head.appendChild(s); }
function salvarCacheB(lista){ try{ localStorage.setItem('cache_dusuario_b', JSON.stringify({t:Date.now(), lista})) }catch(e){} }
function carregarCacheB(){ try{ const c = JSON.parse(localStorage.getItem('cache_dusuario_b')||'null'); if(c && c.lista && c.lista.length>0){ LISTA_ACESSO_CACHE = c.lista; return true; } }catch(e){} return false; }
carregarCacheB();
function isMasterMat(mat){ var m = String(mat||"").replace(/\D/g,"").padStart(5,'0'); return m==="00425" || m==="00001"; }
function isMasterNome(nome){ var n = semAcentoJS(nome||""); return n.indexOf("HELIO SOUZA SILVA")!==-1 || n.indexOf("ELIEZER MIRANDA BARBOSA")!==-1; }
function travarPosMenu(matricula){ var matFinal = String(matricula || localStorage.getItem('mat_logada') || "").replace(/\D/g,"").padStart(5,'0'); var nomeFinal = USUARIO_NOME || localStorage.getItem('nome_logado') || ""; if(isMasterMat(matFinal) || isMasterNome(nomeFinal)) return; var fNome = document.getElementById('fNome'); var fMat = document.getElementById('fMatr'); if(fNome){ fNome.value = nomeFinal; fNome.readOnly = true; fNome.disabled = true; fNome.style.backgroundColor='#e5e7eb'; fNome.style.opacity='0.6'; fNome.style.pointerEvents='none'; } if(fMat){ fMat.value = matFinal; fMat.readOnly = true; fMat.disabled = true; fMat.style.backgroundColor='#e5e7eb'; fMat.style.opacity='0.6'; fMat.style.pointerEvents='none'; } }
function destravarAposLogin(matricula){ var matFinal = String(matricula || "").replace(/\D/g,"").padStart(5,'0'); if(isMasterMat(matFinal) || isMasterNome(USUARIO_NOME)){ ['fNome','fMatr','buscar','fCong'].forEach(id=>{ const el=document.getElementById(id); if(el){ el.disabled=false; el.readOnly=false; el.style.background=''; el.style.opacity='1'; el.style.pointerEvents='auto'; el.value=''; } }); } else { travarPosMenu(matFinal); } }
function entrarAcessoGeral(){ var nome=document.getElementById('acessoNome').value.trim().toUpperCase(); var senha=document.getElementById('acessoSenha').value.trim().toUpperCase(); var msg=document.getElementById('msgAcesso'); if(!nome ||!senha){ msg.style.color="#c00"; msg.innerText="Informe nome e senha"; return; } if(LISTA_ACESSO_CACHE.length==0){ msg.style.color="#0d6efd"; msg.innerText="Carregando lista da coluna B..."; carregarListaAcessoNomes(); setTimeout(entrarAcessoGeral, 1000); return; } var usuario = LISTA_ACESSO_CACHE.find(u => semAcentoJS(u.nome||u.NomeUsuario||u.B||'') === semAcentoJS(nome)); if(!usuario){ msg.style.color="#c00"; msg.innerText="❌ Nome não encontrado na coluna B"; return; } if(String(usuario.senha||'').toUpperCase().trim()!== senha){ msg.style.color="#c00"; msg.innerText="❌ Senha não compatível"; return; } LIBERADO=true; USUARIO_NOME=usuario.nome||usuario.NomeUsuario||usuario.B||''; localStorage.setItem('mat_logada', usuario.matricula||usuario.Matricula||''); localStorage.setItem('nome_logado', USUARIO_NOME); var inp=document.getElementById('inputMatricula'); if(inp) inp.value=usuario.matricula||usuario.Matricula||''; msg.style.color="#198754"; msg.innerText="✅ Liberado "+USUARIO_NOME; destravarAposLogin(usuario.matricula||usuario.Matricula||''); }
function carregarListaAcessoNomes(){ if(LISTA_ACESSO_CACHE.length>0) return; google.script.run.withSuccessHandler(function(lista){ LISTA_ACESSO_CACHE=lista; salvarCacheB(lista); }).listarAcessosPendentes(); }
function renderDropdownAcessoNomes(lista){ var drop=document.getElementById('dropdownAcessoNome'); if(!drop) return; drop.innerHTML=''; var termo = (document.getElementById('acessoNome').value||'').trim(); if(!termo){ drop.style.display='none'; return; } if(!lista || lista.length==0){ drop.style.display='none'; return; } lista.slice(0,50).forEach(function(a){ var nome=(a.nome||a.NomeUsuario||a.B||"").toString().trim(); if(!nome) return; var st=(a.status||a.Status||"APROVADO").toUpperCase(); var cor=st=="APROVADO"?"#198754":"#dc3545"; var mat=(a.matricula||a.Matricula||a.D||"").toString(); var div=document.createElement('div'); div.className='dropdown-item'; div.innerHTML='<b>'+nome+'</b><small style="color:'+cor+'">Mat: '+mat+' - '+st+'</small>'; div.onclick=function(){ document.getElementById('acessoNome').value=nome; esconderAcessoNomes(); document.getElementById('acessoSenha').focus(); }; drop.appendChild(div); }); drop.style.display='block'; idxAcessoSel=-1; }
function mostrarAcessoNomes(){ var input = document.getElementById('acessoNome'); var termo = (input.value||'').trim(); if(!termo){ var drop=document.getElementById('dropdownAcessoNome'); if(drop){ drop.style.display='none'; drop.innerHTML=''; } return; } if(LISTA_ACESSO_CACHE.length==0){ if(!carregarCacheB()){ carregarListaAcessoNomes(); return; } } var termoSem = semAcentoJS(termo); var lista=LISTA_ACESSO_CACHE.filter(function(a){ var n=a.nome||a.NomeUsuario||a.B||""; return semAcentoJS(n).indexOf(termoSem)!=-1; }); renderDropdownAcessoNomes(lista); }
function filtrarAcessoNome(){ mostrarAcessoNomes(); }
function esconderAcessoNomes(){ var drop=document.getElementById('dropdownAcessoNome'); if(drop) drop.style.display='none'; }
function selecionarAcessoNome(nome){ document.getElementById('acessoNome').value=nome; esconderAcessoNomes(); document.getElementById('acessoSenha').focus(); }
function navegarAcessoNome(e){var drop=document.getElementById('dropdownAcessoNome'); var itens=drop?drop.querySelectorAll('.dropdown-item'):[]; if(!itens.length) return; if(e.key==='ArrowDown'){ e.preventDefault(); idxAcessoSel=Math.min(idxAcessoSel+1, itens.length-1); itens.forEach(it=>it.classList.remove('selecionado')); if(itens[idxAcessoSel]){itens[idxAcessoSel].classList.add('selecionado'); itens[idxAcessoSel].scrollIntoView({block:'nearest'});} } else if(e.key==='ArrowUp'){ e.preventDefault(); idxAcessoSel=Math.max(idxAcessoSel-1, 0); itens.forEach(it=>it.classList.remove('selecionado')); if(itens[idxAcessoSel]){itens[idxAcessoSel].classList.add('selecionado');} } else if(e.key==='Enter'){ e.preventDefault(); if(idxAcessoSel>=0 && itens[idxAcessoSel]) itens[idxAcessoSel].click(); } else if(e.key==='Escape'){ esconderAcessoNomes(); }}
window.addEventListener('message', function(e){ if(e.data && e.data.tipo==='LOGIN_DADOS'){ const mat = e.data.matricula||''; const nome = e.data.nome||''; if(mat){ localStorage.setItem('mat_logada', mat); } if(nome){ localStorage.setItem('nome_logado', nome); USUARIO_NOME=nome; } if(mat){ travarPosMenu(mat); } } });
document.addEventListener('DOMContentLoaded', function(){ carregarListaAcessoNomes(); const matLogada = localStorage.getItem('mat_logada') || ""; const nomeLogado = localStorage.getItem('nome_logado') || ""; if(matLogada){ USUARIO_NOME = nomeLogado || USUARIO_NOME; setTimeout(()=>travarPosMenu(matLogada), 300); } var inp = document.getElementById('acessoNome'); if(inp){ inp.addEventListener('input', filtrarAcessoNome); inp.addEventListener('keyup', navegarAcessoNome); inp.addEventListener('blur', function(){ setTimeout(esconderAcessoNomes, 200); }); } });
document.getElementById('tabWrap')?.addEventListener('keydown', function(e){ if(!ATUAL.length || ATUAL.length<2) return; if(document.activeElement && document.activeElement.tagName==='INPUT' && document.activeElement.id!=='tabWrap'){ if(e.key==='ArrowDown' || e.key==='ArrowUp') return; } if(e.key==='ArrowDown'){ e.preventDefault(); var novoIdx=idxSelecionado+1; if(novoIdx<1) novoIdx=1; if(novoIdx>=ATUAL.length) novoIdx=ATUAL.length-1; selecionar(novoIdx); } else if(e.key==='ArrowUp'){ e.preventDefault(); var novoIdx=idxSelecionado-1; if(novoIdx<1) novoIdx=1; selecionar(novoIdx); } });

function selecionar(idx){
  if(idx<1 || idx>=ATUAL.length) return;
  var row=ATUAL[idx]; idxSelecionado=idx;
  document.querySelectorAll('#tab tbody tr').forEach(function(tr){tr.classList.remove('selecionado');});
  var el=document.getElementById('row-'+idx); if(el){ el.classList.add('selecionado'); el.scrollIntoView({block:'nearest'}); }
  var qtd=parseInt(row[5]||0); var mat = (row[4]||'').toString().trim(); var nome = (row[2]||'').toString().trim();
  SELECIONADO={cong:row[1], nome:nome, mat:mat, zap:row[3], qtd:qtd, row:row};
  var detalhesJson = row[17]||row[row.length-1]||'';
  if(detalhesJson && typeof detalhesJson==='string' && detalhesJson.indexOf('{')!=-1){
    try{
      var parsed = JSON.parse(detalhesJson);
      DETALHE = { cong: row[1], congOrig: row[1], nome: nome, mat: mat, zap: row[3], c1: parsed.c1||{}, c2: parsed.c2||{}, c3: parsed.c3||{}, c4: parsed.c4||{}, r1: parsed.r1||{media:0,nas:0,qtd:parseInt(row[6]||0),soma:0}, r2: parsed.r2||{media:0,nas:0,qtd:parseInt(row[8]||0),soma:0}, r3: parsed.r3||{media:0,nas:0,qtd:parseInt(row[10]||0),soma:0}, r4: parsed.r4||{media:0,nas:0,qtd:parseInt(row[12]||0),soma:0}, totalFeitos: parsed.totalFeitos||qtd, totalPend: parsed.totalPend||(52-qtd), mediaGeral: parsed.mediaGeral||0, totalNA: parsed.totalNA||0, totalSoma: parsed.totalSoma||0, status: parsed.status||row[15]||'', daPlanilha: true };
      document.getElementById('msg').innerText='✅ REAL DA PLANILHA - Selecionado: '+nome+' | Mat: '+mat+' | Média: '+DETALHE.mediaGeral.toFixed(2)+' | Feitos: '+DETALHE.totalFeitos+'/52';
      document.getElementById('acoes-extra').style.display='flex'; document.getElementById('boletim').style.display='none';
      window.CACHE_DETALHES[mat]=DETALHE; window.CACHE_DETALHES[nome]=DETALHE; return;
    }catch(eJson){}
  }
  if(window.CACHE_DETALHES && (window.CACHE_DETALHES[mat] || window.CACHE_DETALHES[nome])){
    DETALHE = window.CACHE_DETALHES[mat] || window.CACHE_DETALHES[nome];
    document.getElementById('msg').innerText='✅ CACHE - Selecionado: '+DETALHE.nome+' | Média: '+DETALHE.mediaGeral.toFixed(2);
    document.getElementById('acoes-extra').style.display='flex'; return;
  }
  DETALHE=null; document.getElementById('msg').innerText='⚠ Clique em PESQUISAR para carregar 100% da planilha';
}

function pesquisar(){
  var fCong=document.getElementById('buscar')?.value||document.getElementById('fCong')?.value||'';
  var fNome=document.getElementById('fNome')?.value||'';
  var fMat=document.getElementById('fMatr')?.value||'';
  try{ google.script.run.limparCache(); }catch(e){}

  // MOSTRA BARRA
  var progCont=document.getElementById('progressContainer');
  var progBar=document.getElementById('progressBar');
  var labelQtd=document.getElementById('labelQtdAmbito');
  progCont.style.display='block';
  progBar.style.width='0%'; progBar.innerText='0%';
  if(labelQtd){ labelQtd.style.display='block'; labelQtd.innerText='Encontrados | Ciclo 01 - 0 | Ciclo 02 - 0 | Ciclo 03 - 0 | Ciclo 04 - 0 | Total: 0'; }
  document.getElementById('tabWrap').style.display='block';
  document.querySelector('#tab tbody').innerHTML='<tr><td colspan="18" style="text-align:center;">Carregando...</td></tr>';

  var pct=0;
  document.getElementById('msg').innerText='Buscando dados no Ciclo 01 - 0%';

  // ANIMAÇÃO DE 25 EM 25 IGUAL DO VIDEO
  var intervalo = setInterval(function(){
    if(pct==0) pct=25; else if(pct==25) pct=50; else if(pct==50) pct=75; else if(pct==75) pct=95;
    var ciclo = pct>=95?4:pct>=75?3:pct>=50?2:1;
    document.getElementById('msg').innerText = 'Buscando dados no Ciclo 0'+ciclo+' - '+pct+'%';
    progBar.style.width = pct+'%';
    progBar.innerText = pct+'%';
    if(labelQtd){
      // Vai contabilizando fake durante a busca para dar efeito do video
      var est = Math.floor(pct*2.4);
      labelQtd.innerText = 'Encontrados | Ciclo 01 - '+est+' | Ciclo 02 - '+Math.floor(est*0.8)+' | Ciclo 03 - '+Math.floor(est*0.6)+' | Ciclo 04 - '+Math.floor(est*0.5)+' | Total: '+est;
    }
  }, 600);

  var url = API_URL+"?action=getDadosFiltrados&fCong="+encodeURIComponent(fCong)+"&fNome="+encodeURIComponent(fNome)+"&fMat="+encodeURIComponent(fMat)+"&t="+Date.now();
  fetch(url).then(r=>r.json()).then(d=>{
    clearInterval(intervalo);

    // CONTA REAL POR CICLO - IGUAL DO VIDEO
    var total = d.length-1; var c1=0,c2=0,c3=0,c4=0;
    for(var i=1;i<d.length;i++){
      if(parseInt(d[i][6]||0)>0) c1++;
      if(parseInt(d[i][8]||0)>0) c2++;
      if(parseInt(d[i][10]||0)>0) c3++;
      if(parseInt(d[i][12]||0)>0) c4++;
    }

    document.getElementById('msg').innerText='Buscando dados no Ciclo 04 - 100%';
    progBar.style.width='100%'; progBar.innerText='100%';
    if(labelQtd){ labelQtd.innerText = 'Encontrados | Ciclo 01 - '+c1+' | Ciclo 02 - '+c2+' | Ciclo 03 - '+c3+' | Ciclo 04 - '+c4+' | Total: '+total; }

    TOTAL=d; ATUAL=d; window.TOTAL_ORIGINAL=d.slice();
    render(d);
    document.getElementById('msg').innerText='Dados 100% Localizados - '+total+' alunos';

    // SOME IGUAL NO VIDEO DEPOIS DE 2 SEGUNDOS
    setTimeout(function(){
      progCont.style.display='none';
      if(labelQtd) labelQtd.style.display='none';
    }, 2000);

  }).catch(e=>{
    clearInterval(intervalo);
    document.getElementById('msg').innerText='Erro: '+e.message;
    progCont.style.display='none';
  });
}

function render(listaComCab){
  var thead=document.querySelector('#tab thead'); var tbody=document.querySelector('#tab tbody'); thead.innerHTML=''; tbody.innerHTML='';
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

function filtrar(){
  var termo=semAcentoJS(document.getElementById('buscar').value);
  var fCong=semAcentoJS(document.getElementById('fCong').value);
  var fNome=semAcentoJS(document.getElementById('fNome').value);
  var fMat=semAcentoJS(document.getElementById('fMatr').value);
  var matCert=semAcentoJS(document.getElementById('inputMatricula').value);
  var lista = window.TOTAL_ORIGINAL || TOTAL || ATUAL;
  if(!lista || lista.length<2){ lista = ATUAL; if(!lista || lista.length<2) return; }
  var cab=lista[0]; var corpo=lista.slice(1);
  if(termo) corpo=corpo.filter(function(r){ return semAcentoJS(r[1]).indexOf(termo)!=-1 || semAcentoJS(r[2]).indexOf(termo)!=-1; });
  if(fCong) corpo=corpo.filter(function(r){ return semAcentoJS(r[15]||'').indexOf(fCong)!=-1 || semAcentoJS(r[1]).indexOf(fCong)!=-1; });
  if(fNome) corpo=corpo.filter(function(r){ var nome=semAcentoJS(r[2]); return nome.indexOf(fNome)!=-1 || nome.split(' ').some(function(p){return p.startsWith(fNome)}); });
  if(fMat) corpo=corpo.filter(function(r){ var mat=semAcentoJS(r[4]); var mat5=("00000"+(r[4]||"").replace(/\D/g,'')).slice(-5); return mat.indexOf(fMat)!=-1 || mat5.indexOf(fMat)!=-1 || semAcentoJS(r[2]).indexOf(fMat)!=-1; });
  if(matCert) corpo=corpo.filter(function(r){ var mat=semAcentoJS(r[4]); var mat5=("00000"+(r[4]||"").replace(/\D/g,'')).slice(-5); return mat.indexOf(matCert)!=-1 || mat5.indexOf(matCert)!=-1; });
  ATUAL = [cab].concat(corpo); render(ATUAL); document.getElementById('msg').innerText=corpo.length+' Localizados de '+(lista.length-1);
}


// LIMPAR FINAL - LIMPA LISTA + CACHE + TUDO - SÓ MANTÉM NOME E MAT QUANDO FOR USUÁRIO COMUM
window.limpar = function(){
  try{
    var matLogada = (localStorage.getItem('mat_logada') || '').toString().trim();
    var nomeLogado = (localStorage.getItem('nome_logado') || '').toString().trim().toUpperCase();
    var ehMaster = isMasterMat(matLogada) || isMasterNome(nomeLogado);

    var elBuscar = document.getElementById('buscar'); // Filtrar Cidade/Cong
    var elFStatus = document.getElementById('fCong'); // Filtrar Status
    var elFNome = document.getElementById('fNome'); // Filtrar Nome
    var elFMat = document.getElementById('fMatr'); // Filtrar Matricula

    // limpa filtros de cidade e status
    if(elBuscar) elBuscar.value = '';
    if(elFStatus) elFStatus.value = '';

    if(ehMaster){
      // MASTER: limpa até nome e matricula e destrava tudo
      if(elFNome){ elFNome.value=''; elFNome.disabled=false; elFNome.readOnly=false; elFNome.style.background=''; elFNome.style.opacity='1'; elFNome.style.pointerEvents='auto'; }
      if(elFMat){ elFMat.value=''; elFMat.disabled=false; elFMat.readOnly=false; elFMat.style.background=''; elFMat.style.opacity='1'; elFMat.style.pointerEvents='auto'; }
    }else{
      // USUARIO COMUM: mantém nome e matricula travados, não limpa
      if(elFNome){ elFNome.value = nomeLogado; elFNome.readOnly=true; elFNome.disabled=true; elFNome.style.backgroundColor='#e5e7eb'; elFNome.style.opacity='0.6'; elFNome.style.pointerEvents='none'; }
      if(elFMat){ elFMat.value = matLogada; elFMat.readOnly=true; elFMat.disabled=true; elFMat.style.backgroundColor='#e5e7eb'; elFMat.style.opacity='0.6'; elFMat.style.pointerEvents='none'; }
    }

    // LIMPA LISTA E CACHE - QUE É O QUE VOCÊ PEDIU NO AUDIO
    var tabHead = document.querySelector('#tab thead');
    var tabBody = document.querySelector('#tab tbody');
    var tabWrap = document.getElementById('tabWrap');
    if(tabHead) tabHead.innerHTML = '';
    if(tabBody) tabBody.innerHTML = '';
    if(tabWrap) tabWrap.style.display = 'none';

    // limpa cache da memória
    window.TOTAL_ORIGINAL = [];
    TOTAL = [];
    ATUAL = [];
    window.CACHE_DETALHES = {};
    SELECIONADO = null;
    DETALHE = null;
    idxSelecionado = -1;

    // limpa msg e boletim
    var msg = document.getElementById('msg'); if(msg) msg.innerText = ehMaster ? 'Filtro limpo - cache limpo - Master liberado' : 'Lista e cache limpos - Mantido '+matLogada;
    var progCont = document.getElementById('progressContainer'); if(progCont) progCont.style.display='none';
    var labelQtd = document.getElementById('labelQtdAmbito'); if(labelQtd) labelQtd.style.display='none';
    var acoes = document.getElementById('acoes-extra'); if(acoes) acoes.style.display='none';
    var bol = document.getElementById('boletim'); if(bol){ bol.style.display='none'; bol.innerHTML=''; }

    // limpa localStorage de cache (menos login)
    try{
      localStorage.removeItem('cache_dusuario_b');
      // se tiver outro cache de relatório
      localStorage.removeItem('cache_relatorio');
    }catch(e){}

  }catch(e){ console.log('Erro limpar:', e); }
};


function exportarExcel(){ var dados=ATUAL; if(!dados||dados.length<2){alert('Pesquise primeiro'); return;} var csv=dados.map(function(r){return r.join(';');}).join('\n'); var blob=new Blob([csv],{type:'text/csv'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='RELATORIO.csv'; a.click(); }

// ===== BOLETIM - MANTIDO TAMANHO ORIGINAL - LINHAS CINZA CLARINHO + NOME MAIUSCULO =====
function gerarBoletim(){
  if(!SELECIONADO){ alert("Clique em um nome na lista primeiro"); return; }
  if(!DETALHE){ alert("Clique na lista primeiro"); return; }
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
  var BORDA = '#d1d5db'; // CINZA CLARINHO

  var html='<div id="boletimPrint" style="background:#fff; padding:0; font-family:Arial, sans-serif; font-size:11px; color:#000; border:1px solid '+BORDA+'">'
  +'<div style="display:flex; align-items:center; gap:10px; padding:8px 10px; border-bottom:1px solid '+BORDA+'">'
  +'<img src="https://i.ibb.co/7hxL8x1/802853790-2155322575864895-5004929784006915147-n.png" style="width:auto; height:58px; object-fit:contain; display:block; object-fit:contain">'
  +'<div style="text-align:left; line-height:1.15"><b style="font-size:11px">Igreja Evangélica Assembleia de Deus Missões</b><br><span style="font-size:14px; font-weight:900">Curso <i>Discipulado</i></span><br><span style="font-size:10px">Pr. Eliezer Miranda Barbosa – Presidente</span></div></div>'
  +'<div style="background:'+AZUL_CLARINHO+'; color:#000; font-weight:900; padding:6px; font-size:13px; text-align:center;">BOLETIM DO ALUNO</div>'
  +'<div style="padding:10px">'
  +'<div style="display:flex; justify-content:space-between; font-size:11px; margin-top:6px"><div><b>Congregação:</b> '+(a.congOrig||a.cong||'')+'</div><div><b>Ano Curso:</b> '+ano+'</div></div>'
  +'<div style="display:flex; justify-content:space-between; font-size:11px; margin-top:2px"><div><b>Nome:</b> <span style="text-transform:uppercase; font-weight:900">'+(a.nome||'').toString().toUpperCase()+'</span></div><div><b>Matrícula:</b> '+a.mat+'</div></div>';

  var calcPerc = function(total, qtd){ if(!qtd || qtd==0) return '0%'; return Math.round((total / (qtd*100) * 100))+'%'; };
  var perc1 = calcPerc(a.r1?a.r1.soma:0, a.r1?a.r1.qtd:0); var perc2 = calcPerc(a.r2?a.r2.soma:0, a.r2?a.r2.qtd:0); var perc3 = calcPerc(a.r3?a.r3.soma:0, a.r3?a.r3.qtd:0); var perc4 = calcPerc(a.r4?a.r4.soma:0, a.r4?a.r4.qtd:0);

  html+='<table style="width:100%; border-collapse:collapse; margin-top:8px; font-size:10px; border:1px solid '+BORDA+'" border="0">'
  +'<tr style="background:'+AZUL_CLARINHO+'; color:#000; font-weight:900"><th style="text-align:left; padding:4px; background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Ciclos Temas</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Média</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">NA</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">%</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Media Geral</th></tr>'
  +'<tr><td style="padding:4px; background:#fff; border:1px solid '+BORDA+'">Ciclo 01: Conhecendo Jesus e o seu Reino</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+(a.r1?a.r1.media.toFixed(2):'')+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+(a.r1?a.r1.nas:0)+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+perc1+'</td><td rowspan="4" style="text-align:center; font-weight:900; font-size:14px; vertical-align:middle; background:#fff; border:1px solid '+BORDA+'">'+a.mediaGeral.toFixed(2)+'</td></tr>'
  +'<tr><td style="padding:4px; background:#fff; border:1px solid '+BORDA+'">Ciclo 02: Conhecendo as Doutrinas Cristã</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+(a.r2?a.r2.media.toFixed(2):'')+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+(a.r2?a.r2.nas:0)+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+perc2+'</td></tr>'
  +'<tr><td style="padding:4px; background:#fff; border:1px solid '+BORDA+'">Ciclo 03: Vivendo as Verdades Bíblicas</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+(a.r3?a.r3.media.toFixed(2):'')+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+(a.r3?a.r3.nas:0)+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+perc3+'</td></tr>'
  +'<tr><td style="padding:4px; background:#fff; border:1px solid '+BORDA+'">Ciclo 04: Portando uma Nova Identidade</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+(a.r4?a.r4.media.toFixed(2):'')+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+(a.r4?a.r4.nas:0)+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+perc4+'</td></tr>'
  +'</table>';

  html+='<table style="width:100%; border-collapse:collapse; margin-top:8px; font-size:9px; border:1px solid '+BORDA+'" border="0">'
  +'<tr style="background:'+AZUL_CLARINHO+'; color:#000; font-weight:900">'
  +'<th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Item</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Ciclo 01</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Nota</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Obs</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Ciclo 02</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Nota</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Obs</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Ciclo 03</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Nota</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Obs</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Ciclo 04</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Nota</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Obs</th></tr>';

  var totalC1=0, totalC2=0, totalC3=0, totalC4=0;
  for(var i=1;i<=13;i++){
    var n1 = a.c1[i]; var n2 = a.c2[i]; var n3 = a.c3[i]; var n4 = a.c4[i];
    if(n1!==undefined) totalC1+=parseFloat(n1); if(n2!==undefined) totalC2+=parseFloat(n2); if(n3!==undefined) totalC3+=parseFloat(n3); if(n4!==undefined) totalC4+=parseFloat(n4);
    var f1 = formatNota(n1); var f2 = formatNota(n2); var f3 = formatNota(n3); var f4 = formatNota(n4);
    html+='<tr style="height:14px; line-height:1">'
    +'<td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+(i<10?'0'+i:i)+'</td>'
    +'<td style="background:#fff; border:1px solid '+BORDA+'">Teste '+(i<10?'0'+i:i)+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+f1.nota+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+f1.obs+'</td>'
    +'<td style="background:#fff; border:1px solid '+BORDA+'">Teste '+(i<10?'0'+i:i)+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+f2.nota+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+f2.obs+'</td>'
    +'<td style="background:#fff; border:1px solid '+BORDA+'">Teste '+(i<10?'0'+i:i)+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+f3.nota+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+f3.obs+'</td>'
    +'<td style="background:#fff; border:1px solid '+BORDA+'">Teste '+(i<10?'0'+i:i)+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+f4.nota+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+f4.obs+'</td>'
    +'</tr>';
  }
  html+='<tr style="background:'+AZUL_CLARINHO+'; font-weight:900; color:#000"><td colspan="2" style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Total Pontos</td><td style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">'+totalC1+'</td><td style="background:'+AZUL_CLARINHO+'; border:1px solid '+BORDA+'"></td><td style="background:'+AZUL_CLARINHO+'; border:1px solid '+BORDA+'"></td><td style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">'+totalC2+'</td><td style="background:'+AZUL_CLARINHO+'; border:1px solid '+BORDA+'"></td><td style="background:'+AZUL_CLARINHO+'; border:1px solid '+BORDA+'"></td><td style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">'+totalC3+'</td><td style="background:'+AZUL_CLARINHO+'; border:1px solid '+BORDA+'"></td><td style="background:'+AZUL_CLARINHO+'; border:1px solid '+BORDA+'"></td><td style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">'+totalC4+'</td><td style="background:'+AZUL_CLARINHO+'; border:1px solid '+BORDA+'"></td></tr></table>';
  html+='<div style="font-size:8px; margin-top:4px"><b>Legenda:</b> NA -> Nota não atingida | Total: '+a.totalFeitos+'/52 | Pend: '+a.totalPend+' | 100% REAL</div>';
  if(bloqueado){ html+='<div style="margin-top:8px; background:#f8d7da; color:#721c24; padding:8px; border:1px solid #f5c6cb; text-align:center; font-weight:900">⛔ PENDENTE - '+(a.totalNA>0? a.totalNA+' nota(s) <70 (NA)' : a.totalFeitos<52? 'Faltam '+(52-a.totalFeitos)+' testes' : 'Média <70')+' - NÃO PODE IMPRIMIR CERTIFICADO</div>'; } else { html+='<div style="margin-top:8px; background:#d4edda; color:#155724; padding:8px; border:1px solid #c3e6cb; text-align:center; font-weight:900">✅ APROVADO - Pode imprimir Certificado e Boletim - Média '+a.mediaGeral.toFixed(2)+' - 100% REAL</div>'; }
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

function listarPendentesNA(a){ var lista=[]; for(var ciclo=1;ciclo<=4;ciclo++){ var chave='c'+ciclo; var obj = a[chave] || {}; for(var i=1;i<=13;i++){ var v = obj[i]; var teste = (i<10?'0'+i:i); if(v===undefined || v==='' || v===null){ lista.push('C'+ciclo+'-Teste '+teste+' - Pendente'); }else{ var num=parseFloat(v); if(!isNaN(num) && num<70){ lista.push('C'+ciclo+'-Teste '+teste+' - Nota abaixo de 70 (Nota: '+num+')'); } } } } return lista; }
function gerarCertificado(){ if(!SELECIONADO &&!DETALHE){ var mat = document.getElementById("inputMatricula").value.trim(); if(mat){ pesquisar(); return; } alert("Selecione aluno"); return; } var a=DETALHE; if(a.totalNA>0 || a.totalFeitos<52 || a.mediaGeral<70){ var motivo=''; if(a.totalNA>0) motivo=a.totalNA+' nota(s) <70'; else if(a.totalFeitos<52) motivo='Faltam '+(52-a.totalFeitos)+' testes'; else motivo='Média '+a.mediaGeral.toFixed(2)+' <70'; var htmlBloq='<div style="background:#fff;padding:20px;border-radius:12px;border:3px solid #dc3545;text-align:center"><h2 style="color:#dc3545">⛔ CERTIFICADO BLOQUEADO</h2><div><b>'+a.nome.toUpperCase()+'</b><br>Motivo: <b>'+motivo+'</b></div><div style="margin-top:12px"><button onclick="gerarBoletim()" style="background:#0d6efd;color:#fff;border:0;border-radius:8px;padding:10px 16px">VER BOLETIM</button></div></div>'; document.getElementById('boletim').innerHTML=htmlBloq; document.getElementById('boletim').style.display='block'; return; } var meses=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']; var dataHoje=new Date(); var dataExtenso='Paragominas-PA, '+dataHoje.getDate()+' de '+meses[dataHoje.getMonth()]+' de '+dataHoje.getFullYear(); var html='<div id="certPrint" style="background:#fff;font-family:Arial;border:1px solid #ccc;overflow:hidden"><div style="display:flex;justify-content:flex-end;padding:8px 16px"><div style="display:flex;align-items:center;gap:8px"><img src="https://i.ibb.co/7hxL8x1/802853790-2155322575864895-5004929784006915147-n.png" style="width:40px"><div style="font-size:8px"><b>IEADMI</b>Igreja Evangélica Assembleia de Deus Missões<br><span style="font-size:11px;font-weight:900;color:#c9a86a">Curso</span> <span style="font-size:13px;font-weight:900;color:#d4b87a">Discipulado</span><br>Pr. Eliezer Miranda Barbosa – Presidente</div></div></div><div style="display:flex;min-height:380px"><div style="width:38%;background:#8aa8c8;padding:30px 20px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center"><div style="width:110px;height:110px;background:radial-gradient(circle,#e8d5a0 0%,#c9a86a 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #d4b87a"><span style="font-size:50px">🏅</span></div><div style="margin-top:30px;color:#fff;font-size:26px">Conclusão<br>de Curso<br><span style="font-weight:700">Discipulado</span></div></div><div style="width:62%;background:#7a8a9e;padding:30px;color:#fff;display:flex;flex-direction:column;justify-content:center"><div style="font-family:serif;font-size:42px;color:#d4c5a0;letter-spacing:3px">CERTIFICADO</div><div style="width:100%;height:2px;background:#d4c5a0;margin:12px 0 20px"></div><div style="font-size:11px;line-height:1.6">Declaramos que <b style="text-transform:uppercase">'+a.nome.toUpperCase()+'</b>, concluiu com êxito o Curso de Discipulado.</div><div style="margin-top:30px;font-size:10px;text-align:right">'+dataExtenso+'</div></div></div><div class="no-print" style="padding:12px;display:flex;gap:8px;justify-content:center;border-top:1px solid #eee"><button onclick="window.print()" style="background:#198754;color:#fff;border:0;border-radius:8px;padding:10px 20px;font-weight:800">🖨 IMPRIMIR CERTIFICADO</button><button onclick="document.getElementById(\'boletim\').style.display=\'none\'" style="background:#888;color:#fff;border:0;border-radius:8px;padding:10px 20px">FECHAR</button></div></div>'; document.getElementById('boletim').innerHTML=html; document.getElementById('boletim').style.display='block'; }
function gerarWordDrive(){ if(!DETALHE){ var mat = document.getElementById('inputMatricula').value.trim() || (SELECIONADO?SELECIONADO.mat:''); if(!mat){ alert('Selecione aluno'); return; } google.script.run.withSuccessHandler(function(d){ if(!d){ alert('Aluno não encontrado'); return; } DETALHE=d; gerarWordDrive(); }).getDetalheAluno(mat); return; } var mat = DETALHE?DETALHE.mat : (SELECIONADO?SELECIONADO.mat:''); if(!mat){ alert('Matrícula não encontrada'); return; } if(DETALHE && (DETALHE.totalNA>0 || DETALHE.totalFeitos<52 || DETALHE.mediaGeral<70)){ alert('⛔ Não pode gerar Word - Aluno Pendente: '+DETALHE.status); return; } document.getElementById('msg').innerText='Gerando Word no Drive...'; document.getElementById('boletim').innerHTML='<div style="background:#fff;padding:20px;text-align:center"><b>⏳ Gerando Word no Drive...</b></div>'; document.getElementById('boletim').style.display='block'; google.script.run.withSuccessHandler(function(r){ if(!r.ok){ document.getElementById('msg').innerText='Erro: '+r.msg; return; } document.getElementById('msg').innerText='Word gerado: '+r.nome; var html='<div style="background:#fff;padding:20px;border-radius:12px;border:2px solid #2b579a;text-align:center"><h3 style="color:#2b579a">✅ WORD CRIADO NO DRIVE</h3><div><b>'+r.nome.toUpperCase()+'</b><br>Mat: '+r.mat+'</div><div style="margin-top:12px;display:flex;flex-direction:column;gap:8px"><a href="'+r.urlDocs+'" target="_blank" style="background:#4285f4;color:#fff;padding:10px;border-radius:6px;text-decoration:none;font-weight:800">📄 Abrir Google Docs</a>'+(r.urlDocx?'<a href="'+r.urlDocx+'" target="_blank" style="background:#2b579a;color:#fff;padding:10px;border-radius:6px;text-decoration:none">📝 Word.docx</a>':'')+'</div></div>'; document.getElementById('boletim').innerHTML=html; }).withFailureHandler(function(err){ document.getElementById('msg').innerText='Erro: '+(err.message||err); }).gerarCertificadoWordDrive(mat); }
function carregarIgrejas(){ google.script.run.withSuccessHandler(function(lista){ LISTA_IGREJAS_CACHE=lista; }).getListaIgrejas(); }
function filtrarIgrejas(){ var termo=semAcentoJS(document.getElementById('cadIgreja').value); var lista=LISTA_IGREJAS_CACHE.filter(function(n){ return!termo || semAcentoJS(n).indexOf(termo)!=-1; }); renderDropdownIgrejas(lista); mostrarIgrejas(); }
function renderDropdownIgrejas(lista){ var drop=document.getElementById('dropdownIgrejas'); if(!drop) return; drop.innerHTML=''; lista.slice(0,50).forEach(function(nome){ var div=document.createElement('div'); div.className='dropdown-item'; div.innerHTML='<b>'+nome+'</b>'; div.onclick=function(){ document.getElementById('cadIgreja').value=nome; esconderIgrejas(); }; drop.appendChild(div); }); }
function mostrarIgrejas(){ var d=document.getElementById('dropdownIgrejas'); if(d) d.style.display='block'; }
function esconderIgrejas(){ var d=document.getElementById('dropdownIgrejas'); if(d) d.style.display='none'; }
function navegarIgrejas(e){ var drop=document.getElementById('dropdownIgrejas'); var itens=drop?drop.querySelectorAll('.dropdown-item'):[]; if(!itens.length) return; if(e.key==='ArrowDown'){ e.preventDefault(); idxIgrejaSel=Math.min(idxIgrejaSel+1, itens.length-1); itens.forEach(it=>it.classList.remove('selecionado')); if(itens[idxIgrejaSel]){itens[idxIgrejaSel].classList.add('selecionado');} } else if(e.key==='Enter'){ e.preventDefault(); if(idxIgrejaSel>=0 && itens[idxIgrejaSel]) itens[idxIgrejaSel].click(); } else if(e.key==='Escape'){ esconderIgrejas(); } }
document.addEventListener('click', function(e){ var w1=document.querySelector('#modalCadastro.dropdown-wrapper'); var i1=document.getElementById('cadIgreja'); if(w1 &&!w1.contains(e.target) && e.target!==i1){ esconderIgrejas(); } var w2=document.getElementById('dropdownAcessoNome'); var i2=document.getElementById('acessoNome'); if(w2 &&!w2.parentElement.contains(e.target) && e.target!==i2){ esconderAcessoNomes(); } });
function abrirCadastro(){ document.getElementById('modalCadastro').style.display='flex'; carregarIgrejas(); }
function fecharCadastro(){ document.getElementById('modalCadastro').style.display='none'; }
function limparCadastro(){ ['cadNomeUsuario','cadCPF','cadMatricula','cadContato','cadIgreja','cadSenha'].forEach(id=>{var el=document.getElementById(id); if(el) el.value='';}); }
function fazerCadastroNovo(){ var msg=document.getElementById('msgCadastro'); var dados={ nomeUsuario: document.getElementById('cadNomeUsuario').value.trim(), cpf: document.getElementById('cadCPF').value, matricula: document.getElementById('cadMatricula').value, contato: document.getElementById('cadContato').value, sexo: document.getElementById('cadSexo').value, igreja: document.getElementById('cadIgreja').value, senha: document.getElementById('cadSenha').value, status: document.getElementById('cadStatus')? document.getElementById('cadStatus').value : 'EM ANALISE', linha: LINHA_EDICAO_ATUAL }; msg.style.color="#0d6efd"; msg.innerText="Salvando..."; google.script.run.withSuccessHandler(function(r){ msg.style.color=r.ok?"#198754":"#c00"; msg.innerText=r.msg; if(r.ok){ carregarListaAcessoNomes(); } }).cadastrarUsuario(dados); }
function carregarEdicaoCadastro(){ var div=document.getElementById('listaEdicaoCadastro'); if(!div) return; div.innerHTML='Carregando...'; fetch(API_URL + "?action=getlistaedicaocadastro").then(r=>r.json()).then(lista=>{ CACHE_EDICAO=lista; renderEdicaoCadastro(lista); }); }
function renderEdicaoCadastro(lista){ var div=document.getElementById('listaEdicaoCadastro'); if(!div) return; if(!lista || lista.length==0){ div.innerHTML='Nenhum cadastro'; return; } var html='<table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="background:#000;color:#fff"><th>NOME</th><th>STATUS</th><th>MAT</th><th>ACAO</th></tr>'; lista.forEach(function(it){ var cor=it.status=='APROVADO'?'#16a34a':'#dc2626'; html+='<tr><td>'+it.nome.toUpperCase()+'</td><td style="text-align:center"><span style="background:'+cor+';color:#fff;padding:2px 6px;border-radius:4px">'+it.status+'</span></td><td style="text-align:center">'+it.matricula+'</td><td style="text-align:center"><button onclick="editarCadastro(\''+it.matricula+'\')" style="background:#0d6efd;color:#fff;border:0;border-radius:6px;padding:4px 8px">EDITAR</button></td></tr>'; }); html+='</table>'; div.innerHTML=html; }
function filtrarEdicaoCadastro(){ var termo=semAcentoJS(document.getElementById('pesqEdicao').value.toUpperCase()); var lista=CACHE_EDICAO.filter(function(a){ return!termo || semAcentoJS(a.nome).indexOf(termo)!=-1 || String(a.matricula).indexOf(termo)!=-1; }); renderEdicaoCadastro(lista); }
function editarCadastro(linha){ var item=CACHE_EDICAO.find(function(a){return a.linha==linha}); if(!item) return; document.getElementById('cadNomeUsuario').value=item.nome; document.getElementById('cadMatricula').value=item.matricula||''; document.getElementById('cadIgreja').value=item.igreja||''; document.getElementById('cadSenha').value=item.senha||''; var st=document.getElementById('cadStatus'); if(st) st.value=item.status||'EM ANALISE'; LINHA_EDICAO_ATUAL=linha; }
function enviarBoletimZap(){ if(!DETALHE){ alert('Gere o boletim primeiro'); return; } var pend = listarPendentesNA(DETALHE); var blocoPend = pend.length>0? '\n\nPENDÊNCIAS:\n'+pend.join('\n') : '\n\nNenhuma pendência - Tudo OK'; var relatorio = `BOLETIM DISCIPULADO - IEADMI\n\nAluno: ${DETALHE.nome.toUpperCase()}\nCongregação: ${DETALHE.congOrig||DETALHE.cong||''}\nMatrícula: ${DETALHE.mat}\nTotal Pontos: ${DETALHE.totalSoma||0}\nFeitos: ${(DETALHE.totalFeitos||0)}/52\nMédia Geral: ${(DETALHE.mediaGeral||0).toFixed(2)}\nStatus: ${DETALHE.status||''}${blocoPend}`; var zapRaw = (DETALHE.zap || SELECIONADO?.zap || '').toString().replace(/\D/g,''); if(zapRaw.length>=10){ if(zapRaw.length==10||zapRaw.length==11) zapRaw='55'+zapRaw; window.open('https://wa.me/'+zapRaw+'?text='+encodeURIComponent(relatorio), '_blank'); } else { window.open('https://wa.me/?text='+encodeURIComponent(relatorio), '_blank'); } }
async function enviarPdfZap(){
  if(!DETALHE){ alert('Clique em BOLETIM primeiro'); return; }
  var el = document.getElementById('boletimPrint');
  if(!el){ alert('Gere o boletim primeiro'); return; }
  var nomeArquivo = 'BOLETIM_'+(DETALHE.nome||'aluno').replace(/\s+/g,'_')+'_'+(DETALHE.mat||'')+'.pdf';
  document.getElementById('boletim').style.display='block';
  el.style.display='block';
  ensureHtml2pdf(async function(){
    try{
      var opt = { margin: [2,2,2,2], filename: nomeArquivo, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false, scrollY: 0 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
      var pdfBlob = await html2pdf().set(opt).from(el).outputPdf('blob');
      var file = new File([pdfBlob], nomeArquivo, {type:'application/pdf'});
      if(navigator.canShare && navigator.canShare({files:[file]})){
        await navigator.share({ files:[file], title: nomeArquivo, text: 'Boletim '+DETALHE.nome.toUpperCase() });
      }else{
        await html2pdf().set(opt).from(el).save();
        setTimeout(function(){
          var pend = listarPendentesNA(DETALHE);
          var bloco = pend.length? '\n\nPENDÊNCIAS:\n'+pend.join('\n') : '\n\nTudo OK - APROVADO';
          var txt = `BOLETIM DISCIPULADO - IEADMI\nAluno: ${DETALHE.nome.toUpperCase()}\nMat: ${DETALHE.mat}\nMédia: ${DETALHE.mediaGeral.toFixed(2)}\nStatus: ${DETALHE.status}${bloco}\n\nPDF baixado - envie em anexo`;
          var zap = (DETALHE.zap||'').replace(/\D/g,'');
          if(zap.length==10||zap.length==11) zap='55'+zap;
          window.open(zap? 'https://wa.me/'+zap+'?text='+encodeURIComponent(txt) : 'https://wa.me/?text='+encodeURIComponent(txt), '_blank');
        }, 1500);
      }
    }catch(e){
      var opt2 = { margin: 2, filename: nomeArquivo, image: {type:'jpeg',quality:0.98}, html2canvas: {scale:2,useCORS:true,backgroundColor:'#fff'}, jsPDF: {unit:'mm',format:'a4',orientation:'portrait'} };
      await html2pdf().set(opt2).from(el).save();
    }
  });
}
