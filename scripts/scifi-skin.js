const renameMap = {
  food:   { singular: "nutri‑pack",          plural: "nutri‑packs"   },
  wood:   { singular: "synth‑fiber",        plural: "synth‑fibers" },
  stone:  { singular: "uranium core",       plural: "uranium cores" },
  skins:  { singular: "bio-hide",        plural: "bio-hides"  },
  herbs:  { singular: "med-herb",            plural: "med-herbs"      },
  ore:    { singular: "raw ore",       plural: "raw ore"  },
  metal:  { singular: "refined alloy",        plural: "refined alloys"  },
  gold:  { singular: "credit",        plural: "credits"  }

  tent:       { singular: "hab‑pod",        plural: "hab‑pods",        effectText: "+1 crew capacity" },
  hut:        { singular: "field module",   plural: "field modules",   effectText: "+3 crew capacity" },
  cottage:    { singular: "hab‑stack",      plural: "hab‑stacks",      effectText: "+6 crew capacity" },
  house:      { singular: "dome",           plural: "domes"                               },
  barn:       { singular: "nutri‑vault",    plural: "nutri‑vaults",    
                effectText: (civ) => `+${ (civ.granaries.owned?2:1)*200 } nutri‑pack storage` },
  woodstock:  { singular: "fiber cache",    plural: "fiber caches",    effectText: "+200 synth‑fiber storage" },
  stonestock: { singular: "core cache",     plural: "core caches",     effectText: "+200 uranium‑core storage" },
  graveyard:  { singular: "cryostasis array", plural: "cryostasis arrays", effectText: "contains 100 cryo‑pods" },

 
  farmer:     { singular: "agro‑tech",        plural: "agro‑techs"        },
  woodcutter: { singular: "harvester drone",  plural: "harvester drones"  },
  miner:      { singular: "excavator bot",    plural: "excavator bots"    },
  tanner:     { singular: "biochemist",       plural: "biochemists"       },
  healer:     { singular: "med‑officer",      plural: "med‑officers"      },
  soldier:    { singular: "marine",           plural: "marines"           },
  cavalry:    { singular: "grav‑bike trooper", plural: "grav‑bike troopers" },
};


function whenReady(cb) {
  if (window.cc && typeof window.cc.getCivData === "function") cb();
  else setTimeout(() => whenReady(cb), 60);
}

whenReady(() => {
  const civData = window.cc.getCivData();
  const ui      = window.cc.ui;


  for (const [id, cfg] of Object.entries(renameMap)) {
    const obj = civData[id];
    if (!obj) continue;                 // skip unknown ids
    if (cfg.singular)   obj.singular   = cfg.singular;
    if (cfg.plural)     obj.plural     = cfg.plural;
    if (cfg.name)       obj.name       = cfg.name;
    if (cfg.effectText) obj.effectText = typeof cfg.effectText === "function" ? cfg.effectText(civData) : cfg.effectText;
  }


  ui.find('#stripInner .title').textContent = 'Starhaven Clicker';
  ui.find('#civType').textContent           = 'Outpost';
  ui.find('#header h1').innerHTML           =
    'The <span id="civType">Outpost</span> of <span id="civName">Elysium‑9</span>';
  ui.find('#ruler').innerHTML               =
    'Commanded by the <span id="appellation">Chief Explorer</span> ' +
    '<span id="rulerName">Orteil‑X</span>';

 -
  document.querySelectorAll('button').forEach(btn => {
    const t = btn.textContent.trim();
    if (t === 'Harvest')      btn.textContent = 'Synthesize';
    else if (t === 'Cut')     btn.textContent = 'Weave';
    else if (t === 'Mine')    btn.textContent = 'Extract';
  });


  const style = document.createElement('style');
  style.textContent = `
    /* Entire UI → white text */
    body, body * { color: #ffffff !important; }

    /* But keep active button labels readable on their dark backgrounds */
    button, [role="button"], .button { color: #111111 !important; }
  `;
  document.head.appendChild(style);


  function refreshLabels() {
    for (const [id] of Object.entries(renameMap)) {
      const row   = document.getElementById(`${id}Row`);
      const label = row ? row.querySelector('label') : null;
      if (label && civData[id]) label.textContent = civData[id].getQtyName(0) + ':';
    }
  }


  refreshLabels();
  setTimeout(refreshLabels, 400);
  setTimeout(refreshLabels, 1500);


  const observer = new MutationObserver(refreshLabels);
  ['#basicResources', '#jobsContainer'].forEach(sel => {
    const node = document.querySelector(sel);
    if (node) observer.observe(node, { childList: true, subtree: true });
  });
});
