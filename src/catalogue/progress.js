const PROGRESS={
  /* Les tables : nombre de calculs « sus » (boîte 3 ou plus) sur 36 */
  tables(s){
    if(!s||!s.f)return 'Avec Hector';
    const n=Object.values(s.f).filter(e=>e.box>=3).length;
    return n?`${n} calcul${n>1?'s':''} su${n>1?'s':''} sur 36`:'Avec Hector';
  },
  /* Plus et moins : calculs sus (hors « combien ? ») */
  calculs(s){
    if(!s||!s.f)return 'Avec Hector';
    const n=Object.entries(s.f).filter(([k,e])=>k[0]!=='c'&&e.box>=3).length;
    return n?`${n} calcul${n>1?'s':''} su${n>1?'s':''}`:'Avec Hector';
  }
};
