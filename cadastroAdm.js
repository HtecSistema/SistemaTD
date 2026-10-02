const API="https://script.google.com/macros/s/AKfycbxLXw-nu5oXXtjE8HKik_W_bbT9CGjTNJWw-dUm4wWYv-hjcz1dOhMHLxoUTRHGJA3D0A/exec";
let CACHE=[], LINHA=null;

// ===== REGRA MESTRE - SÓ 00425 HELIO SOUZA SILVA PODE ALTERAR =====
const MAT_MASTER = "00425";
const NOME_MASTER = "HELIO SOUZA SILVA";

function getUsuarioLogado(){
  try{
    let mat = "";
    try{ mat = parent.localStorage.getItem("mat_logada") || ""; }catch(e){}
    if(!mat) mat = localStorage.getItem("mat_logada") || localStorage.getItem("matricula") || localStorage.getItem("usuario") || "";
    if(mat){ return String(mat).replace(/\D/g,"").padStart(5,'0'); }
    let txt = "";
    if(window.parent && window.parent.document){
      txt = window.parent.document.getElementById("user-display")?.innerText || window.parent.document.body.innerText || "";
    }
    let m = txt.match(/0*(\d{5})\s*-/);
    if(m) return m[1].padStart(5,'0');
  }catch(e){}
  return "00000";
}

function getNomeLogado(){
  try{
    let nome = "";
    try{ nome = parent.localStorage.getItem("nome_logado") || ""; }catch(e){}
    if(!nome) nome = localStorage.getItem("nome_logado") || "";
    return (nome||"").toUpperCase();
  }catch(e){ return ""; }
}

function isHelioMaster(){
  let mat = getUsuarioLogado().replace(/\D/g,"").replace(/^0+/,"");
  let mat5 = getUsuarioLogado();
  let nome = getNomeLogado();
  return (mat === "425" || mat5 === "00425") && nome.includes("HELIO");
}

function validarCPFjs(cpf){
  cpf=(cpf||"").replace(/\D/g,"");
  if(cpf.length!=11) return false;
  if(/^(\d)\1{10}$/.test(cpf)) return false;
  let s=0; for(let i=0;i<9;i++) s+=parseInt(cpf.charAt(i))*(10-i);
  let r=(s*10)%11; if(r==10) r=0; if(r!=parseInt(cpf.charAt(9))) return false;
  s=0; for(let i=0;i<10;i++) s+=parseInt(cpf.charAt(i))*(11-i);
  r=(s*10)%11; if(r==10) r=0; if(r!=parseInt(cpf.charAt(10))) return false;
  return true;
}

function aplicarRegras(){
  const pode = isHelioMaster();
  const camposBloqueados = [nCont, nSenha, nNome, nCPF, nSexo, nIgreja, nStatus];
  if(nMat){
    nMat.disabled = false;
    nMat.readOnly = false;
    nMat.style.backgroundColor = "";
    nMat.style.pointerEvents = "auto";
    nMat.style.opacity = "1";
  }
  if(!pode){
    camposBloqueados.forEach(el=>{
      if(!el) return;
      el.disabled = true;
      el.readOnly = true;
      el.style.backgroundColor = "#f3f4f6";
      el.style.pointerEvents = "none";
      el.style.opacity = "0.7";
    });
    if(nSenha) { nSenha.value="****"; nSenha.type="password"; }
  } else {
    camposBloqueados.forEach(el=>{
      if(!el) return;
      el.disabled = false;
      el.readOnly = false;
      el.style.backgroundColor = "";
      el.style.pointerEvents = "auto";
      el.style.opacity = "1";
    });
    if(nSenha && nSenha.value==="****") { nSenha.value=""; nSenha.type="text"; }
  }
}

