export function romano(n: number): string {
  const mapa: [number, string][] = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let r = '';
  for (const [v, s] of mapa) while (n >= v) { r += s; n -= v; }
  return r;
}

export const fechaLarga = (d: Date) =>
  d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

// Orden canónico (nombres RV) para el índice de pasajes
export const CANON = ['Génesis','Éxodo','Levítico','Números','Deuteronomio','Josué','Jueces','Rut','1 Samuel','2 Samuel','1 Reyes','2 Reyes','1 Crónicas','2 Crónicas','Esdras','Nehemías','Ester','Job','Salmo','Salmos','Proverbios','Eclesiastés','Cantares','Isaías','Jeremías','Lamentaciones','Ezequiel','Daniel','Oseas','Joel','Amós','Abdías','Jonás','Miqueas','Nahúm','Habacuc','Sofonías','Hageo','Zacarías','Malaquías','Mateo','Marcos','Lucas','Juan','Hechos','Romanos','1 Corintios','2 Corintios','Gálatas','Efesios','Filipenses','Colosenses','1 Tesalonicenses','2 Tesalonicenses','1 Timoteo','2 Timoteo','Tito','Filemón','Hebreos','Santiago','1 Pedro','2 Pedro','1 Juan','2 Juan','3 Juan','Judas','Apocalipsis'];

export function separaCita(cita: string): { libro: string; ref: string } {
  const m = cita.trim().match(/^(.+?)\s+(\d.*)$/);
  return m ? { libro: m[1], ref: m[2] } : { libro: cita.trim(), ref: '' };
}


export const SERIES = {
  olivo: {
    nombre: 'Serie del olivo',
    corto: 'Olivo',
    lema: 'La serie pública: teología, comisión, limpieza de mesa y careo mesiánico — el arco que se recorre de principio a fin.',
  },
  cimientos: {
    nombre: 'Serie Cimientos',
    corto: 'Cimientos',
    lema: 'Los loci de la sistemática en modo bíblico directo: la auditoría de las premisas sobre las que la serie del olivo se construyó.',
  },
} as const;
export type SerieId = keyof typeof SERIES;
