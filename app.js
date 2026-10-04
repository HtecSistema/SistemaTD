
async function abrirTeste(linkOriginal, codUnico, rowId){
  // CORREÇÃO: busca novamente antes de abrir o teste em nova aba
  try{
    toast('Verificando dados antes do teste...','ok');
    let ok = await buscarMatriculaBD1();
    if(!ok){
      toast('Faça o PESQUISE e ALTERE antes do TESTE','err');
      return;
    }
  }catch(e){}

  const d=coletarDados();
  let obrig = [
    {id:'Matricula', label:'MATRICULA'},
    {id:'Nome', label:'PESQUISE'},
    {id:'Sexo', label:'SEXO'},
    {id:'WhatsApp', label:'WHATSAPP'},
    {id:'Congregacao', label:'CONGREGACAO'},
    {id:'Fcongregacao', label:'NOME DA CONGREGAÇAO'},
    {id:'BatizadoAgua', label:'MEMBRO'},
    {id:'QualFuncao', label:'FUNCAO ECLESIASTICA'}
  ];
  let faltando = [];
  obrig.forEach(o=>{ let el=document.getElementById(o.id); let v=el?String(el.value||'').trim():''; if(!v) faltando.push(o.label); });
  if(faltando.length>0){
    toast('PREENCHA: '+faltando.join(', '),'err');
    alert('PREENCHA OS CAMPOS OBRIGATÓRIOS:\n\n• '+faltando.join('\n• ')+'\n\nO TESTE NÃO VAI ABRIR SEM ISSO.');
    return;
  }
  let ciclo = '4'; let testeNum = '1';
  try{ let item = listaTestes.find(t=>String(t.Cod)==String(codUnico)); if(item && item.Ciclo) ciclo = String(item.Ciclo).replace(/\D/g,''); let m = String(codUnico).match(/-(\d+)/); if(m) testeNum = m[1]; }catch(e){}
  try{
    toast('Verificando liberação...','ok');
    let check = await apiGet('verificarliberacao',{matricula:d.Matricula,ciclo:ciclo,teste:testeNum});
    if(!check.liberado){
      if(check.nota>=70){ toast('⛔ JÁ APROVADO com '+check.nota+' - Não pode refazer','err'); alert('⛔ BLOQUEADO\nVocê já tirou '+check.nota+' no Teste '+testeNum+' Ciclo '+ciclo+'\nNota >=70 não pode refazer'); return; }
      else{ toast('⛔ SEM LIBERAÇÃO: '+check.motivo,'err'); alert('⛔ BLOQUEADO\nNota: '+(check.nota||'')+'\nMotivo: '+check.motivo+'\n\nPeça liberação ao admin 00425'); return; }
    }
  }catch(e){}
  let base=linkOriginal.split('/viewform')[0]+'/viewform?usp=pp_url';
  let entries=[...linkOriginal.matchAll(/entry\.(\d+)/g)].map(x=>x[0]);
  let bat=String(d.BatizadoAgua||'').toUpperCase(); if(bat!=='SIM'&&bat!=='NAO') bat='SIM';
  let vals=[d.Congregacao||'',d.Nome||'',d.WhatsApp||'',d.Matricula||'',(d.Sexo||'').toUpperCase(),bat,(d.QualFuncao||'').toUpperCase(),(d.Fcongregacao||'').toUpperCase()];
  if(entries.length>0) entries.forEach((e,i)=>{ if(vals[i]!==undefined) base+='&'+e+'='+encodeURIComponent(vals[i]); });
  const payload = {...d, CodigoTeste: codUnico, Ciclo: ciclo};

  // CORREÇÃO DEFINITIVA: abre aba separada na hora (evita bloqueio de pop-up) e deixa sistema aberto atrás
  let novaAba = window.open('about:blank', '_blank', 'noopener');
  if(!novaAba){
    toast('Permita pop-ups para abrir o teste em nova aba','err');
    // fallback tenta abrir mesmo assim
    novaAba = window.open('', '_blank');
  }

  apiGet('salvarNaResposta',{dados:JSON.stringify(payload), cod:codUnico, ciclo:ciclo}).then(r=>{
    if(novaAba) novaAba.location.href = base;
    else window.open(base,'_blank','noopener');
  }).catch(()=>{
    if(novaAba) novaAba.location.href = base;
    else window.open(base,'_blank','noopener');
  });

  let ov=document.getElementById('overlayTeste');
  ov.innerHTML='<div style="background:white;padding:20px;border-radius:12px;text-align:center;max-width:340px"><b>Teste '+codUnico+' Ciclo '+ciclo+'</b><br><small style="color:#666">Abrindo em nova aba...<br>Se não abriu, permita pop-ups</small><br><br><button onclick="document.getElementById(\'overlayTeste\').style.display=\'none\'; let m={}; try{m=JSON.parse(localStorage.getItem(\'testes_abertos\')||\'{}\')}catch(e){}; m[\''+codUnico+'\']=Date.now(); localStorage.setItem(\'testes_abertos\',JSON.stringify(m)); renderTestes(listaTestes);" style="width:100%;margin-top:12px;background:#198754;color:white;border:0;padding:14px;border-radius:10px;font-weight:900">✓ JÁ ENVIEI - VOLTAR (sistema continua aberto)</button><br><button onclick="document.getElementById(\'overlayTeste\').style.display=\'none\';" style="width:100%;margin-top:8px;background:#e5e7eb;color:#111;border:0;padding:10px;border-radius:10px;font-weight:700">FECHAR</button></div>';
  ov.style.display='flex'; ov.style.alignItems='center'; ov.style.justifyContent='center';
}