function jsonp(u){return new Promise(ok=>{let cb="cb"+Date.now();window[cb]=d=>{ok(d);delete window[cb];s.remove()};let s=document.createElement("script");s.src=u+(u.includes("?")?"&":"?")+"callback="+cb;document.body.appendChild(s)})}
function carregar(){jsonp(API+"?action=getlistaedicaocadastro&t="+Date.now()).then(d=>{if(d.data) d=d.data; CACHE=Array.isArray(d)?d:(d.data||[]); filtra(); aplicarRegras();});}
function buscaDados(){
  let m=nMat.value.trim(); if(m.length<2) return;
  msg.innerText="Buscando...";
  jsonp(API+"?action=buscardados&matricula="+encodeURIComponent(m)+"&t="+Date.now()).then(r=>{
    let u=r.data||r;
    if(u && u.matricula){
      nMat.value=String(u.matricula).padStart(5,'0');
      nCont.value=u.contato||"";
      nNome.value=u.nome||"";
      nCPF.value=String(u.cpf||"").replace(/\D/g,"").padStart(11,'0');
      nIgreja.value=u.igreja||"";
      if(u.sexo) nSexo.value=u.sexo.toUpperCase();
      let senhaReal = u.senha||"";
      nSenha.value = senhaReal;
      msg.innerText="✅ "+u.nome;
      aplicarRegras();
      if(!isHelioMaster()){ nSenha.value="****"; nSenha.type="password"; }
    } else msg.innerText="";
  });
}
function filtra(){
  let q=(busca.value||"").toUpperCase(); let h="";
  CACHE.filter(u=> (u.matricula+" "+u.nome).toUpperCase().includes(q)).forEach(u=>{
    let mat5 = String(u.matricula).padStart(5,'0');
    let cpf11 = String(u.cpf||"").replace(/\D/g,"").padStart(11,'0');
    h+=`<tr><td><b>${mat5}</b></td><td>${u.nome}<br><small style="color:#888">${cpf11}</small></td><td>${u.status}</td><td><button onclick='editarPorLinha(${u.linha})' style="background:#0f172a;color:#fff;border:0;padding:6px 12px;border-radius:20px;font-size:10px;font-weight:700;cursor:pointer">EDITAR</button></td></tr>`;
  });
  lista.innerHTML=h||"<tr><td colspan=4 style='text-align:center;padding:15px;color:#999'>Nenhum</td></tr>";
}
function editarPorLinha(linha){
  let u = CACHE.find(x=> x.linha==linha);
  if(u) editar(u);
}
function editar(u){
  LINHA=u.linha;
  nMat.value=String(u.matricula).padStart(5,'0');
  nNome.value=u.nome;
  nCont.value=u.contato;
  nCPF.value=String(u.cpf||"").replace(/\D/g,"").padStart(11,'0');
  nIgreja.value=u.igreja;
  nSexo.value=u.sexo;
  nStatus.value=u.status;
  nSenha.value=u.senha||"";
  aplicarRegras();
  if(!isHelioMaster()){nSenha.value="****"; nSenha.type="password";}
  window.scrollTo(0,0);
}
function limpar(){
  LINHA=null;
  nMat.value="";nCont.value="";nNome.value="";nCPF.value="";nIgreja.value="";nSexo.value="";nStatus.value="EM ANALISE";
  aplicarRegras();
  if(!isHelioMaster()){nSenha.value="****"; nSenha.type="password";} else {nSenha.value=""; nSenha.type="text";}
  msg.innerText="";
}
function salvar(){
  if(!nMat.value||!nNome.value){alert("Falta matricula e nome");return;}
  if(!isHelioMaster()){
    alert("🔒 Somente o detentor pode fazer alterações.\n\nContato, Senha, Nome, CPF, Sexo e Igreja bloqueados.");
    return;
  }

  // ===== SEU PEDIDO: ZEROS NA FRENTE =====
  let mat5 = String(nMat.value||"").replace(/\D/g,"").padStart(5,'0');
  let cpf11 = String(nCPF.value||"").replace(/\D/g,"").padStart(11,'0');

  if(!mat5 || mat5=="00000"){ alert("Matrícula inválida"); return; }

  if(cpf11 && cpf11!="00000000000"){
    if(!validarCPFjs(cpf11)){
      alert("❌ CPF INVÁLIDO: "+cpf11);
      nCPF.style.border="2px solid red";
      msg.innerText="❌ CPF inválido";
      return;
    }
    let duplicado = CACHE.find(u=>{
      let c = String(u.cpf||"").replace(/\D/g,"").padStart(11,'0');
      if(!c) return false;
      if(LINHA && u.linha==LINHA) return false;
      if(String(u.matricula).padStart(5,'0')==mat5) return false;
      return c==cpf11;
    });
    if(duplicado){
      alert("❌ CPF "+cpf11+" JÁ CADASTRADO para:\n"+duplicado.nome+" - Mat: "+String(duplicado.matricula).padStart(5,'0'));
      nCPF.style.border="2px solid red";
      msg.innerText="❌ CPF duplicado";
      return;
    }
    nCPF.style.border="";
  }

  nMat.value = mat5;
  nCPF.value = cpf11;

  let dados={nome:nNome.value,matricula:mat5,contato:nCont.value,cpf:cpf11,igreja:nIgreja.value,status:nStatus.value,senha:nSenha.value,sexo:nSexo.value,linha:LINHA||0};
  if(nSenha.value==="****") delete dados.senha;
  msg.innerText="Salvando "+mat5+" / "+cpf11+"...";
  jsonp(API+"?action=cadastrarusuario&dados="+encodeURIComponent(JSON.stringify(dados))+"&t="+Date.now()).then(r=>{msg.innerText=r.msg||"Salvo"; carregar();});
}
carregar();