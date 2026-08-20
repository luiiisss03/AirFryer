/* ============================================================
   AirChef · Datos de la aplicación
   ------------------------------------------------------------
   Todo el contenido vive aquí: categorías, etiquetas y recetas.
   Sin APIs, sin backend, sin base de datos.

   Esquema de receta
   -----------------
   id           number   Identificador único
   name         string   Nombre visible
   emoji        string   Ilustración (se usa en tarjetas y ficha)
   category     string   Clave de CATEGORIES (una sola)
   description  string   Frase corta de presentación
   prepTime     number   Minutos de preparación
   cookTime     number   Minutos de cocción en la air fryer
   temperature  number   Grados centígrados
   difficulty   string   'Fácil' | 'Media' | 'Difícil'
   servings     number   Personas para las que está pensada
   calories     number   Kcal aproximadas por persona
   popularity   number   0-100, usado para ordenar por populares
   ingredients  array    { q: number|null, u: string, n: string }
                         q = cantidad escalable (null = "al gusto")
   steps        array    { t: string, timer?: number }  timer en minutos
   tips         array    Consejos específicos de air fryer
   tags         array    Claves de TAGS
   ============================================================ */

const CATEGORIES = [
  { key: 'pollo',     label: 'Pollo',     emoji: '🍗' },
  { key: 'carne',     label: 'Carne',     emoji: '🥩' },
  { key: 'pescado',   label: 'Pescado',   emoji: '🐟' },
  { key: 'patatas',   label: 'Patatas',   emoji: '🥔' },
  { key: 'verduras',  label: 'Verduras',  emoji: '🥦' },
  { key: 'huevos',    label: 'Huevos',    emoji: '🍳' },
  { key: 'pizza',     label: 'Pizza',     emoji: '🍕' },
  { key: 'snacks',    label: 'Snacks',    emoji: '🥪' },
  { key: 'postres',   label: 'Postres',   emoji: '🍰' }
];

/* Etiquetas transversales: funcionan como categorías "de objetivo" */
const TAGS = [
  { key: 'saludable', label: 'Saludable',      emoji: '🥗' },
  { key: 'rapida',    label: 'Rápida',         emoji: '⚡' },
  { key: 'economica', label: 'Económica',      emoji: '💰' },
  { key: 'proteina',  label: 'Alta en proteína', emoji: '💪' },
  { key: 'vegetariana', label: 'Vegetariana',  emoji: '🌱' },
  { key: 'crujiente', label: 'Crujiente',      emoji: '🥨' },
  { key: 'familiar',  label: 'Para compartir', emoji: '👨‍👩‍👧' },
  { key: 'picante',   label: 'Picante',        emoji: '🌶️' },
  { key: 'sin-gluten', label: 'Sin gluten',    emoji: '🌾' }
];

const DIFFICULTIES = ['Fácil', 'Media', 'Difícil'];

const RECIPES = [
  /* ─────────────────────────  PATATAS  ───────────────────────── */
  {
    id: 1, name: 'Patatas gajo especiadas', emoji: '🥔', category: 'patatas',
    description: 'El clásico imbatible: crujientes por fuera, cremosas por dentro y con un toque de pimentón.',
    prepTime: 10, cookTime: 20, temperature: 200, difficulty: 'Fácil',
    servings: 2, calories: 210, popularity: 99,
    ingredients: [
      { q: 600, u: 'g', n: 'patatas medianas' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: 0.5, u: 'cdta', n: 'ajo en polvo' },
      { q: 0.5, u: 'cdta', n: 'orégano seco' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Precalienta la air fryer a 200 °C durante 3 minutos.', timer: 3 },
      { t: 'Lava bien las patatas y córtalas en gajos con la piel, de unos 2 cm de grosor.' },
      { t: 'Sumérgelas en agua fría 10 minutos para quitar el almidón y sécalas MUY bien con papel de cocina.', timer: 10 },
      { t: 'Mézclalas en un bol con el aceite, el pimentón, el ajo en polvo, el orégano, la sal y la pimienta.' },
      { t: 'Colócalas en la cesta en una sola capa y cocina 20 minutos, agitando la cesta a mitad de tiempo.', timer: 20 },
      { t: 'Comprueba que estén doradas. Si no, añade 3 minutos más y sirve enseguida.' }
    ],
    tips: [
      'Secar las patatas es el paso más importante: la humedad las cuece en vez de tostarlas.',
      'No llenes la cesta: si se amontonan, quedan blandas. Mejor dos tandas.',
      'Sala al final si te gustan extra crujientes.'
    ],
    tags: ['economica', 'vegetariana', 'crujiente', 'familiar', 'sin-gluten']
  },
  {
    id: 2, name: 'Patatas fritas caseras', emoji: '🍟', category: 'patatas',
    description: 'Patatas fritas de verdad con una sola cucharada de aceite. Crujientes y doradas.',
    prepTime: 15, cookTime: 18, temperature: 200, difficulty: 'Fácil',
    servings: 2, calories: 230, popularity: 96,
    ingredients: [
      { q: 700, u: 'g', n: 'patatas para freír' },
      { q: 1.5, u: 'cda', n: 'aceite de girasol o de oliva suave' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Pela las patatas y córtalas en bastones de 1 cm de grosor, todos iguales.' },
      { t: 'Déjalas en agua fría 15 minutos y sécalas por completo.', timer: 15 },
      { t: 'Precalienta la air fryer a 200 °C durante 3 minutos.', timer: 3 },
      { t: 'Mezcla los bastones con el aceite hasta que queden apenas brillantes.' },
      { t: 'Cocina 18 minutos agitando la cesta cada 6 minutos.', timer: 18 },
      { t: 'Sala nada más sacarlas y sirve inmediatamente.' }
    ],
    tips: [
      'El grosor uniforme es la clave para que se hagan todas por igual.',
      'Si quieres el efecto “doble fritura”, cocina 10 min a 160 °C y termina 8 min a 200 °C.'
    ],
    tags: ['economica', 'vegetariana', 'crujiente', 'familiar', 'sin-gluten']
  },
  {
    id: 3, name: 'Patatas rellenas de queso y bacon', emoji: '🥔', category: 'patatas',
    description: 'Patata asada, vaciada y rellena de queso fundido y bacon crujiente. Plato completo.',
    prepTime: 10, cookTime: 35, temperature: 200, difficulty: 'Media',
    servings: 2, calories: 420, popularity: 78,
    ingredients: [
      { q: 2, u: 'ud', n: 'patatas grandes para asar' },
      { q: 80, u: 'g', n: 'bacon en tiras' },
      { q: 100, u: 'g', n: 'queso rallado tipo cheddar' },
      { q: 2, u: 'cda', n: 'nata para cocinar o crema agria' },
      { q: 1, u: 'cda', n: 'cebollino picado' },
      { q: null, u: '', n: 'Sal, pimienta y aceite' }
    ],
    steps: [
      { t: 'Lava las patatas, pínchalas con un tenedor y úntalas con un poco de aceite y sal.' },
      { t: 'Cocina a 200 °C durante 30 minutos, dándoles la vuelta a mitad.', timer: 30 },
      { t: 'Aparte, cocina el bacon a 180 °C durante 8 minutos hasta que esté crujiente y pícalo.', timer: 8 },
      { t: 'Corta las patatas por la mitad, vacía parte de la pulpa y mézclala con la nata, la mitad del queso, el bacon, sal y pimienta.' },
      { t: 'Rellena las patatas, cúbrelas con el resto del queso y hornea 5 minutos a 200 °C.', timer: 5 },
      { t: 'Espolvorea el cebollino y sirve caliente.' }
    ],
    tips: [
      'Elige patatas de tamaño parecido para que se asen a la vez.',
      'Pinchar la piel evita que la patata reviente por el vapor.'
    ],
    tags: ['familiar', 'crujiente']
  },
  {
    id: 4, name: 'Patatas bravas', emoji: '🥔', category: 'patatas',
    description: 'Dados de patata dorados con salsa brava casera. El tapeo español en tu air fryer.',
    prepTime: 10, cookTime: 20, temperature: 200, difficulty: 'Media',
    servings: 2, calories: 280, popularity: 82,
    ingredients: [
      { q: 600, u: 'g', n: 'patatas' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 150, u: 'ml', n: 'tomate triturado' },
      { q: 1, u: 'cdta', n: 'pimentón picante' },
      { q: 0.5, u: 'cdta', n: 'pimentón dulce' },
      { q: 1, u: 'cdta', n: 'vinagre de vino' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Corta las patatas en dados de 2,5 cm, lávalas y sécalas bien.' },
      { t: 'Precalienta a 200 °C durante 3 minutos.', timer: 3 },
      { t: 'Mezcla las patatas con 1 cucharada de aceite y sal, y cocina 20 minutos agitando cada 7 minutos.', timer: 20 },
      { t: 'Mientras, calienta en un cazo el resto del aceite con los pimentones 20 segundos, añade el tomate y el vinagre y cocina 8 minutos a fuego suave.', timer: 8 },
      { t: 'Sirve las patatas bien calientes con la salsa por encima.' }
    ],
    tips: [
      'Añade la salsa justo antes de servir para no ablandar las patatas.',
      'Un chorrito de alioli encima las convierte en “mixtas”.'
    ],
    tags: ['economica', 'vegetariana', 'picante', 'familiar']
  },
  {
    id: 5, name: 'Boniato en gajos', emoji: '🍠', category: 'patatas',
    description: 'Gajos de boniato dulces y crujientes con un toque de comino. Versión más ligera del clásico.',
    prepTime: 8, cookTime: 18, temperature: 195, difficulty: 'Fácil',
    servings: 2, calories: 190, popularity: 71,
    ingredients: [
      { q: 500, u: 'g', n: 'boniato' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 0.5, u: 'cdta', n: 'comino molido' },
      { q: 0.5, u: 'cdta', n: 'pimentón dulce' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Pela el boniato y córtalo en gajos de 2 cm.' },
      { t: 'Sécalo bien y mézclalo con el aceite y las especias.' },
      { t: 'Precalienta a 195 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 18 minutos agitando la cesta a los 9 minutos.', timer: 18 },
      { t: 'Deja reposar 2 minutos antes de servir: se vuelven más crujientes.', timer: 2 }
    ],
    tips: [
      'El boniato se dora antes que la patata: baja 5 °C respecto a las patatas normales.',
      'Una pizca de canela en lugar de comino lo convierte en versión dulce.'
    ],
    tags: ['saludable', 'vegetariana', 'economica', 'sin-gluten']
  },

  /* ─────────────────────────  POLLO  ───────────────────────── */
  {
    id: 6, name: 'Pollo crujiente estilo restaurante', emoji: '🍗', category: 'pollo',
    description: 'Rebozado súper crujiente con buttermilk casero y especias. El favorito de la casa.',
    prepTime: 20, cookTime: 25, temperature: 190, difficulty: 'Media',
    servings: 4, calories: 380, popularity: 100,
    ingredients: [
      { q: 8, u: 'ud', n: 'contramuslos de pollo sin piel' },
      { q: 250, u: 'ml', n: 'leche' },
      { q: 1, u: 'cda', n: 'zumo de limón' },
      { q: 150, u: 'g', n: 'harina de trigo' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: 1, u: 'cdta', n: 'ajo en polvo' },
      { q: 0.5, u: 'cdta', n: 'cebolla en polvo' },
      { q: 0.5, u: 'cdta', n: 'pimienta negra molida' },
      { q: 2, u: 'cda', n: 'aceite en espray' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Mezcla la leche con el zumo de limón y espera 5 minutos: tendrás buttermilk casero.', timer: 5 },
      { t: 'Sumerge el pollo en la mezcla y deja marinar al menos 15 minutos (mejor 2 horas en la nevera).', timer: 15 },
      { t: 'Mezcla la harina con todas las especias y la sal en un plato hondo.' },
      { t: 'Escurre el pollo y rebózalo presionando bien la harina para crear costra. Repite el rebozado una segunda vez.' },
      { t: 'Precalienta a 190 °C durante 4 minutos y pulveriza aceite sobre todo el rebozado, sin dejar zonas de harina blanca.', timer: 4 },
      { t: 'Cocina 25 minutos dando la vuelta a los 13 minutos y volviendo a pulverizar aceite.', timer: 25 },
      { t: 'Comprueba que el interior alcanza 75 °C y deja reposar 3 minutos.', timer: 3 }
    ],
    tips: [
      'Las zonas de harina seca quedan blancas y con sabor a crudo: el espray de aceite es imprescindible.',
      'Cocina en dos tandas antes que amontonar el pollo.',
      'El doble rebozado es lo que da ese crujiente de restaurante.'
    ],
    tags: ['proteina', 'crujiente', 'familiar']
  },
  {
    id: 7, name: 'Alitas de pollo crujientes', emoji: '🍖', category: 'pollo',
    description: 'Alitas doradas sin una gota de fritura, con el truco de la levadura química.',
    prepTime: 10, cookTime: 22, temperature: 200, difficulty: 'Fácil',
    servings: 2, calories: 320, popularity: 97,
    ingredients: [
      { q: 700, u: 'g', n: 'alitas de pollo partidas' },
      { q: 1, u: 'cdta', n: 'levadura química (impulsor)' },
      { q: 1, u: 'cdta', n: 'pimentón ahumado' },
      { q: 0.5, u: 'cdta', n: 'ajo en polvo' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Seca muy bien las alitas con papel de cocina.' },
      { t: 'Mézclalas con la levadura química, el pimentón, el ajo en polvo, la sal, la pimienta y el aceite.' },
      { t: 'Precalienta a 200 °C durante 3 minutos.', timer: 3 },
      { t: 'Colócalas separadas y cocina 12 minutos.', timer: 12 },
      { t: 'Dales la vuelta y cocina 10 minutos más hasta que estén muy doradas.', timer: 10 },
      { t: 'Sirve con salsa barbacoa, buffalo o alioli.' }
    ],
    tips: [
      'La levadura química (no bicarbonato solo) sube el pH de la piel y la vuelve extra crujiente.',
      'Si las sacas del congelador, descongélalas del todo o soltarán agua.'
    ],
    tags: ['proteina', 'crujiente', 'familiar', 'sin-gluten']
  },
  {
    id: 8, name: 'Pechuga de pollo jugosa', emoji: '🍗', category: 'pollo',
    description: 'La base perfecta para ensaladas y meal prep: dorada por fuera y nada seca por dentro.',
    prepTime: 5, cookTime: 16, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 220, popularity: 92,
    ingredients: [
      { q: 2, u: 'ud', n: 'pechugas de pollo (unos 180 g cada una)' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 0.5, u: 'cdta', n: 'pimentón dulce' },
      { q: 0.5, u: 'cdta', n: 'ajo en polvo' },
      { q: 0.5, u: 'cdta', n: 'orégano seco' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Golpea ligeramente las pechugas para igualar el grosor (unos 2 cm).' },
      { t: 'Úntalas con aceite y adóbalas con las especias, la sal y la pimienta.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 8 minutos, da la vuelta y cocina 8 minutos más.', timer: 16 },
      { t: 'Deja reposar 5 minutos antes de cortar para que no pierda los jugos.', timer: 5 }
    ],
    tips: [
      'Igualar el grosor evita que las puntas se sequen mientras el centro se hace.',
      'El reposo final es tan importante como la cocción.',
      'Perfecta para cocinar el domingo y usar toda la semana.'
    ],
    tags: ['saludable', 'proteina', 'rapida', 'sin-gluten']
  },
  {
    id: 9, name: 'Nuggets de pollo caseros', emoji: '🍤', category: 'pollo',
    description: 'Nuggets de pechuga picada, sin conservantes y con panko crujiente. Éxito asegurado con niños.',
    prepTime: 20, cookTime: 12, temperature: 200, difficulty: 'Media',
    servings: 4, calories: 260, popularity: 90,
    ingredients: [
      { q: 500, u: 'g', n: 'pechuga de pollo' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 100, u: 'g', n: 'pan rallado panko' },
      { q: 50, u: 'g', n: 'harina' },
      { q: 30, u: 'g', n: 'queso parmesano rallado' },
      { q: 0.5, u: 'cdta', n: 'ajo en polvo' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Pica la pechuga en trozos pequeños o tritúrala brevemente (que quede con textura, no pasta).' },
      { t: 'Salpimienta y forma nuggets aplanados de unos 4 cm.' },
      { t: 'Pásalos por harina, luego por huevo batido y finalmente por panko mezclado con parmesano y ajo en polvo.' },
      { t: 'Precalienta a 200 °C durante 3 minutos y pulveriza aceite sobre los nuggets.', timer: 3 },
      { t: 'Cocina 6 minutos, da la vuelta, vuelve a pulverizar y cocina 6 minutos más.', timer: 12 },
      { t: 'Sirve con kétchup, mostaza y miel o salsa de yogur.' }
    ],
    tips: [
      'El panko queda mucho más crujiente que el pan rallado normal.',
      'Puedes congelarlos crudos y cocinarlos directamente añadiendo 4 minutos.'
    ],
    tags: ['proteina', 'familiar', 'crujiente']
  },
  {
    id: 10, name: 'Fingers de pollo crujientes', emoji: '🍟', category: 'pollo',
    description: 'Tiras de pollo marinadas y rebozadas, listas en menos de media hora.',
    prepTime: 15, cookTime: 14, temperature: 200, difficulty: 'Fácil',
    servings: 2, calories: 300, popularity: 85,
    ingredients: [
      { q: 400, u: 'g', n: 'pechuga de pollo en tiras' },
      { q: 100, u: 'ml', n: 'yogur natural' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: 120, u: 'g', n: 'pan rallado panko' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Mezcla el yogur con el pimentón, la sal y la pimienta y marina las tiras 10 minutos.', timer: 10 },
      { t: 'Reboza cada tira en panko presionando bien.' },
      { t: 'Precalienta a 200 °C durante 3 minutos.', timer: 3 },
      { t: 'Pulveriza aceite y cocina 7 minutos por cada lado.', timer: 14 },
      { t: 'Sirve con salsa de miel y mostaza.' }
    ],
    tips: [
      'El yogur ablanda el pollo y hace que el rebozado se agarre sin harina.',
      'Deja espacio entre las tiras para que circule el aire.'
    ],
    tags: ['proteina', 'crujiente', 'rapida', 'familiar']
  },
  {
    id: 11, name: 'Muslos de pollo al limón y ajo', emoji: '🍋', category: 'pollo',
    description: 'Piel dorada y crujiente, carne jugosa y un aroma a limón y ajo irresistible.',
    prepTime: 10, cookTime: 25, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 340, popularity: 88,
    ingredients: [
      { q: 4, u: 'ud', n: 'muslos de pollo con piel' },
      { q: 1, u: 'ud', n: 'limón (zumo y ralladura)' },
      { q: 3, u: 'ud', n: 'dientes de ajo picados' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'tomillo seco' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Mezcla el zumo y la ralladura de limón con el ajo, el aceite, el tomillo, la sal y la pimienta.' },
      { t: 'Unta los muslos con el adobo y deja reposar 10 minutos.', timer: 10 },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Coloca los muslos con la piel hacia abajo y cocina 13 minutos.', timer: 13 },
      { t: 'Dales la vuelta y cocina 12 minutos más con la piel hacia arriba.', timer: 12 },
      { t: 'Deja reposar 3 minutos y riega con los jugos de la cesta.', timer: 3 }
    ],
    tips: [
      'Empezar con la piel hacia abajo derrite la grasa y la deja después mucho más crujiente.',
      'Si sale mucha grasa, retírala a mitad de cocción para evitar humo.'
    ],
    tags: ['proteina', 'familiar', 'sin-gluten']
  },
  {
    id: 12, name: 'Contramuslos con miel y pimentón', emoji: '🍯', category: 'pollo',
    description: 'Glaseado dulce y ahumado que caramelizará en los últimos minutos. Muy fácil, muy resultón.',
    prepTime: 10, cookTime: 22, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 330, popularity: 80,
    ingredients: [
      { q: 4, u: 'ud', n: 'contramuslos de pollo' },
      { q: 2, u: 'cda', n: 'miel' },
      { q: 1, u: 'cdta', n: 'pimentón ahumado' },
      { q: 1, u: 'cda', n: 'salsa de soja' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Mezcla la miel, el pimentón, la soja, el aceite y la pimienta.' },
      { t: 'Unta el pollo con la mitad del glaseado.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y cocina el pollo 15 minutos dando la vuelta a mitad.', timer: 15 },
      { t: 'Pinta con el resto del glaseado y cocina 7 minutos más.', timer: 7 },
      { t: 'Sirve con arroz o verduras asadas.' }
    ],
    tips: [
      'Pinta el glaseado al final: si lo pones desde el principio, el azúcar se quema.',
      'Forra la base con papel de air fryer para limpiar más fácil.'
    ],
    tags: ['proteina', 'familiar']
  },
  {
    id: 13, name: 'Pollo teriyaki con sésamo', emoji: '🥢', category: 'pollo',
    description: 'Dados de pollo lacados en salsa teriyaki casera, listos en 15 minutos de cocción.',
    prepTime: 15, cookTime: 16, temperature: 190, difficulty: 'Media',
    servings: 2, calories: 310, popularity: 79,
    ingredients: [
      { q: 400, u: 'g', n: 'pechuga o contramuslo de pollo en dados' },
      { q: 3, u: 'cda', n: 'salsa de soja' },
      { q: 1, u: 'cda', n: 'miel' },
      { q: 1, u: 'cdta', n: 'jengibre rallado' },
      { q: 1, u: 'ud', n: 'diente de ajo rallado' },
      { q: 1, u: 'cdta', n: 'aceite de sésamo' },
      { q: 1, u: 'cda', n: 'semillas de sésamo' }
    ],
    steps: [
      { t: 'Mezcla la soja, la miel, el jengibre, el ajo y el aceite de sésamo.' },
      { t: 'Marina el pollo 10 minutos reservando 2 cucharadas de salsa.', timer: 10 },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina el pollo 16 minutos agitando la cesta cada 5 minutos.', timer: 16 },
      { t: 'Riega con la salsa reservada, espolvorea sésamo y sirve sobre arroz.' }
    ],
    tips: [
      'Corta los dados del mismo tamaño para una cocción uniforme.',
      'Escurre bien el pollo antes de meterlo: el exceso de marinada gotea y humea.'
    ],
    tags: ['proteina', 'rapida']
  },

  /* ─────────────────────────  CARNE  ───────────────────────── */
  {
    id: 14, name: 'Hamburguesa casera', emoji: '🍔', category: 'carne',
    description: 'Jugosa por dentro y bien sellada por fuera, con el queso fundido en el último minuto.',
    prepTime: 10, cookTime: 12, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 450, popularity: 93,
    ingredients: [
      { q: 400, u: 'g', n: 'carne picada de ternera (20% grasa)' },
      { q: 2, u: 'ud', n: 'lonchas de queso cheddar' },
      { q: 2, u: 'ud', n: 'panes de hamburguesa' },
      { q: 1, u: 'cdta', n: 'ajo en polvo' },
      { q: null, u: '', n: 'Sal, pimienta, lechuga, tomate y salsas' }
    ],
    steps: [
      { t: 'Mezcla la carne con el ajo en polvo, sal y pimienta sin amasar en exceso.' },
      { t: 'Forma 2 hamburguesas de 2 cm y haz un hoyito en el centro con el pulgar.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 6 minutos, da la vuelta y cocina 5 minutos más.', timer: 11 },
      { t: 'Pon el queso encima y cocina 1 minuto más para fundirlo.', timer: 1 },
      { t: 'Tuesta los panes 2 minutos a 180 °C y monta la hamburguesa.', timer: 2 }
    ],
    tips: [
      'El hoyito central evita que la hamburguesa se abombe.',
      'La carne demasiado magra queda seca: busca al menos un 15-20% de grasa.'
    ],
    tags: ['proteina', 'familiar', 'rapida']
  },
  {
    id: 15, name: 'Albóndigas de ternera', emoji: '🍝', category: 'carne',
    description: 'Albóndigas tiernas hechas sin freír, perfectas con salsa de tomate o en bocadillo.',
    prepTime: 20, cookTime: 14, temperature: 180, difficulty: 'Media',
    servings: 4, calories: 290, popularity: 84,
    ingredients: [
      { q: 500, u: 'g', n: 'carne picada mixta' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 50, u: 'g', n: 'pan rallado' },
      { q: 2, u: 'cda', n: 'leche' },
      { q: 2, u: 'ud', n: 'dientes de ajo picados' },
      { q: 2, u: 'cda', n: 'perejil fresco picado' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Remoja el pan rallado en la leche 5 minutos.', timer: 5 },
      { t: 'Mezcla la carne con el huevo, el pan remojado, el ajo, el perejil, la sal y la pimienta.' },
      { t: 'Forma bolas de unos 30 g (saldrán unas 16).' },
      { t: 'Precalienta a 180 °C durante 3 minutos y pulveriza aceite sobre las albóndigas.', timer: 3 },
      { t: 'Cocina 14 minutos agitando la cesta a los 7 minutos.', timer: 14 },
      { t: 'Añádelas a tu salsa de tomate favorita y deja que se impregnen 5 minutos.', timer: 5 }
    ],
    tips: [
      'Bolas del mismo tamaño = cocción uniforme. Usa una cuchara de helado.',
      'Se congelan crudas perfectamente: cocínalas 4 minutos más desde congelado.'
    ],
    tags: ['proteina', 'familiar', 'economica']
  },
  {
    id: 16, name: 'Costillas de cerdo BBQ', emoji: '🥩', category: 'carne',
    description: 'Costillas melosas por dentro y lacadas por fuera, sin necesidad de horno ni barbacoa.',
    prepTime: 15, cookTime: 35, temperature: 180, difficulty: 'Media',
    servings: 2, calories: 520, popularity: 86,
    ingredients: [
      { q: 800, u: 'g', n: 'costillar de cerdo en tiras' },
      { q: 1, u: 'cdta', n: 'pimentón ahumado' },
      { q: 1, u: 'cdta', n: 'ajo en polvo' },
      { q: 1, u: 'cdta', n: 'azúcar moreno' },
      { q: 4, u: 'cda', n: 'salsa barbacoa' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Retira la membrana blanca de la parte trasera del costillar.' },
      { t: 'Mezcla el pimentón, el ajo, el azúcar, la sal y la pimienta y frota bien la carne.' },
      { t: 'Precalienta a 180 °C durante 4 minutos.', timer: 4 },
      { t: 'Cocina 30 minutos dando la vuelta cada 10 minutos.', timer: 30 },
      { t: 'Pinta con la salsa barbacoa y cocina 5 minutos más a 200 °C para caramelizar.', timer: 5 },
      { t: 'Deja reposar 5 minutos antes de cortar.', timer: 5 }
    ],
    tips: [
      'Corta el costillar en tiras que quepan sin doblarse en la cesta.',
      'Si la carne no se separa del hueso con facilidad, dale 5 minutos más a 170 °C.'
    ],
    tags: ['proteina', 'familiar']
  },
  {
    id: 17, name: 'Filete de ternera al punto', emoji: '🥩', category: 'carne',
    description: 'Un entrecot bien sellado con costra dorada y el interior rosado. Cuestión de minutos.',
    prepTime: 5, cookTime: 10, temperature: 200, difficulty: 'Media',
    servings: 2, calories: 350, popularity: 81,
    ingredients: [
      { q: 2, u: 'ud', n: 'filetes de ternera de 2,5 cm' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'ud', n: 'diente de ajo' },
      { q: 10, u: 'g', n: 'mantequilla' },
      { q: null, u: '', n: 'Sal gruesa y pimienta negra' }
    ],
    steps: [
      { t: 'Saca la carne de la nevera 30 minutos antes y sécala bien.' },
      { t: 'Úntala con aceite y salpimienta generosamente.' },
      { t: 'Precalienta a 200 °C durante 5 minutos (aquí el precalentado es imprescindible).', timer: 5 },
      { t: 'Cocina 5 minutos, da la vuelta y cocina 4-6 minutos más según el punto deseado.', timer: 5 },
      { t: 'Retira, añade la mantequilla y el ajo por encima y deja reposar 5 minutos tapado.', timer: 5 }
    ],
    tips: [
      'Poco hecho: 8 min · Al punto: 10 min · Hecho: 13 min (para 2,5 cm de grosor).',
      'Nunca cortes la carne recién salida: perderás todo el jugo.'
    ],
    tags: ['proteina', 'rapida', 'sin-gluten']
  },
  {
    id: 18, name: 'Bacon crujiente', emoji: '🥓', category: 'carne',
    description: 'Bacon perfectamente crujiente, sin salpicaduras y con toda la grasa escurrida.',
    prepTime: 2, cookTime: 9, temperature: 180, difficulty: 'Fácil',
    servings: 2, calories: 240, popularity: 87,
    ingredients: [
      { q: 8, u: 'ud', n: 'lonchas de bacon' }
    ],
    steps: [
      { t: 'Coloca las lonchas en una sola capa, sin superponerlas.' },
      { t: 'Cocina a 180 °C durante 6 minutos.', timer: 6 },
      { t: 'Da la vuelta y cocina 3 minutos más, o hasta el punto que te guste.', timer: 3 },
      { t: 'Escurre sobre papel de cocina antes de servir.' }
    ],
    tips: [
      'Pon una rebanada de pan bajo la rejilla: absorbe la grasa y evita el humo.',
      'No necesita aceite ni precalentado.'
    ],
    tags: ['rapida', 'proteina', 'crujiente', 'sin-gluten']
  },
  {
    id: 19, name: 'Salchichas jugosas', emoji: '🌭', category: 'carne',
    description: 'Salchichas doradas por fuera y jugosas por dentro en poco más de 10 minutos.',
    prepTime: 2, cookTime: 12, temperature: 180, difficulty: 'Fácil',
    servings: 2, calories: 330, popularity: 76,
    ingredients: [
      { q: 6, u: 'ud', n: 'salchichas frescas' }
    ],
    steps: [
      { t: 'Pincha ligeramente las salchichas con un tenedor.' },
      { t: 'Precalienta a 180 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 12 minutos dando la vuelta cada 4 minutos.', timer: 12 },
      { t: 'Comprueba que no queden rosadas por dentro y sirve.' }
    ],
    tips: [
      'No amontones: si se tocan quedan pálidas en los puntos de contacto.',
      'Con cebolla en juliana debajo tienes un plato completo.'
    ],
    tags: ['rapida', 'economica', 'familiar']
  },
  {
    id: 20, name: 'Solomillo de cerdo a la mostaza', emoji: '🍖', category: 'carne',
    description: 'Solomillo tierno con costra de mostaza y hierbas. Elegante y sorprendentemente sencillo.',
    prepTime: 10, cookTime: 22, temperature: 180, difficulty: 'Media',
    servings: 3, calories: 260, popularity: 72,
    ingredients: [
      { q: 500, u: 'g', n: 'solomillo de cerdo' },
      { q: 2, u: 'cda', n: 'mostaza de Dijon' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'romero seco' },
      { q: 1, u: 'cdta', n: 'ajo en polvo' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Seca el solomillo y úntalo con la mostaza mezclada con aceite, romero, ajo, sal y pimienta.' },
      { t: 'Precalienta a 180 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 22 minutos dando un cuarto de vuelta cada 6 minutos.', timer: 22 },
      { t: 'Deja reposar 8 minutos envuelto en papel de aluminio antes de cortar en medallones.', timer: 8 }
    ],
    tips: [
      'El solomillo se seca enseguida: no te pases de tiempo, 63 °C en el centro es suficiente.',
      'Si no cabe entero, córtalo por la mitad.'
    ],
    tags: ['proteina', 'saludable']
  },
  {
    id: 21, name: 'Brochetas de pavo y verduras', emoji: '🍢', category: 'carne',
    description: 'Ligeras, coloridas y con mucha proteína. Ideales para meal prep o cena rápida.',
    prepTime: 12, cookTime: 14, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 240, popularity: 68,
    ingredients: [
      { q: 400, u: 'g', n: 'pechuga de pavo en dados' },
      { q: 1, u: 'ud', n: 'pimiento rojo' },
      { q: 1, u: 'ud', n: 'calabacín' },
      { q: 1, u: 'ud', n: 'cebolla morada' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'orégano seco' },
      { q: null, u: '', n: 'Sal, pimienta y zumo de medio limón' }
    ],
    steps: [
      { t: 'Corta el pavo y las verduras en dados del mismo tamaño.' },
      { t: 'Adóbalo todo con aceite, orégano, limón, sal y pimienta y móntalo en brochetas.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 14 minutos dando la vuelta a los 7 minutos.', timer: 14 },
      { t: 'Sirve con cuscús o ensalada.' }
    ],
    tips: [
      'Si usas brochetas de madera, remójalas 10 minutos en agua.',
      'Comprueba que las brochetas caben en la cesta antes de montarlas.'
    ],
    tags: ['saludable', 'proteina', 'rapida', 'sin-gluten']
  },

  /* ─────────────────────────  PESCADO  ───────────────────────── */
  {
    id: 22, name: 'Salmón con eneldo y limón', emoji: '🐟', category: 'pescado',
    description: 'Diez minutos para un salmón jugoso con la superficie ligeramente tostada.',
    prepTime: 5, cookTime: 10, temperature: 180, difficulty: 'Fácil',
    servings: 2, calories: 320, popularity: 95,
    ingredients: [
      { q: 2, u: 'ud', n: 'lomos de salmón (150 g cada uno)' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 0.5, u: 'ud', n: 'limón en rodajas' },
      { q: 1, u: 'cdta', n: 'eneldo seco' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Seca los lomos y úntalos con aceite, eneldo, sal y pimienta.' },
      { t: 'Precalienta a 180 °C durante 3 minutos.', timer: 3 },
      { t: 'Coloca el salmón con la piel hacia abajo y pon las rodajas de limón encima.' },
      { t: 'Cocina 10 minutos sin darle la vuelta.', timer: 10 },
      { t: 'Comprueba que se desmiga fácilmente con un tenedor y sirve.' }
    ],
    tips: [
      'Regla práctica: 1 minuto por cada centímetro de grosor y medio, a 180 °C.',
      'No lo pases: el salmón sigue cocinándose con su propio calor al sacarlo.'
    ],
    tags: ['saludable', 'proteina', 'rapida', 'sin-gluten']
  },
  {
    id: 23, name: 'Merluza rebozada crujiente', emoji: '🐠', category: 'pescado',
    description: 'El sabor de la merluza rebozada de toda la vida con una fracción del aceite.',
    prepTime: 15, cookTime: 12, temperature: 190, difficulty: 'Media',
    servings: 2, calories: 280, popularity: 83,
    ingredients: [
      { q: 400, u: 'g', n: 'lomos de merluza sin espinas' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 60, u: 'g', n: 'harina' },
      { q: 100, u: 'g', n: 'pan rallado' },
      { q: 1, u: 'cdta', n: 'perejil seco' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Seca bien la merluza y salpimienta.' },
      { t: 'Pásala por harina, huevo batido y pan rallado mezclado con perejil.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Pulveriza aceite generosamente por ambas caras.' },
      { t: 'Cocina 7 minutos, da la vuelta con cuidado y cocina 5 minutos más.', timer: 12 },
      { t: 'Sirve con limón y una ensalada.' }
    ],
    tips: [
      'Si el pescado está congelado, descongélalo del todo y sécalo o el rebozado se desprende.',
      'Usa una espátula fina para darle la vuelta sin romper la costra.'
    ],
    tags: ['proteina', 'crujiente', 'familiar']
  },
  {
    id: 24, name: 'Gambas al ajillo', emoji: '🍤', category: 'pescado',
    description: 'Gambas jugosas con ajo, guindilla y perejil listas en 8 minutos.',
    prepTime: 8, cookTime: 8, temperature: 180, difficulty: 'Fácil',
    servings: 2, calories: 180, popularity: 89,
    ingredients: [
      { q: 400, u: 'g', n: 'gambas peladas' },
      { q: 4, u: 'ud', n: 'dientes de ajo laminados' },
      { q: 2, u: 'cda', n: 'aceite de oliva virgen extra' },
      { q: 1, u: 'ud', n: 'guindilla seca' },
      { q: 2, u: 'cda', n: 'perejil fresco picado' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Mezcla las gambas con el aceite, el ajo, la guindilla troceada y la sal.' },
      { t: 'Precalienta a 180 °C durante 3 minutos.', timer: 3 },
      { t: 'Pon la mezcla en un recipiente apto para air fryer (para no perder el aceite).' },
      { t: 'Cocina 8 minutos removiendo a los 4 minutos.', timer: 8 },
      { t: 'Espolvorea el perejil fresco y sirve con pan.' }
    ],
    tips: [
      'Usa un molde o papel de air fryer con borde: el jugo es lo mejor del plato.',
      'Si te pasas de tiempo quedan gomosas: 8 minutos son suficientes.'
    ],
    tags: ['rapida', 'proteina', 'sin-gluten', 'saludable']
  },
  {
    id: 25, name: 'Bacalao con tomate y aceitunas', emoji: '🫒', category: 'pescado',
    description: 'Lomos de bacalao sobre una base mediterránea de tomate, aceitunas y orégano.',
    prepTime: 10, cookTime: 14, temperature: 180, difficulty: 'Media',
    servings: 2, calories: 260, popularity: 70,
    ingredients: [
      { q: 2, u: 'ud', n: 'lomos de bacalao desalado' },
      { q: 200, u: 'g', n: 'tomates cherry' },
      { q: 60, u: 'g', n: 'aceitunas negras' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'orégano seco' },
      { q: 1, u: 'ud', n: 'diente de ajo picado' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Mezcla los tomates partidos por la mitad con las aceitunas, el ajo, el aceite y el orégano.' },
      { t: 'Precalienta a 180 °C durante 3 minutos y cocina la mezcla 6 minutos en un molde.', timer: 6 },
      { t: 'Coloca los lomos de bacalao encima y salpimienta.' },
      { t: 'Cocina 8 minutos más hasta que el pescado se abra en lascas.', timer: 8 },
      { t: 'Riega con el jugo del molde y sirve.' }
    ],
    tips: [
      'El bacalao ya salado suele no necesitar sal extra: pruébalo antes.',
      'Adelantar las verduras evita que el pescado se pase esperándolas.'
    ],
    tags: ['saludable', 'proteina', 'sin-gluten']
  },
  {
    id: 26, name: 'Calamares a la romana', emoji: '🦑', category: 'pescado',
    description: 'Aros de calamar con rebozado dorado y crujiente, sin aceite hirviendo.',
    prepTime: 20, cookTime: 10, temperature: 200, difficulty: 'Media',
    servings: 2, calories: 290, popularity: 77,
    ingredients: [
      { q: 400, u: 'g', n: 'anillas de calamar' },
      { q: 100, u: 'ml', n: 'leche' },
      { q: 80, u: 'g', n: 'harina' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 100, u: 'g', n: 'pan rallado' },
      { q: null, u: '', n: 'Sal, limón y aceite en espray' }
    ],
    steps: [
      { t: 'Deja las anillas en leche 15 minutos para que queden más tiernas.', timer: 15 },
      { t: 'Escúrrelas, sécalas y pásalas por harina, huevo y pan rallado.' },
      { t: 'Precalienta a 200 °C durante 3 minutos.', timer: 3 },
      { t: 'Pulveriza aceite y cocina 5 minutos por cada lado.', timer: 10 },
      { t: 'Sirve inmediatamente con limón y alioli.' }
    ],
    tips: [
      'Cocínalos poco tiempo y a temperatura alta: si se pasan se vuelven gomosos.',
      'Trabaja en tandas pequeñas para que queden bien crujientes.'
    ],
    tags: ['proteina', 'crujiente', 'familiar']
  },
  {
    id: 27, name: 'Dorada al limón', emoji: '🐠', category: 'pescado',
    description: 'Pescado entero al estilo mediterráneo, con piel dorada y carne muy jugosa.',
    prepTime: 8, cookTime: 18, temperature: 180, difficulty: 'Fácil',
    servings: 2, calories: 240, popularity: 66,
    ingredients: [
      { q: 2, u: 'ud', n: 'doradas limpias (300 g cada una)' },
      { q: 1, u: 'ud', n: 'limón en rodajas' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 2, u: 'ud', n: 'dientes de ajo laminados' },
      { q: null, u: '', n: 'Sal gruesa, pimienta y perejil' }
    ],
    steps: [
      { t: 'Haz tres cortes en cada lomo y sala por dentro y por fuera.' },
      { t: 'Introduce rodajas de limón y ajo en los cortes y en la tripa. Riega con aceite.' },
      { t: 'Precalienta a 180 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 10 minutos, da la vuelta con cuidado y cocina 8 minutos más.', timer: 18 },
      { t: 'Espolvorea perejil fresco y sirve.' }
    ],
    tips: [
      'Comprueba que la dorada cabe en la cesta antes de sazonarla.',
      'La carne está lista cuando se separa fácilmente de la espina central.'
    ],
    tags: ['saludable', 'proteina', 'sin-gluten']
  },

  /* ─────────────────────────  VERDURAS  ───────────────────────── */
  {
    id: 28, name: 'Verduras asadas mediterráneas', emoji: '🥦', category: 'verduras',
    description: 'Pimiento, calabacín, berenjena y cebolla caramelizados. Guarnición todoterreno.',
    prepTime: 12, cookTime: 18, temperature: 190, difficulty: 'Fácil',
    servings: 4, calories: 120, popularity: 91,
    ingredients: [
      { q: 1, u: 'ud', n: 'calabacín' },
      { q: 1, u: 'ud', n: 'berenjena' },
      { q: 1, u: 'ud', n: 'pimiento rojo' },
      { q: 1, u: 'ud', n: 'cebolla' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'hierbas provenzales' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Corta todas las verduras en dados de tamaño similar, unos 2,5 cm.' },
      { t: 'Mézclalas con el aceite, las hierbas, la sal y la pimienta.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 18 minutos agitando la cesta cada 6 minutos.', timer: 18 },
      { t: 'Sirve como guarnición o con un poco de queso feta desmenuzado.' }
    ],
    tips: [
      'La berenjena absorbe mucho aceite: córtala algo más grande que el resto.',
      'Si te sobran, están buenísimas frías en ensalada al día siguiente.'
    ],
    tags: ['saludable', 'vegetariana', 'economica', 'sin-gluten', 'familiar']
  },
  {
    id: 29, name: 'Brócoli crujiente con ajo', emoji: '🥦', category: 'verduras',
    description: 'Los bordes tostados del brócoli son adictivos. Doce minutos y listo.',
    prepTime: 8, cookTime: 12, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 90, popularity: 88,
    ingredients: [
      { q: 400, u: 'g', n: 'brócoli en ramilletes' },
      { q: 1.5, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'ajo en polvo' },
      { q: 1, u: 'cda', n: 'queso parmesano rallado' },
      { q: null, u: '', n: 'Sal, pimienta y zumo de limón' }
    ],
    steps: [
      { t: 'Corta el brócoli en ramilletes pequeños y sécalo bien si lo has lavado.' },
      { t: 'Mézclalo con el aceite, el ajo en polvo, la sal y la pimienta.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 12 minutos agitando la cesta a los 6 minutos.', timer: 12 },
      { t: 'Añade el parmesano y unas gotas de limón antes de servir.' }
    ],
    tips: [
      'Ramilletes pequeños = más superficie tostada.',
      'Si lo prefieres menos seco, cocina 9 minutos en lugar de 12.'
    ],
    tags: ['saludable', 'vegetariana', 'rapida', 'sin-gluten', 'crujiente']
  },
  {
    id: 30, name: 'Calabacín crujiente al parmesano', emoji: '🥒', category: 'verduras',
    description: 'Rodajas de calabacín con costra de pan rallado y queso. Snack vegetal irresistible.',
    prepTime: 10, cookTime: 12, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 140, popularity: 80,
    ingredients: [
      { q: 2, u: 'ud', n: 'calabacines medianos' },
      { q: 60, u: 'g', n: 'pan rallado panko' },
      { q: 40, u: 'g', n: 'queso parmesano rallado' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 1, u: 'cdta', n: 'orégano seco' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Corta el calabacín en rodajas de 1 cm y sécalas con papel.' },
      { t: 'Mezcla el panko con el parmesano, el orégano, la sal y la pimienta.' },
      { t: 'Pasa las rodajas por huevo batido y luego por la mezcla de pan.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y pulveriza aceite.', timer: 3 },
      { t: 'Cocina 12 minutos dando la vuelta a los 6 minutos.', timer: 12 },
      { t: 'Sirve enseguida con salsa de yogur.' }
    ],
    tips: [
      'El calabacín suelta agua: sécalo bien y no lo saltes de la nevera directamente.',
      'Sírvelos recién hechos, pierden el crujiente en pocos minutos.'
    ],
    tags: ['vegetariana', 'crujiente', 'rapida']
  },
  {
    id: 31, name: 'Berenjena con miel de caña', emoji: '🍆', category: 'verduras',
    description: 'La tapa andaluza clásica: bastones de berenjena crujientes con hilo de miel.',
    prepTime: 15, cookTime: 15, temperature: 200, difficulty: 'Media',
    servings: 2, calories: 210, popularity: 75,
    ingredients: [
      { q: 2, u: 'ud', n: 'berenjenas' },
      { q: 200, u: 'ml', n: 'leche' },
      { q: 80, u: 'g', n: 'harina de garbanzo o de trigo' },
      { q: 2, u: 'cda', n: 'miel de caña' },
      { q: null, u: '', n: 'Sal y aceite en espray' }
    ],
    steps: [
      { t: 'Corta las berenjenas en bastones y déjalas en leche con sal 15 minutos.', timer: 15 },
      { t: 'Escúrrelas y pásalas por harina sacudiendo el exceso.' },
      { t: 'Precalienta a 200 °C durante 3 minutos y pulveriza aceite sobre los bastones.', timer: 3 },
      { t: 'Cocina 15 minutos agitando la cesta cada 5 minutos.', timer: 15 },
      { t: 'Sirve con un hilo de miel de caña por encima.' }
    ],
    tips: [
      'El baño en leche quita el amargor y las deja más tiernas por dentro.',
      'Pulveriza aceite en dos veces para que no queden zonas harinosas.'
    ],
    tags: ['vegetariana', 'crujiente', 'economica']
  },
  {
    id: 32, name: 'Champiñones al ajillo', emoji: '🍄', category: 'verduras',
    description: 'Champiñones dorados con ajo y perejil. Guarnición o tapa en 10 minutos.',
    prepTime: 8, cookTime: 10, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 110, popularity: 74,
    ingredients: [
      { q: 400, u: 'g', n: 'champiñones' },
      { q: 3, u: 'ud', n: 'dientes de ajo picados' },
      { q: 1.5, u: 'cda', n: 'aceite de oliva' },
      { q: 2, u: 'cda', n: 'perejil fresco picado' },
      { q: null, u: '', n: 'Sal, pimienta y unas gotas de limón' }
    ],
    steps: [
      { t: 'Limpia los champiñones con un paño y córtalos por la mitad.' },
      { t: 'Mézclalos con el aceite, el ajo, la sal y la pimienta.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 10 minutos agitando a los 5 minutos.', timer: 10 },
      { t: 'Añade el perejil y el limón justo al sacarlos.' }
    ],
    tips: [
      'No los laves bajo el grifo: absorben agua y luego se cuecen en vez de dorarse.',
      'Sueltan líquido al principio; a partir del minuto 6 empiezan a dorarse.'
    ],
    tags: ['saludable', 'vegetariana', 'rapida', 'economica', 'sin-gluten']
  },
  {
    id: 33, name: 'Coles de Bruselas caramelizadas', emoji: '🥬', category: 'verduras',
    description: 'Con un toque de miel y mostaza, hasta quien odia las coles repite.',
    prepTime: 8, cookTime: 15, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 130, popularity: 69,
    ingredients: [
      { q: 400, u: 'g', n: 'coles de Bruselas' },
      { q: 1.5, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cda', n: 'miel' },
      { q: 1, u: 'cdta', n: 'mostaza de Dijon' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Limpia las coles y córtalas por la mitad.' },
      { t: 'Mézclalas con el aceite, la sal y la pimienta.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y cocina 11 minutos agitando a mitad.', timer: 11 },
      { t: 'Mezcla la miel con la mostaza, riega las coles y cocina 4 minutos más.', timer: 4 },
      { t: 'Sirve calientes.' }
    ],
    tips: [
      'Colócalas con la cara cortada hacia abajo: se caramelizan mucho mejor.',
      'El glaseado va al final para que no se queme.'
    ],
    tags: ['saludable', 'vegetariana', 'sin-gluten']
  },
  {
    id: 34, name: 'Garbanzos crujientes especiados', emoji: '🫘', category: 'verduras',
    description: 'Snack proteico y barato que sustituye a las patatas de bolsa.',
    prepTime: 5, cookTime: 15, temperature: 190, difficulty: 'Fácil',
    servings: 4, calories: 160, popularity: 73,
    ingredients: [
      { q: 400, u: 'g', n: 'garbanzos cocidos' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'pimentón ahumado' },
      { q: 0.5, u: 'cdta', n: 'comino molido' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Escurre los garbanzos, enjuágalos y sécalos MUY bien con un paño.' },
      { t: 'Mézclalos con el aceite y las especias.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 15 minutos agitando la cesta cada 5 minutos.', timer: 15 },
      { t: 'Deja enfriar 5 minutos: terminan de endurecerse fuera de la freidora.', timer: 5 }
    ],
    tips: [
      'Si quedan blandos, es que tenían humedad: sécalos aún mejor la próxima vez.',
      'Guárdalos en un bote abierto, no cerrado, o se reblandecen.'
    ],
    tags: ['saludable', 'vegetariana', 'economica', 'proteina', 'crujiente', 'sin-gluten']
  },
  {
    id: 35, name: 'Tofu crujiente marinado', emoji: '🌱', category: 'verduras',
    description: 'Dados de tofu dorados por fuera y tiernos por dentro, con marinada de soja y sésamo.',
    prepTime: 15, cookTime: 15, temperature: 190, difficulty: 'Media',
    servings: 2, calories: 190, popularity: 64,
    ingredients: [
      { q: 400, u: 'g', n: 'tofu firme' },
      { q: 2, u: 'cda', n: 'salsa de soja' },
      { q: 1, u: 'cda', n: 'maicena' },
      { q: 1, u: 'cdta', n: 'aceite de sésamo' },
      { q: 1, u: 'cdta', n: 'ajo en polvo' },
      { q: 1, u: 'cda', n: 'semillas de sésamo' }
    ],
    steps: [
      { t: 'Prensa el tofu 10 minutos con un peso encima para eliminar el agua.', timer: 10 },
      { t: 'Córtalo en dados de 2 cm y mézclalo con la soja, el aceite de sésamo y el ajo.' },
      { t: 'Espolvorea la maicena y remueve con suavidad hasta cubrirlo.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y cocina 15 minutos agitando cada 5 minutos.', timer: 15 },
      { t: 'Espolvorea sésamo y sirve con arroz o noodles.' }
    ],
    tips: [
      'La maicena es lo que crea la costra crujiente: no la sustituyas por harina.',
      'Prensar el tofu es imprescindible, si no queda esponjoso y sin color.'
    ],
    tags: ['saludable', 'vegetariana', 'proteina', 'crujiente']
  },

  /* ─────────────────────────  SNACKS  ───────────────────────── */
  {
    id: 36, name: 'Croquetas crujientes', emoji: '🥟', category: 'snacks',
    description: 'Croquetas caseras o congeladas doradas sin sartén y sin salpicaduras.',
    prepTime: 10, cookTime: 10, temperature: 200, difficulty: 'Fácil',
    servings: 4, calories: 300, popularity: 92,
    ingredients: [
      { q: 16, u: 'ud', n: 'croquetas ya empanadas' },
      { q: null, u: '', n: 'Aceite en espray' }
    ],
    steps: [
      { t: 'Precalienta la air fryer a 200 °C durante 4 minutos.', timer: 4 },
      { t: 'Coloca las croquetas separadas entre sí, sin amontonar.' },
      { t: 'Pulveriza aceite por toda la superficie del rebozado.' },
      { t: 'Cocina 10 minutos dando la vuelta a los 5 minutos.', timer: 10 },
      { t: 'Deja templar 2 minutos: el interior está ardiendo.', timer: 2 }
    ],
    tips: [
      'Si son congeladas, van directas sin descongelar (añade 2-3 minutos).',
      'Un buen precalentado evita que se abran y pierdan la bechamel.'
    ],
    tags: ['rapida', 'familiar', 'crujiente']
  },
  {
    id: 37, name: 'Empanadillas de atún', emoji: '🐟', category: 'snacks',
    description: 'Empanadillas doradas y hojaldradas sin aceite de freír. Ideales para llevar.',
    prepTime: 20, cookTime: 12, temperature: 180, difficulty: 'Media',
    servings: 4, calories: 280, popularity: 81,
    ingredients: [
      { q: 12, u: 'ud', n: 'obleas para empanadillas' },
      { q: 160, u: 'g', n: 'atún en conserva escurrido' },
      { q: 150, u: 'ml', n: 'tomate frito' },
      { q: 2, u: 'ud', n: 'huevos cocidos picados' },
      { q: 1, u: 'ud', n: 'huevo batido para pintar' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Mezcla el atún con el tomate frito y el huevo cocido. Salpimienta.' },
      { t: 'Rellena las obleas sin pasarte y ciérralas sellando el borde con un tenedor.' },
      { t: 'Pinta la superficie con huevo batido.' },
      { t: 'Precalienta a 180 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 12 minutos dando la vuelta a los 7 minutos.', timer: 12 },
      { t: 'Deja templar antes de servir.' }
    ],
    tips: [
      'Sella muy bien los bordes: el aire caliente circula fuerte y las abre.',
      'Coloca papel de air fryer perforado para que no se peguen.'
    ],
    tags: ['familiar', 'economica']
  },
  {
    id: 38, name: 'Quesadillas de pollo y queso', emoji: '🌮', category: 'snacks',
    description: 'Tortilla crujiente con queso fundido y pollo. Cena rápida en 8 minutos.',
    prepTime: 10, cookTime: 8, temperature: 180, difficulty: 'Fácil',
    servings: 2, calories: 380, popularity: 85,
    ingredients: [
      { q: 4, u: 'ud', n: 'tortillas de trigo' },
      { q: 200, u: 'g', n: 'pollo cocinado desmenuzado' },
      { q: 150, u: 'g', n: 'queso rallado para fundir' },
      { q: 0.5, u: 'ud', n: 'pimiento rojo en tiras finas' },
      { q: 0.5, u: 'cdta', n: 'comino molido' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Reparte el pollo, el queso y el pimiento sobre dos tortillas. Sazona con comino, sal y pimienta.' },
      { t: 'Cubre con las otras dos tortillas presionando bien.' },
      { t: 'Precalienta a 180 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 8 minutos dando la vuelta a los 4 minutos.', timer: 8 },
      { t: 'Corta en triángulos y sirve con guacamole.' }
    ],
    tips: [
      'Sujeta la tortilla superior con un par de palillos: el aire la levanta.',
      'Aprovecha restos de pollo asado del día anterior.'
    ],
    tags: ['rapida', 'familiar', 'proteina']
  },
  {
    id: 39, name: 'Mozzarella sticks', emoji: '🧀', category: 'snacks',
    description: 'Palitos de mozzarella con doble rebozado y queso fundido en el interior.',
    prepTime: 15, cookTime: 7, temperature: 200, difficulty: 'Media',
    servings: 2, calories: 310, popularity: 86,
    ingredients: [
      { q: 8, u: 'ud', n: 'palitos de mozzarella' },
      { q: 60, u: 'g', n: 'harina' },
      { q: 2, u: 'ud', n: 'huevos' },
      { q: 120, u: 'g', n: 'pan rallado panko' },
      { q: 1, u: 'cdta', n: 'orégano seco' },
      { q: null, u: '', n: 'Aceite en espray' }
    ],
    steps: [
      { t: 'Pasa los palitos por harina, huevo y panko con orégano. Repite huevo y panko para doble capa.' },
      { t: 'Congélalos al menos 30 minutos (paso imprescindible).', timer: 30 },
      { t: 'Precalienta a 200 °C durante 3 minutos.', timer: 3 },
      { t: 'Pulveriza aceite y cocina 7 minutos, dando la vuelta a los 4 minutos.', timer: 7 },
      { t: 'Sirve inmediatamente con salsa de tomate.' }
    ],
    tips: [
      'Sin congelar previamente, el queso se escapa y se derrite en la cesta.',
      'No te pases de 7-8 minutos: pasado ese punto revientan.'
    ],
    tags: ['vegetariana', 'crujiente', 'familiar']
  },
  {
    id: 40, name: 'Pan de ajo con perejil', emoji: '🥖', category: 'snacks',
    description: 'Acompañamiento crujiente y aromático listo en 6 minutos.',
    prepTime: 5, cookTime: 6, temperature: 180, difficulty: 'Fácil',
    servings: 4, calories: 190, popularity: 84,
    ingredients: [
      { q: 1, u: 'ud', n: 'barra de pan' },
      { q: 60, u: 'g', n: 'mantequilla a temperatura ambiente' },
      { q: 3, u: 'ud', n: 'dientes de ajo picados' },
      { q: 3, u: 'cda', n: 'perejil fresco picado' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Mezcla la mantequilla con el ajo, el perejil y la sal.' },
      { t: 'Abre el pan por la mitad y unta la mezcla generosamente.' },
      { t: 'Precalienta a 180 °C durante 2 minutos.', timer: 2 },
      { t: 'Cocina 6 minutos con la parte untada hacia arriba.', timer: 6 },
      { t: 'Corta en porciones y sirve caliente.' }
    ],
    tips: [
      'Corta el pan al tamaño de tu cesta antes de untarlo.',
      'Con un poco de mozzarella por encima se convierte en pan de ajo con queso.'
    ],
    tags: ['economica', 'rapida', 'vegetariana', 'familiar']
  },
  {
    id: 41, name: 'Aros de cebolla crujientes', emoji: '🧅', category: 'snacks',
    description: 'Aros dorados con rebozado de panko y pimentón, sin freidora de aceite.',
    prepTime: 15, cookTime: 12, temperature: 190, difficulty: 'Media',
    servings: 2, calories: 250, popularity: 72,
    ingredients: [
      { q: 2, u: 'ud', n: 'cebollas grandes' },
      { q: 80, u: 'g', n: 'harina' },
      { q: 2, u: 'ud', n: 'huevos' },
      { q: 120, u: 'g', n: 'pan rallado panko' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: null, u: '', n: 'Sal y aceite en espray' }
    ],
    steps: [
      { t: 'Corta las cebollas en aros de 1 cm y sepáralos.' },
      { t: 'Pásalos por harina, huevo batido y panko con pimentón y sal.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Pulveriza aceite y cocina 12 minutos dando la vuelta a los 6 minutos.', timer: 12 },
      { t: 'Sirve con salsa barbacoa o alioli.' }
    ],
    tips: [
      'Cocina en una sola capa: apilados quedan blandos.',
      'Aros de grosor similar para que se hagan a la vez.'
    ],
    tags: ['vegetariana', 'crujiente', 'economica']
  },
  {
    id: 42, name: 'Tostadas de tomate y aceite', emoji: '🍅', category: 'snacks',
    description: 'El desayuno español perfecto: pan bien tostado, tomate y buen aceite de oliva.',
    prepTime: 5, cookTime: 5, temperature: 180, difficulty: 'Fácil',
    servings: 2, calories: 180, popularity: 78,
    ingredients: [
      { q: 4, u: 'ud', n: 'rebanadas de pan' },
      { q: 2, u: 'ud', n: 'tomates maduros rallados' },
      { q: 2, u: 'cda', n: 'aceite de oliva virgen extra' },
      { q: 1, u: 'ud', n: 'diente de ajo (opcional)' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Coloca las rebanadas en la cesta sin superponerlas.' },
      { t: 'Tuesta a 180 °C durante 5 minutos, dando la vuelta a los 3 minutos.', timer: 5 },
      { t: 'Frota el ajo sobre el pan caliente si te gusta.' },
      { t: 'Cubre con tomate rallado, sal y un buen chorro de aceite.' }
    ],
    tips: [
      'El pan del día anterior tuesta mejor que el recién hecho.',
      'Vigila los últimos minutos: el pan pasa de dorado a quemado muy rápido.'
    ],
    tags: ['economica', 'rapida', 'vegetariana', 'saludable']
  },

  /* ─────────────────────────  PIZZA  ───────────────────────── */
  {
    id: 43, name: 'Pizza casera', emoji: '🍕', category: 'pizza',
    description: 'Base fina y crujiente con queso burbujeante. Diez minutos desde la masa.',
    prepTime: 15, cookTime: 10, temperature: 180, difficulty: 'Media',
    servings: 2, calories: 480, popularity: 94,
    ingredients: [
      { q: 1, u: 'ud', n: 'base de pizza pequeña (o masa casera)' },
      { q: 4, u: 'cda', n: 'salsa de tomate' },
      { q: 150, u: 'g', n: 'mozzarella rallada' },
      { q: 60, u: 'g', n: 'ingredientes al gusto (jamón, champiñones, aceitunas…)' },
      { q: 1, u: 'cdta', n: 'orégano seco' },
      { q: 1, u: 'cda', n: 'aceite de oliva' }
    ],
    steps: [
      { t: 'Ajusta la base al tamaño de tu cesta, dejando 1 cm de margen alrededor.' },
      { t: 'Precalienta a 180 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina la base sola 3 minutos para que no quede cruda por debajo.', timer: 3 },
      { t: 'Añade el tomate, el queso, los ingredientes y el orégano.' },
      { t: 'Cocina 7 minutos más hasta que el queso burbujee y los bordes estén dorados.', timer: 7 },
      { t: 'Riega con un hilo de aceite y sirve.' }
    ],
    tips: [
      'Precocinar la base sola es el truco para que no quede húmeda en el centro.',
      'No cargues demasiado de tomate: la humedad arruina la base.'
    ],
    tags: ['familiar', 'vegetariana']
  },
  {
    id: 44, name: 'Pizza exprés de tortilla', emoji: '🍕', category: 'pizza',
    description: 'Con una tortilla de trigo tienes una pizza ultrafina y crujiente en 8 minutos.',
    prepTime: 5, cookTime: 8, temperature: 180, difficulty: 'Fácil',
    servings: 1, calories: 350, popularity: 82,
    ingredients: [
      { q: 1, u: 'ud', n: 'tortilla de trigo' },
      { q: 3, u: 'cda', n: 'salsa de tomate' },
      { q: 80, u: 'g', n: 'mozzarella rallada' },
      { q: 40, u: 'g', n: 'jamón York o pepperoni' },
      { q: 1, u: 'cdta', n: 'orégano seco' }
    ],
    steps: [
      { t: 'Precalienta a 180 °C durante 2 minutos.', timer: 2 },
      { t: 'Coloca la tortilla y cocínala 2 minutos sola para que endurezca.', timer: 2 },
      { t: 'Añade el tomate, el queso, el fiambre y el orégano.' },
      { t: 'Cocina 6 minutos más hasta que el queso se funda y los bordes estén crujientes.', timer: 6 },
      { t: 'Corta en cuatro porciones y sirve.' }
    ],
    tips: [
      'Sujeta los bordes con el propio queso para que el aire no levante la tortilla.',
      'Perfecta para una cena individual sin planificación.'
    ],
    tags: ['rapida', 'economica', 'familiar']
  },
  {
    id: 45, name: 'Calzone de jamón y queso', emoji: '🌙', category: 'pizza',
    description: 'Masa cerrada, rellena y dorada por fuera. Como el de la pizzería, pero en casa.',
    prepTime: 15, cookTime: 12, temperature: 180, difficulty: 'Media',
    servings: 2, calories: 430, popularity: 71,
    ingredients: [
      { q: 1, u: 'ud', n: 'masa de pizza' },
      { q: 120, u: 'g', n: 'mozzarella' },
      { q: 100, u: 'g', n: 'jamón cocido en dados' },
      { q: 3, u: 'cda', n: 'salsa de tomate' },
      { q: 1, u: 'ud', n: 'huevo batido para pintar' },
      { q: 1, u: 'cdta', n: 'orégano seco' }
    ],
    steps: [
      { t: 'Divide la masa en dos y estírala en círculos.' },
      { t: 'Rellena media superficie con tomate, queso, jamón y orégano dejando un borde libre.' },
      { t: 'Cierra en media luna y sella el borde presionando con un tenedor. Pinta con huevo.' },
      { t: 'Precalienta a 180 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 12 minutos dando la vuelta a los 8 minutos.', timer: 12 },
      { t: 'Deja templar 3 minutos antes de morder.', timer: 3 }
    ],
    tips: [
      'Haz dos cortes pequeños arriba para que salga el vapor y no reviente.',
      'No lo rellenes en exceso o se abrirá durante la cocción.'
    ],
    tags: ['familiar']
  },

  /* ─────────────────────────  HUEVOS  ───────────────────────── */
  {
    id: 46, name: 'Huevos cocidos perfectos', emoji: '🥚', category: 'huevos',
    description: 'Sin agua, sin cáscaras rotas y siempre con el mismo punto exacto.',
    prepTime: 1, cookTime: 15, temperature: 140, difficulty: 'Fácil',
    servings: 4, calories: 78, popularity: 90,
    ingredients: [
      { q: 6, u: 'ud', n: 'huevos' },
      { q: null, u: '', n: 'Agua con hielo para enfriar' }
    ],
    steps: [
      { t: 'Coloca los huevos directamente en la cesta, sin agua ni aceite.' },
      { t: 'Cocina a 140 °C: 11 min (yema líquida), 13 min (mollet) o 15 min (duro).', timer: 15 },
      { t: 'Pásalos inmediatamente a un bol con agua y hielo durante 5 minutos.', timer: 5 },
      { t: 'Pélalos empezando por la parte más ancha.' }
    ],
    tips: [
      'El baño de hielo corta la cocción y hace que se pelen sin pelearse con la cáscara.',
      'Cada air fryer varía: prueba primero con un huevo para calibrar tu tiempo.'
    ],
    tags: ['economica', 'rapida', 'proteina', 'saludable', 'vegetariana', 'sin-gluten']
  },
  {
    id: 47, name: 'Huevos al plato con espinacas', emoji: '🍳', category: 'huevos',
    description: 'Huevos cuajados sobre un lecho de espinacas y tomate. Desayuno o cena completa.',
    prepTime: 8, cookTime: 12, temperature: 160, difficulty: 'Fácil',
    servings: 2, calories: 220, popularity: 76,
    ingredients: [
      { q: 4, u: 'ud', n: 'huevos' },
      { q: 150, u: 'g', n: 'espinacas frescas' },
      { q: 150, u: 'ml', n: 'tomate triturado' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 50, u: 'g', n: 'queso feta desmenuzado' },
      { q: null, u: '', n: 'Sal, pimienta y pimentón' }
    ],
    steps: [
      { t: 'Reparte el tomate y las espinacas en dos moldes aptos para air fryer, con el aceite y la sal.' },
      { t: 'Precalienta a 160 °C durante 3 minutos y cocina los moldes 4 minutos.', timer: 4 },
      { t: 'Haz un hueco, casca dos huevos en cada molde y añade el feta.' },
      { t: 'Cocina 8 minutos más, o hasta que la clara cuaje y la yema quede a tu gusto.', timer: 8 },
      { t: 'Espolvorea pimentón y pimienta y sirve con pan.' }
    ],
    tips: [
      'A 160 °C la clara cuaja sin que la yema se endurezca.',
      'Vigila a partir del minuto 6 si te gusta la yema muy líquida.'
    ],
    tags: ['saludable', 'proteina', 'vegetariana', 'rapida']
  },
  {
    id: 48, name: 'Tortilla de patatas jugosa', emoji: '🥔', category: 'huevos',
    description: 'La tortilla española adaptada a la air fryer: menos aceite y sin darle la vuelta.',
    prepTime: 20, cookTime: 25, temperature: 160, difficulty: 'Difícil',
    servings: 4, calories: 320, popularity: 79,
    ingredients: [
      { q: 600, u: 'g', n: 'patatas' },
      { q: 6, u: 'ud', n: 'huevos' },
      { q: 1, u: 'ud', n: 'cebolla' },
      { q: 3, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Corta las patatas en láminas finas y la cebolla en juliana. Mézclalas con 2 cucharadas de aceite y sal.' },
      { t: 'Cocina a 180 °C durante 15 minutos agitando cada 5 minutos, hasta que estén tiernas.', timer: 15 },
      { t: 'Bate los huevos con sal, añade las patatas calientes y deja reposar 5 minutos.', timer: 5 },
      { t: 'Engrasa un molde y vierte la mezcla.' },
      { t: 'Cocina a 160 °C durante 25 minutos, comprobando el centro a partir del minuto 18.', timer: 25 },
      { t: 'Deja reposar 5 minutos y desmolda sobre un plato.', timer: 5 }
    ],
    tips: [
      'El molde debe caber holgado y dejar circular el aire alrededor.',
      'Si la quieres poco cuajada, retírala en cuanto el centro tiemble ligeramente.',
      'Cubre con papel de aluminio si la superficie se dora demasiado pronto.'
    ],
    tags: ['economica', 'familiar', 'vegetariana', 'proteina', 'sin-gluten']
  },

  /* ─────────────────────────  POSTRES  ───────────────────────── */
  {
    id: 49, name: 'Manzana asada con canela', emoji: '🍎', category: 'postres',
    description: 'Postre sencillo, ligero y reconfortante. Solo tres ingredientes.',
    prepTime: 8, cookTime: 12, temperature: 180, difficulty: 'Fácil',
    servings: 2, calories: 150, popularity: 83,
    ingredients: [
      { q: 2, u: 'ud', n: 'manzanas' },
      { q: 1, u: 'cdta', n: 'canela molida' },
      { q: 1, u: 'cda', n: 'miel o azúcar moreno' },
      { q: 10, u: 'g', n: 'mantequilla (opcional)' },
      { q: 20, u: 'g', n: 'nueces picadas (opcional)' }
    ],
    steps: [
      { t: 'Descorazona las manzanas sin llegar a atravesarlas.' },
      { t: 'Rellena el hueco con la miel, la canela, la mantequilla y las nueces.' },
      { t: 'Precalienta a 180 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 12 minutos hasta que estén tiernas al pincharlas.', timer: 12 },
      { t: 'Sirve templadas, solas o con una bola de helado de vainilla.' }
    ],
    tips: [
      'Variedades como la Golden o la Reineta aguantan mejor el asado.',
      'Un poco de zumo de limón evita que se oscurezcan mientras las preparas.'
    ],
    tags: ['saludable', 'economica', 'vegetariana', 'rapida', 'sin-gluten']
  },
  {
    id: 50, name: 'Brownie de chocolate', emoji: '🍫', category: 'postres',
    description: 'Denso, húmedo y con la superficie craquelada. En molde pequeño, para 4.',
    prepTime: 15, cookTime: 22, temperature: 160, difficulty: 'Media',
    servings: 4, calories: 340, popularity: 91,
    ingredients: [
      { q: 120, u: 'g', n: 'chocolate negro' },
      { q: 80, u: 'g', n: 'mantequilla' },
      { q: 100, u: 'g', n: 'azúcar' },
      { q: 2, u: 'ud', n: 'huevos' },
      { q: 60, u: 'g', n: 'harina' },
      { q: 40, u: 'g', n: 'nueces (opcional)' },
      { q: 1, u: 'pizca', n: 'sal' }
    ],
    steps: [
      { t: 'Funde el chocolate con la mantequilla al baño maría o en el microondas y deja templar.' },
      { t: 'Bate los huevos con el azúcar hasta que blanqueen y añade el chocolate.' },
      { t: 'Incorpora la harina tamizada y la sal con movimientos envolventes. Añade las nueces.' },
      { t: 'Vierte en un molde engrasado que quepa en la cesta.' },
      { t: 'Cocina a 160 °C durante 22 minutos. El centro debe quedar ligeramente húmedo.', timer: 22 },
      { t: 'Deja enfriar 15 minutos antes de cortar.', timer: 15 }
    ],
    tips: [
      'Es normal que al sacarlo parezca poco hecho: cuaja al enfriarse.',
      'Cubre con papel de aluminio si se dora demasiado por arriba.',
      'Nunca superes los 165 °C o se quemará la superficie antes de cocerse el centro.'
    ],
    tags: ['vegetariana', 'familiar']
  },
  {
    id: 51, name: 'Cookies de chocolate', emoji: '🍪', category: 'postres',
    description: 'Crujientes por fuera y tiernas por dentro, listas en 10 minutos por tanda.',
    prepTime: 15, cookTime: 10, temperature: 160, difficulty: 'Fácil',
    servings: 6, calories: 190, popularity: 88,
    ingredients: [
      { q: 120, u: 'g', n: 'harina' },
      { q: 80, u: 'g', n: 'mantequilla en pomada' },
      { q: 70, u: 'g', n: 'azúcar moreno' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 100, u: 'g', n: 'pepitas de chocolate' },
      { q: 0.5, u: 'cdta', n: 'levadura química' },
      { q: 1, u: 'pizca', n: 'sal' }
    ],
    steps: [
      { t: 'Bate la mantequilla con el azúcar hasta que quede cremosa y añade el huevo.' },
      { t: 'Incorpora la harina, la levadura y la sal, y por último las pepitas.' },
      { t: 'Refrigera la masa 15 minutos.', timer: 15 },
      { t: 'Forma bolas y aplánalas ligeramente sobre papel de air fryer, muy separadas.' },
      { t: 'Cocina a 160 °C durante 10 minutos.', timer: 10 },
      { t: 'Déjalas enfriar sobre una rejilla 10 minutos: al salir están blandas.', timer: 10 }
    ],
    tips: [
      'Se expanden mucho: no pongas más de 4 por tanda.',
      'Enfriar la masa evita que se extiendan demasiado.'
    ],
    tags: ['vegetariana', 'familiar', 'rapida']
  },
  {
    id: 52, name: 'Donuts glaseados', emoji: '🍩', category: 'postres',
    description: 'Donuts esponjosos con glaseado de azúcar, hechos con masa de hojaldre o brioche.',
    prepTime: 20, cookTime: 8, temperature: 180, difficulty: 'Media',
    servings: 4, calories: 260, popularity: 80,
    ingredients: [
      { q: 1, u: 'ud', n: 'lámina de masa de hojaldre o brioche' },
      { q: 20, u: 'g', n: 'mantequilla derretida' },
      { q: 100, u: 'g', n: 'azúcar glas' },
      { q: 2, u: 'cda', n: 'leche' },
      { q: 0.5, u: 'cdta', n: 'extracto de vainilla' }
    ],
    steps: [
      { t: 'Corta la masa con un cortador redondo y haz el agujero central con uno más pequeño.' },
      { t: 'Precalienta a 180 °C durante 3 minutos.', timer: 3 },
      { t: 'Pinta los donuts con mantequilla derretida y colócalos separados.' },
      { t: 'Cocina 8 minutos dando la vuelta a los 5 minutos.', timer: 8 },
      { t: 'Mezcla el azúcar glas con la leche y la vainilla y baña los donuts templados.' },
      { t: 'Deja secar el glaseado 10 minutos.', timer: 10 }
    ],
    tips: [
      'No tires los agujeritos centrales: son los mejores bocados.',
      'Glasea cuando estén templados, no calientes, o el glaseado se derretirá.'
    ],
    tags: ['vegetariana', 'familiar']
  },
  {
    id: 53, name: 'Torrijas', emoji: '🍞', category: 'postres',
    description: 'El postre de Semana Santa con mucho menos aceite y el mismo crujiente dorado.',
    prepTime: 15, cookTime: 10, temperature: 180, difficulty: 'Media',
    servings: 4, calories: 290, popularity: 75,
    ingredients: [
      { q: 8, u: 'ud', n: 'rebanadas de pan de torrija' },
      { q: 500, u: 'ml', n: 'leche' },
      { q: 1, u: 'ud', n: 'rama de canela' },
      { q: 1, u: 'ud', n: 'piel de limón' },
      { q: 60, u: 'g', n: 'azúcar' },
      { q: 2, u: 'ud', n: 'huevos' },
      { q: 1, u: 'cdta', n: 'canela molida para espolvorear' }
    ],
    steps: [
      { t: 'Calienta la leche con la canela en rama, la piel de limón y la mitad del azúcar. Deja infusionar 10 minutos.', timer: 10 },
      { t: 'Empapa las rebanadas en la leche colada sin que se rompan y escúrrelas sobre una rejilla.' },
      { t: 'Pásalas por huevo batido.' },
      { t: 'Precalienta a 180 °C durante 3 minutos y forra la cesta con papel de air fryer.', timer: 3 },
      { t: 'Cocina 10 minutos dando la vuelta con cuidado a los 6 minutos.', timer: 10 },
      { t: 'Espolvorea con el azúcar restante mezclado con canela.' }
    ],
    tips: [
      'Escurre bien antes de rebozar o quedarán blandas por dentro.',
      'Usa una espátula ancha para girarlas sin romperlas.'
    ],
    tags: ['vegetariana', 'familiar', 'economica']
  },
  {
    id: 54, name: 'Plátano caramelizado', emoji: '🍌', category: 'postres',
    description: 'Postre exprés de dos ingredientes, dulce y con textura de caramelo.',
    prepTime: 5, cookTime: 8, temperature: 180, difficulty: 'Fácil',
    servings: 2, calories: 160, popularity: 70,
    ingredients: [
      { q: 2, u: 'ud', n: 'plátanos maduros' },
      { q: 1, u: 'cda', n: 'azúcar moreno' },
      { q: 0.5, u: 'cdta', n: 'canela molida' },
      { q: 10, u: 'g', n: 'mantequilla' }
    ],
    steps: [
      { t: 'Corta los plátanos por la mitad a lo largo.' },
      { t: 'Espolvorea el azúcar y la canela y pon unos puntitos de mantequilla.' },
      { t: 'Precalienta a 180 °C durante 2 minutos.', timer: 2 },
      { t: 'Cocina 8 minutos sin darles la vuelta.', timer: 8 },
      { t: 'Sirve con yogur griego o helado.' }
    ],
    tips: [
      'Cuanto más maduro el plátano, más se caramelizará.',
      'Usa papel de air fryer: el azúcar fundido se pega mucho.'
    ],
    tags: ['rapida', 'economica', 'vegetariana', 'saludable', 'sin-gluten']
  },
  {
    id: 55, name: 'Churros caseros', emoji: '🥨', category: 'postres',
    description: 'Churros con su forma estriada clásica y azúcar por encima, sin freidora de aceite.',
    prepTime: 20, cookTime: 12, temperature: 190, difficulty: 'Difícil',
    servings: 4, calories: 280, popularity: 77,
    ingredients: [
      { q: 250, u: 'ml', n: 'agua' },
      { q: 150, u: 'g', n: 'harina' },
      { q: 30, u: 'g', n: 'mantequilla' },
      { q: 1, u: 'pizca', n: 'sal' },
      { q: 50, u: 'g', n: 'azúcar para rebozar' },
      { q: null, u: '', n: 'Aceite en espray' }
    ],
    steps: [
      { t: 'Hierve el agua con la mantequilla y la sal. Retira del fuego y añade la harina de golpe.' },
      { t: 'Remueve enérgicamente hasta formar una masa que se despegue de las paredes. Deja templar 10 minutos.', timer: 10 },
      { t: 'Pon la masa en una manga con boquilla de estrella y forma churros de 10 cm sobre papel.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y pulveriza aceite sobre los churros.', timer: 3 },
      { t: 'Cocina 12 minutos dando la vuelta a los 7 minutos.', timer: 12 },
      { t: 'Rebózalos en azúcar en caliente y sirve con chocolate.' }
    ],
    tips: [
      'La boquilla de estrella no es decorativa: las estrías ayudan a que se cocinen por dentro.',
      'Trabaja la masa aún templada, si se enfría cuesta mucho manejarla.',
      'No los amontones o se pegarán entre sí.'
    ],
    tags: ['vegetariana', 'familiar', 'economica']
  },

  /* ─────────────  POLLO (ampliación)  ───────────── */
  {
    id: 56, name: 'Pollo asado entero', emoji: '🍗', category: 'pollo',
    description: 'Un pollo entero con la piel dorada y crujiente y la carne jugosa. Comida de domingo.',
    prepTime: 15, cookTime: 50, temperature: 180, difficulty: 'Media',
    servings: 4, calories: 420, popularity: 89,
    ingredients: [
      { q: 1, u: 'ud', n: 'pollo entero de 1,2 kg' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: 1, u: 'cdta', n: 'ajo en polvo' },
      { q: 1, u: 'cdta', n: 'tomillo seco' },
      { q: 1, u: 'ud', n: 'limón' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Seca el pollo por dentro y por fuera y átale las patas con hilo de cocina.' },
      { t: 'Mezcla el aceite con las especias, la sal y la pimienta y frota bien toda la piel.' },
      { t: 'Mete el limón partido dentro del pollo.' },
      { t: 'Precalienta a 180 °C durante 5 minutos.', timer: 5 },
      { t: 'Cocina 30 minutos con la pechuga hacia abajo.', timer: 30 },
      { t: 'Dale la vuelta y cocina 20 minutos más con la pechuga hacia arriba.', timer: 20 },
      { t: 'Comprueba que el muslo alcanza 75 °C y deja reposar 10 minutos antes de trinchar.', timer: 10 }
    ],
    tips: [
      'Mide tu cesta antes de comprar el pollo: por encima de 1,4 kg rara vez cabe.',
      'Empezar boca abajo mantiene la pechuga jugosa mientras se hace el muslo.',
      'Si la piel se dora demasiado pronto, cúbrela con papel de aluminio.'
    ],
    tags: ['proteina', 'familiar', 'sin-gluten']
  },
  {
    id: 57, name: 'Pechuga rellena de jamón y queso', emoji: '🍖', category: 'pollo',
    description: 'Estilo cordon bleu: rebozado crujiente por fuera y queso fundido en el interior.',
    prepTime: 15, cookTime: 18, temperature: 190, difficulty: 'Media',
    servings: 2, calories: 390, popularity: 82,
    ingredients: [
      { q: 2, u: 'ud', n: 'pechugas de pollo' },
      { q: 4, u: 'ud', n: 'lonchas de jamón cocido' },
      { q: 4, u: 'ud', n: 'lonchas de queso' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 60, u: 'g', n: 'harina' },
      { q: 100, u: 'g', n: 'pan rallado panko' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Abre las pechugas por la mitad tipo libro y golpéalas con cuidado para aplanarlas.' },
      { t: 'Salpimienta, coloca el jamón y el queso dentro y ciérralas sujetando con palillos.' },
      { t: 'Pásalas por harina, huevo batido y panko presionando bien.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y pulveriza aceite por ambas caras.', timer: 3 },
      { t: 'Cocina 10 minutos, da la vuelta y cocina 8 minutos más.', timer: 18 },
      { t: 'Retira los palillos y deja reposar 3 minutos antes de cortar.', timer: 3 }
    ],
    tips: [
      'No te pases de relleno o el queso se escapará y se quemará en la cesta.',
      'Sella bien los bordes presionando con los dedos antes de rebozar.'
    ],
    tags: ['proteina', 'crujiente', 'familiar']
  },
  {
    id: 58, name: 'Pollo tikka al yogur', emoji: '🍛', category: 'pollo',
    description: 'Dados de pollo marinados en yogur y especias, tiernos y con los bordes tostados.',
    prepTime: 15, cookTime: 16, temperature: 200, difficulty: 'Fácil',
    servings: 2, calories: 280, popularity: 78,
    ingredients: [
      { q: 400, u: 'g', n: 'pechuga de pollo en dados' },
      { q: 150, u: 'g', n: 'yogur natural' },
      { q: 1, u: 'cdta', n: 'curry en polvo' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: 0.5, u: 'cdta', n: 'comino molido' },
      { q: 1, u: 'ud', n: 'diente de ajo rallado' },
      { q: 1, u: 'cda', n: 'zumo de limón' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Mezcla el yogur con todas las especias, el ajo, el limón y la sal.' },
      { t: 'Marina el pollo al menos 15 minutos (mejor 2 horas en la nevera).', timer: 15 },
      { t: 'Escurre el exceso de marinada: solo debe quedar una capa fina.' },
      { t: 'Precalienta a 200 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 16 minutos agitando la cesta cada 5 minutos.', timer: 16 },
      { t: 'Sirve con arroz basmati y una salsa de yogur y pepino.' }
    ],
    tips: [
      'El yogur ablanda la carne: cuanto más tiempo marine, más jugoso queda.',
      'Con demasiada marinada el pollo se cuece en vez de tostarse.'
    ],
    tags: ['proteina', 'saludable', 'rapida', 'sin-gluten']
  },
  {
    id: 59, name: 'Shawarma de pollo', emoji: '🌯', category: 'pollo',
    description: 'Tiras especiadas al estilo de Oriente Medio para montar en pan de pita.',
    prepTime: 20, cookTime: 18, temperature: 200, difficulty: 'Media',
    servings: 4, calories: 340, popularity: 80,
    ingredients: [
      { q: 600, u: 'g', n: 'contramuslos de pollo en tiras' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'comino molido' },
      { q: 1, u: 'cdta', n: 'cúrcuma' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: 0.5, u: 'cdta', n: 'canela molida' },
      { q: 1, u: 'cda', n: 'zumo de limón' },
      { q: 4, u: 'ud', n: 'panes de pita' },
      { q: null, u: '', n: 'Sal, pimienta, salsa de yogur y verduras para montar' }
    ],
    steps: [
      { t: 'Mezcla el aceite con todas las especias, el limón, la sal y la pimienta.' },
      { t: 'Marina las tiras de pollo 15 minutos.', timer: 15 },
      { t: 'Precalienta a 200 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 18 minutos agitando la cesta cada 6 minutos, hasta que los bordes estén tostados.', timer: 18 },
      { t: 'Calienta los panes de pita 2 minutos a 160 °C.', timer: 2 },
      { t: 'Monta con salsa de yogur, tomate, cebolla y lechuga.' }
    ],
    tips: [
      'El contramuslo aguanta mejor que la pechuga en cocciones especiadas y queda más jugoso.',
      'Corta las tiras finas para maximizar los bordes crujientes.'
    ],
    tags: ['proteina', 'familiar']
  },
  {
    id: 60, name: 'Alitas al ajillo y parmesano', emoji: '🧄', category: 'pollo',
    description: 'La versión blanca de las alitas: mantequilla de ajo, parmesano y perejil.',
    prepTime: 10, cookTime: 22, temperature: 200, difficulty: 'Fácil',
    servings: 2, calories: 340, popularity: 84,
    ingredients: [
      { q: 700, u: 'g', n: 'alitas de pollo partidas' },
      { q: 30, u: 'g', n: 'mantequilla' },
      { q: 3, u: 'ud', n: 'dientes de ajo picados' },
      { q: 40, u: 'g', n: 'queso parmesano rallado' },
      { q: 2, u: 'cda', n: 'perejil fresco picado' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Seca muy bien las alitas y salpimiéntalas.' },
      { t: 'Precalienta a 200 °C durante 3 minutos y cocina 22 minutos dando la vuelta a los 12 minutos.', timer: 22 },
      { t: 'Mientras, derrite la mantequilla con el ajo picado a fuego suave 2 minutos.', timer: 2 },
      { t: 'Mezcla las alitas calientes con la mantequilla de ajo.' },
      { t: 'Añade el parmesano y el perejil y remueve hasta cubrirlas.' }
    ],
    tips: [
      'Mezcla la mantequilla al final: si la pones antes, el ajo se quema y amarga.',
      'Ralla tú el parmesano; el rallado industrial no se funde igual.'
    ],
    tags: ['proteina', 'crujiente', 'familiar', 'sin-gluten']
  },
  {
    id: 61, name: 'Pollo agridulce', emoji: '🍍', category: 'pollo',
    description: 'Dados crujientes lacados en salsa agridulce de tomate, piña y vinagre.',
    prepTime: 15, cookTime: 16, temperature: 190, difficulty: 'Media',
    servings: 2, calories: 330, popularity: 76,
    ingredients: [
      { q: 400, u: 'g', n: 'pechuga de pollo en dados' },
      { q: 2, u: 'cda', n: 'maicena' },
      { q: 3, u: 'cda', n: 'kétchup' },
      { q: 1, u: 'cda', n: 'vinagre de manzana' },
      { q: 1, u: 'cda', n: 'azúcar moreno' },
      { q: 1, u: 'cda', n: 'salsa de soja' },
      { q: 100, u: 'g', n: 'piña en trozos' },
      { q: 1, u: 'ud', n: 'pimiento verde en dados' }
    ],
    steps: [
      { t: 'Reboza los dados de pollo en la maicena sacudiendo el exceso.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y cocina el pollo 12 minutos agitando a mitad.', timer: 12 },
      { t: 'Mezcla el kétchup, el vinagre, el azúcar y la soja en un bol.' },
      { t: 'Añade a la cesta la piña, el pimiento y la salsa sobre el pollo.' },
      { t: 'Cocina 4 minutos más para que todo se lacque.', timer: 4 },
      { t: 'Sirve sobre arroz blanco.' }
    ],
    tips: [
      'La maicena es la que crea la costra: no la sustituyas por harina.',
      'La salsa va al final para que el azúcar no se queme.'
    ],
    tags: ['proteina', 'familiar']
  },
  {
    id: 62, name: 'Pollo crujiente con cornflakes', emoji: '🌽', category: 'pollo',
    description: 'Rebozado de copos de maíz: el crujido más espectacular que puedes conseguir sin freír.',
    prepTime: 15, cookTime: 20, temperature: 190, difficulty: 'Media',
    servings: 4, calories: 360, popularity: 83,
    ingredients: [
      { q: 600, u: 'g', n: 'pollo en tiras o contramuslos' },
      { q: 150, u: 'g', n: 'copos de maíz sin azúcar' },
      { q: 2, u: 'ud', n: 'huevos' },
      { q: 60, u: 'g', n: 'harina' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Tritura los copos de maíz sin hacerlos polvo: deben quedar trozos irregulares.' },
      { t: 'Mezcla la harina con el pimentón, la sal y la pimienta.' },
      { t: 'Pasa el pollo por harina, huevo batido y copos, presionando bien.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y pulveriza aceite.', timer: 3 },
      { t: 'Cocina 20 minutos dando la vuelta a los 11 minutos.', timer: 20 },
      { t: 'Sirve con salsa de miel y mostaza.' }
    ],
    tips: [
      'Usa copos sin azucarar o el rebozado se quemará.',
      'Los trozos grandes de copo son los que dan el crujido: no los tritures demasiado.'
    ],
    tags: ['proteina', 'crujiente', 'familiar']
  },
  {
    id: 63, name: 'Brochetas yakitori', emoji: '🍡', category: 'pollo',
    description: 'Brochetas japonesas de pollo lacadas en salsa dulce de soja y mirin.',
    prepTime: 12, cookTime: 14, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 260, popularity: 70,
    ingredients: [
      { q: 400, u: 'g', n: 'contramuslo de pollo en dados' },
      { q: 3, u: 'ud', n: 'cebolletas en trozos' },
      { q: 3, u: 'cda', n: 'salsa de soja' },
      { q: 2, u: 'cda', n: 'mirin o vino blanco dulce' },
      { q: 1, u: 'cda', n: 'azúcar moreno' },
      { q: 1, u: 'cda', n: 'semillas de sésamo' }
    ],
    steps: [
      { t: 'Reduce en un cazo la soja, el mirin y el azúcar hasta que espese un poco, unos 4 minutos.', timer: 4 },
      { t: 'Monta las brochetas alternando pollo y cebolleta.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 10 minutos dando la vuelta a mitad.', timer: 10 },
      { t: 'Pinta con la salsa y cocina 4 minutos más.', timer: 4 },
      { t: 'Espolvorea sésamo y sirve.' }
    ],
    tips: [
      'Remoja las brochetas de madera 10 minutos para que no se tuesten.',
      'Pinta la salsa en dos veces para conseguir una capa brillante.'
    ],
    tags: ['proteina', 'rapida']
  },

  /* ─────────────  CARNE (ampliación)  ───────────── */
  {
    id: 64, name: 'Lomo de cerdo adobado', emoji: '🐖', category: 'carne',
    description: 'Adobo español de pimentón y ajo, perfecto para bocadillos o con patatas.',
    prepTime: 10, cookTime: 25, temperature: 180, difficulty: 'Fácil',
    servings: 4, calories: 280, popularity: 77,
    ingredients: [
      { q: 600, u: 'g', n: 'lomo de cerdo en una pieza' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 2, u: 'cdta', n: 'pimentón dulce' },
      { q: 3, u: 'ud', n: 'dientes de ajo picados' },
      { q: 1, u: 'cdta', n: 'orégano seco' },
      { q: 1, u: 'cda', n: 'vinagre de vino' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Mezcla el aceite, el pimentón, el ajo, el orégano, el vinagre, la sal y la pimienta.' },
      { t: 'Unta el lomo y déjalo marinar al menos 30 minutos (mejor toda la noche).', timer: 30 },
      { t: 'Precalienta a 180 °C durante 4 minutos.', timer: 4 },
      { t: 'Cocina 25 minutos dando un cuarto de vuelta cada 7 minutos.', timer: 25 },
      { t: 'Deja reposar 8 minutos envuelto en papel de aluminio y corta en filetes finos.', timer: 8 }
    ],
    tips: [
      'El lomo es muy magro: pasarse de tiempo lo seca sin remedio.',
      'Frío y en lonchas finas es el mejor bocadillo del día siguiente.'
    ],
    tags: ['proteina', 'economica', 'familiar', 'sin-gluten']
  },
  {
    id: 65, name: 'Chuletas de cordero al romero', emoji: '🍖', category: 'carne',
    description: 'Chuletillas doradas por fuera y rosadas por dentro en apenas 12 minutos.',
    prepTime: 8, cookTime: 12, temperature: 200, difficulty: 'Media',
    servings: 2, calories: 400, popularity: 69,
    ingredients: [
      { q: 6, u: 'ud', n: 'chuletas de cordero' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 2, u: 'ud', n: 'dientes de ajo picados' },
      { q: 1, u: 'cdta', n: 'romero seco' },
      { q: null, u: '', n: 'Sal gruesa y pimienta negra' }
    ],
    steps: [
      { t: 'Saca las chuletas de la nevera 20 minutos antes y sécalas bien.' },
      { t: 'Úntalas con aceite, ajo, romero, sal y pimienta.' },
      { t: 'Precalienta a 200 °C durante 5 minutos.', timer: 5 },
      { t: 'Cocina 6 minutos, da la vuelta y cocina 6 minutos más.', timer: 12 },
      { t: 'Deja reposar 4 minutos antes de servir.', timer: 4 }
    ],
    tips: [
      'El precalentado fuerte es lo que sella la carne y evita que suelte los jugos.',
      'Para un punto más hecho, añade 2 minutos; más allá quedan secas.'
    ],
    tags: ['proteina', 'rapida', 'sin-gluten']
  },
  {
    id: 66, name: 'Flamenquines', emoji: '🌯', category: 'carne',
    description: 'Rollitos cordobeses de lomo y jamón serrano, empanados y muy crujientes.',
    prepTime: 20, cookTime: 14, temperature: 190, difficulty: 'Media',
    servings: 4, calories: 420, popularity: 74,
    ingredients: [
      { q: 8, u: 'ud', n: 'filetes finos de lomo de cerdo' },
      { q: 8, u: 'ud', n: 'lonchas de jamón serrano' },
      { q: 2, u: 'ud', n: 'huevos' },
      { q: 60, u: 'g', n: 'harina' },
      { q: 120, u: 'g', n: 'pan rallado' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Aplana los filetes con un mazo hasta dejarlos muy finos y salpimienta ligeramente.' },
      { t: 'Coloca una loncha de jamón sobre cada filete y enróllalos apretando bien.' },
      { t: 'Pásalos por harina, huevo y pan rallado. Repite huevo y pan para doble capa.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y pulveriza aceite.', timer: 3 },
      { t: 'Cocina 14 minutos girándolos cada 5 minutos para que doren por todos lados.', timer: 14 },
      { t: 'Corta en rodajas y sirve.' }
    ],
    tips: [
      'El jamón ya sala bastante: cuidado con la sal del lomo.',
      'Enrolla apretando fuerte o se abrirán durante la cocción.'
    ],
    tags: ['proteina', 'crujiente', 'familiar']
  },
  {
    id: 67, name: 'Dátiles con bacon', emoji: '🥓', category: 'carne',
    description: 'El aperitivo dulce y salado que desaparece de la mesa en dos minutos.',
    prepTime: 8, cookTime: 10, temperature: 180, difficulty: 'Fácil',
    servings: 4, calories: 190, popularity: 79,
    ingredients: [
      { q: 16, u: 'ud', n: 'dátiles sin hueso' },
      { q: 8, u: 'ud', n: 'lonchas de bacon' },
      { q: 60, u: 'g', n: 'queso crema (opcional)' }
    ],
    steps: [
      { t: 'Rellena los dátiles con un poco de queso crema si te gusta.' },
      { t: 'Corta las lonchas de bacon por la mitad y enrolla cada dátil.' },
      { t: 'Sujeta con un palillo.' },
      { t: 'Cocina a 180 °C durante 10 minutos dando la vuelta a los 6 minutos.', timer: 10 },
      { t: 'Deja templar 3 minutos: el relleno quema mucho.', timer: 3 }
    ],
    tips: [
      'No hace falta aceite: el bacon suelta toda la grasa necesaria.',
      'Coloca papel de air fryer para no tener que fregar el caramelo del dátil.'
    ],
    tags: ['rapida', 'familiar', 'sin-gluten']
  },
  {
    id: 68, name: 'Kofta de ternera especiada', emoji: '🌯', category: 'carne',
    description: 'Rollos de carne picada con comino, cilantro y cebolla. Muy jugosos.',
    prepTime: 15, cookTime: 14, temperature: 190, difficulty: 'Fácil',
    servings: 4, calories: 300, popularity: 71,
    ingredients: [
      { q: 600, u: 'g', n: 'carne picada de ternera' },
      { q: 1, u: 'ud', n: 'cebolla rallada y escurrida' },
      { q: 2, u: 'ud', n: 'dientes de ajo picados' },
      { q: 1, u: 'cdta', n: 'comino molido' },
      { q: 1, u: 'cdta', n: 'cilantro molido' },
      { q: 3, u: 'cda', n: 'perejil fresco picado' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Mezcla todos los ingredientes con las manos hasta integrarlos.' },
      { t: 'Forma cilindros alargados de unos 8 cm, como salchichas.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 14 minutos dando la vuelta a los 7 minutos.', timer: 14 },
      { t: 'Sirve con pan de pita, hummus y ensalada.' }
    ],
    tips: [
      'Escurre bien la cebolla rallada o la mezcla quedará aguada y se romperá.',
      'Refrigera la carne 15 minutos antes de formar los rollos: se manejan mucho mejor.'
    ],
    tags: ['proteina', 'economica', 'familiar', 'sin-gluten']
  },
  {
    id: 69, name: 'Secreto ibérico', emoji: '🥓', category: 'carne',
    description: 'La pieza más jugosa del cerdo, con la grasa bien tostada. Solo sal gruesa.',
    prepTime: 5, cookTime: 12, temperature: 200, difficulty: 'Fácil',
    servings: 2, calories: 380, popularity: 75,
    ingredients: [
      { q: 400, u: 'g', n: 'secreto ibérico' },
      { q: null, u: '', n: 'Sal gruesa y pimienta negra' }
    ],
    steps: [
      { t: 'Seca la carne y salpimienta por ambas caras.' },
      { t: 'Precalienta a 200 °C durante 5 minutos.', timer: 5 },
      { t: 'Cocina 7 minutos, da la vuelta y cocina 5 minutos más.', timer: 12 },
      { t: 'Deja reposar 5 minutos y corta en tiras a contraveta.', timer: 5 }
    ],
    tips: [
      'No añadas aceite: la propia grasa infiltrada es más que suficiente.',
      'Si sale humo, pon dos cucharadas de agua en el cajón inferior.'
    ],
    tags: ['proteina', 'rapida', 'sin-gluten']
  },
  {
    id: 70, name: 'San Jacobo', emoji: '🥪', category: 'carne',
    description: 'Filete empanado con jamón y queso dentro. Clásico de la cocina rápida española.',
    prepTime: 15, cookTime: 14, temperature: 190, difficulty: 'Media',
    servings: 2, calories: 430, popularity: 78,
    ingredients: [
      { q: 4, u: 'ud', n: 'filetes finos de ternera o cerdo' },
      { q: 2, u: 'ud', n: 'lonchas de jamón cocido' },
      { q: 2, u: 'ud', n: 'lonchas de queso' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 50, u: 'g', n: 'harina' },
      { q: 100, u: 'g', n: 'pan rallado' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Monta cada san jacobo con dos filetes y, entre medias, jamón y queso.' },
      { t: 'Presiona bien los bordes para sellarlos.' },
      { t: 'Pasa por harina, huevo batido y pan rallado.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y pulveriza aceite.', timer: 3 },
      { t: 'Cocina 14 minutos dando la vuelta a los 7 minutos.', timer: 14 },
      { t: 'Deja templar 2 minutos antes de comer.', timer: 2 }
    ],
    tips: [
      'Si el queso asoma por los bordes, acabará fuera: recórtalo más pequeño que el filete.',
      'Congelarlos 10 minutos antes de cocinar ayuda a que no se abran.'
    ],
    tags: ['proteina', 'crujiente', 'familiar']
  },

  /* ─────────────  PESCADO (ampliación)  ───────────── */
  {
    id: 71, name: 'Langostinos con panko', emoji: '🍤', category: 'pescado',
    description: 'Langostinos rebozados extra crujientes, listos en 8 minutos.',
    prepTime: 15, cookTime: 8, temperature: 200, difficulty: 'Media',
    servings: 2, calories: 240, popularity: 81,
    ingredients: [
      { q: 400, u: 'g', n: 'langostinos pelados con cola' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 50, u: 'g', n: 'harina' },
      { q: 120, u: 'g', n: 'pan rallado panko' },
      { q: 0.5, u: 'cdta', n: 'pimentón dulce' },
      { q: null, u: '', n: 'Sal y aceite en espray' }
    ],
    steps: [
      { t: 'Seca bien los langostinos con papel de cocina.' },
      { t: 'Pásalos por harina, huevo batido y panko mezclado con pimentón y sal.' },
      { t: 'Precalienta a 200 °C durante 3 minutos.', timer: 3 },
      { t: 'Pulveriza aceite y cocina 4 minutos por cada lado.', timer: 8 },
      { t: 'Sirve con salsa agridulce o alioli de lima.' }
    ],
    tips: [
      'Vigila el tiempo: pasados 9-10 minutos quedan gomosos.',
      'Deja la cola sin rebozar, sirve para cogerlos con la mano.'
    ],
    tags: ['proteina', 'crujiente', 'rapida']
  },
  {
    id: 72, name: 'Varitas de merluza caseras', emoji: '🍟', category: 'pescado',
    description: 'Las varitas de pescado de siempre, pero caseras y sin fritura.',
    prepTime: 20, cookTime: 10, temperature: 200, difficulty: 'Fácil',
    servings: 4, calories: 250, popularity: 79,
    ingredients: [
      { q: 500, u: 'g', n: 'lomos de merluza sin espinas' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 60, u: 'g', n: 'harina' },
      { q: 120, u: 'g', n: 'pan rallado panko' },
      { q: 1, u: 'cdta', n: 'perejil seco' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Corta la merluza en bastones de unos 2 cm de ancho.' },
      { t: 'Salpimienta y pásalos por harina, huevo y panko con perejil.' },
      { t: 'Congélalos 20 minutos para que no se rompan.', timer: 20 },
      { t: 'Precalienta a 200 °C durante 3 minutos y pulveriza aceite.', timer: 3 },
      { t: 'Cocina 10 minutos dando la vuelta a los 6 minutos.', timer: 10 },
      { t: 'Sirve con limón y patatas.' }
    ],
    tips: [
      'Congelarlas antes es el truco para que mantengan la forma.',
      'Puedes dejarlas hechas y congeladas: se cocinan directamente añadiendo 3 minutos.'
    ],
    tags: ['proteina', 'crujiente', 'familiar', 'economica']
  },
  {
    id: 73, name: 'Atún con costra de sésamo', emoji: '🍣', category: 'pescado',
    description: 'Sellado por fuera y rosado por dentro, con costra de sésamo tostado.',
    prepTime: 8, cookTime: 8, temperature: 200, difficulty: 'Media',
    servings: 2, calories: 290, popularity: 68,
    ingredients: [
      { q: 2, u: 'ud', n: 'lomos de atún fresco' },
      { q: 3, u: 'cda', n: 'semillas de sésamo' },
      { q: 1, u: 'cda', n: 'salsa de soja' },
      { q: 1, u: 'cdta', n: 'aceite de sésamo' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Unta el atún con la soja y el aceite de sésamo y salpimienta.' },
      { t: 'Reboza los lomos por todas las caras en las semillas de sésamo.' },
      { t: 'Precalienta a 200 °C durante 4 minutos.', timer: 4 },
      { t: 'Cocina 4 minutos por cada lado para que quede rosado en el centro.', timer: 8 },
      { t: 'Corta en láminas y sirve con salsa de soja.' }
    ],
    tips: [
      'El atún se seca enseguida: 8 minutos es el máximo si lo quieres jugoso.',
      'Para punto poco hecho, baja a 6 minutos totales.'
    ],
    tags: ['proteina', 'saludable', 'rapida']
  },
  {
    id: 74, name: 'Boquerones crujientes', emoji: '🐡', category: 'pescado',
    description: 'Boqueroncitos enharinados y dorados, como en un chiringuito de playa.',
    prepTime: 15, cookTime: 10, temperature: 200, difficulty: 'Media',
    servings: 2, calories: 260, popularity: 66,
    ingredients: [
      { q: 400, u: 'g', n: 'boquerones limpios' },
      { q: 100, u: 'g', n: 'harina de garbanzo o especial para freír' },
      { q: null, u: '', n: 'Sal, limón y aceite en espray' }
    ],
    steps: [
      { t: 'Seca muy bien los boquerones y sálalos.' },
      { t: 'Enharínalos y sacude el exceso con un colador.' },
      { t: 'Precalienta a 200 °C durante 3 minutos y forra la cesta con papel de air fryer.', timer: 3 },
      { t: 'Pulveriza aceite generosamente y cocina 10 minutos dando la vuelta a los 6 minutos.', timer: 10 },
      { t: 'Sirve inmediatamente con limón.' }
    ],
    tips: [
      'El exceso de harina se levanta con el aire y se quema: sacúdelos bien.',
      'Trabaja en tandas pequeñas; amontonados no quedan crujientes.'
    ],
    tags: ['proteina', 'crujiente', 'economica']
  },
  {
    id: 75, name: 'Tacos de pescado', emoji: '🌮', category: 'pescado',
    description: 'Pescado crujiente con col, lima y salsa de yogur sobre tortillas de maíz.',
    prepTime: 20, cookTime: 12, temperature: 190, difficulty: 'Media',
    servings: 4, calories: 350, popularity: 77,
    ingredients: [
      { q: 500, u: 'g', n: 'lomos de bacalao o merluza' },
      { q: 100, u: 'g', n: 'pan rallado panko' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 1, u: 'cdta', n: 'pimentón ahumado' },
      { q: 8, u: 'ud', n: 'tortillas de maíz' },
      { q: 150, u: 'g', n: 'col lombarda en juliana' },
      { q: 150, u: 'g', n: 'yogur natural' },
      { q: 1, u: 'ud', n: 'lima' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Corta el pescado en tiras, salpimienta y pásalo por huevo y panko con pimentón.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y pulveriza aceite.', timer: 3 },
      { t: 'Cocina 12 minutos dando la vuelta a los 7 minutos.', timer: 12 },
      { t: 'Mezcla el yogur con zumo de lima y sal para la salsa.' },
      { t: 'Calienta las tortillas 2 minutos a 160 °C.', timer: 2 },
      { t: 'Monta con la col, el pescado y la salsa.' }
    ],
    tips: [
      'La col cruda aporta el contraste crujiente: no la cocines.',
      'Prepara la salsa antes para que los tacos se monten con el pescado recién hecho.'
    ],
    tags: ['proteina', 'familiar', 'saludable']
  },
  {
    id: 76, name: 'Tilapia al limón y pimentón', emoji: '🐠', category: 'pescado',
    description: 'Filetes de pescado blanco listos en 12 minutos, ligeros y sabrosos.',
    prepTime: 8, cookTime: 12, temperature: 180, difficulty: 'Fácil',
    servings: 2, calories: 210, popularity: 64,
    ingredients: [
      { q: 2, u: 'ud', n: 'filetes de tilapia o panga' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: 0.5, u: 'cdta', n: 'ajo en polvo' },
      { q: 1, u: 'ud', n: 'limón' },
      { q: null, u: '', n: 'Sal, pimienta y perejil' }
    ],
    steps: [
      { t: 'Seca los filetes y úntalos con aceite, pimentón, ajo, sal y pimienta.' },
      { t: 'Precalienta a 180 °C durante 3 minutos.', timer: 3 },
      { t: 'Coloca los filetes sobre papel de air fryer y cocina 12 minutos sin darles la vuelta.', timer: 12 },
      { t: 'Riega con zumo de limón y espolvorea perejil antes de servir.' }
    ],
    tips: [
      'El pescado blanco es delicado: el papel de air fryer evita que se pegue y se rompa.',
      'Está listo cuando se abre en lascas al presionar con un tenedor.'
    ],
    tags: ['saludable', 'proteina', 'rapida', 'economica', 'sin-gluten']
  },

  /* ─────────────  VERDURAS (ampliación)  ───────────── */
  {
    id: 77, name: 'Espárragos trigueros con parmesano', emoji: '🌱', category: 'verduras',
    description: 'Ocho minutos para una guarnición elegante con las puntas crujientes.',
    prepTime: 5, cookTime: 8, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 80, popularity: 82,
    ingredients: [
      { q: 400, u: 'g', n: 'espárragos trigueros' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 20, u: 'g', n: 'queso parmesano rallado' },
      { q: null, u: '', n: 'Sal, pimienta y ralladura de limón' }
    ],
    steps: [
      { t: 'Corta la parte dura del tallo (se parte sola si doblas el espárrago).' },
      { t: 'Mézclalos con el aceite, la sal y la pimienta.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 8 minutos agitando la cesta a los 4 minutos.', timer: 8 },
      { t: 'Añade el parmesano y la ralladura de limón al sacarlos.' }
    ],
    tips: [
      'Los espárragos finos se hacen en 6 minutos; los gruesos necesitan 10.',
      'Colócalos en una sola capa para que se tuesten en vez de cocerse.'
    ],
    tags: ['saludable', 'vegetariana', 'rapida', 'sin-gluten']
  },
  {
    id: 78, name: 'Pimientos de Padrón', emoji: '🫑', category: 'verduras',
    description: 'Unos pican y otros no. Ampollados y con sal gruesa, como en Galicia.',
    prepTime: 3, cookTime: 8, temperature: 200, difficulty: 'Fácil',
    servings: 2, calories: 90, popularity: 80,
    ingredients: [
      { q: 300, u: 'g', n: 'pimientos de Padrón' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal gruesa al gusto' }
    ],
    steps: [
      { t: 'Lava y seca muy bien los pimientos.' },
      { t: 'Mézclalos con el aceite.' },
      { t: 'Precalienta a 200 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 8 minutos agitando la cesta cada 3 minutos, hasta que la piel se ampolle.', timer: 8 },
      { t: 'Sala en abundancia nada más sacarlos y sirve inmediatamente.' }
    ],
    tips: [
      'Pínchalos con un cuchillo antes si no quieres que salten.',
      'La sal siempre al final: si la pones antes, sueltan agua.'
    ],
    tags: ['saludable', 'vegetariana', 'rapida', 'economica', 'sin-gluten']
  },
  {
    id: 79, name: 'Coliflor búfalo crujiente', emoji: '🥦', category: 'verduras',
    description: 'La alternativa vegetal a las alitas picantes: rebozada y bañada en salsa búfalo.',
    prepTime: 15, cookTime: 18, temperature: 190, difficulty: 'Media',
    servings: 4, calories: 150, popularity: 76,
    ingredients: [
      { q: 1, u: 'ud', n: 'coliflor mediana en ramilletes' },
      { q: 100, u: 'g', n: 'harina' },
      { q: 120, u: 'ml', n: 'leche o bebida vegetal' },
      { q: 1, u: 'cdta', n: 'ajo en polvo' },
      { q: 4, u: 'cda', n: 'salsa picante tipo búfalo' },
      { q: 20, u: 'g', n: 'mantequilla derretida' },
      { q: null, u: '', n: 'Sal y aceite en espray' }
    ],
    steps: [
      { t: 'Bate la harina con la leche, el ajo en polvo y la sal hasta formar una masa fluida.' },
      { t: 'Baña los ramilletes y escúrrelos bien.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y pulveriza aceite.', timer: 3 },
      { t: 'Cocina 14 minutos agitando la cesta cada 5 minutos.', timer: 14 },
      { t: 'Mezcla la salsa picante con la mantequilla, baña la coliflor y cocina 4 minutos más.', timer: 4 },
      { t: 'Sirve con salsa de yogur o queso azul.' }
    ],
    tips: [
      'Escurre bien el rebozado o goteará y quedará pastoso.',
      'La salsa siempre al final para no perder el crujiente.'
    ],
    tags: ['vegetariana', 'picante', 'crujiente', 'familiar']
  },
  {
    id: 80, name: 'Zanahorias asadas con miel', emoji: '🥕', category: 'verduras',
    description: 'Caramelizadas por fuera y tiernas por dentro, con tomillo y un toque dulce.',
    prepTime: 8, cookTime: 16, temperature: 190, difficulty: 'Fácil',
    servings: 4, calories: 110, popularity: 72,
    ingredients: [
      { q: 600, u: 'g', n: 'zanahorias' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cda', n: 'miel' },
      { q: 1, u: 'cdta', n: 'tomillo seco' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Pela las zanahorias y córtalas en bastones de 1,5 cm.' },
      { t: 'Mézclalas con el aceite, el tomillo, la sal y la pimienta.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y cocina 12 minutos agitando a mitad.', timer: 12 },
      { t: 'Riega con la miel y cocina 4 minutos más.', timer: 4 },
      { t: 'Sirve como guarnición de carnes asadas.' }
    ],
    tips: [
      'Bastones del mismo grosor: si mezclas tamaños, unos quedarán duros.',
      'La miel al final o se quemará y amargará.'
    ],
    tags: ['saludable', 'vegetariana', 'economica', 'sin-gluten']
  },
  {
    id: 81, name: 'Chips de kale', emoji: '🥬', category: 'verduras',
    description: 'Hojas ultrafinas que se deshacen en la boca. El snack más ligero del recetario.',
    prepTime: 5, cookTime: 8, temperature: 160, difficulty: 'Fácil',
    servings: 2, calories: 60, popularity: 61,
    ingredients: [
      { q: 150, u: 'g', n: 'kale o col rizada' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal y pimentón al gusto' }
    ],
    steps: [
      { t: 'Retira los tallos duros y trocea las hojas.' },
      { t: 'Lávalas y sécalas por completo, esto es imprescindible.' },
      { t: 'Masajéalas con el aceite hasta que brillen ligeramente.' },
      { t: 'Cocina a 160 °C durante 8 minutos agitando cada 3 minutos.', timer: 8 },
      { t: 'Sala al sacarlas y deja enfriar 3 minutos.', timer: 3 }
    ],
    tips: [
      'A más de 170 °C se queman en segundos: mantén la temperatura baja.',
      'Las hojas son muy ligeras y vuelan: coloca la rejilla superior si tu modelo la trae.'
    ],
    tags: ['saludable', 'vegetariana', 'rapida', 'crujiente', 'sin-gluten']
  },
  {
    id: 82, name: 'Judías verdes con almendras', emoji: '🫛', category: 'verduras',
    description: 'Guarnición rápida con almendra tostada y ajo. Ligera y con textura.',
    prepTime: 8, cookTime: 12, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 120, popularity: 65,
    ingredients: [
      { q: 400, u: 'g', n: 'judías verdes' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 30, u: 'g', n: 'almendras laminadas' },
      { q: 2, u: 'ud', n: 'dientes de ajo laminados' },
      { q: null, u: '', n: 'Sal, pimienta y limón' }
    ],
    steps: [
      { t: 'Retira las puntas de las judías y mézclalas con el aceite, la sal y la pimienta.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y cocina 9 minutos agitando a mitad.', timer: 9 },
      { t: 'Añade las almendras y el ajo y cocina 3 minutos más.', timer: 3 },
      { t: 'Termina con unas gotas de limón.' }
    ],
    tips: [
      'Las almendras se queman en un minuto: no las pongas desde el principio.',
      'Si las judías son muy gruesas, escáldalas 3 minutos antes.'
    ],
    tags: ['saludable', 'vegetariana', 'rapida', 'sin-gluten']
  },
  {
    id: 83, name: 'Calabaza asada especiada', emoji: '🎃', category: 'verduras',
    description: 'Dados dulces con comino y pimentón, perfectos para bowls y ensaladas templadas.',
    prepTime: 10, cookTime: 18, temperature: 190, difficulty: 'Fácil',
    servings: 4, calories: 100, popularity: 68,
    ingredients: [
      { q: 700, u: 'g', n: 'calabaza pelada' },
      { q: 1.5, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'comino molido' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Corta la calabaza en dados de 2,5 cm.' },
      { t: 'Mézclalos con el aceite y las especias.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 18 minutos agitando la cesta cada 6 minutos.', timer: 18 },
      { t: 'Sirve sola, en ensalada o con queso feta.' }
    ],
    tips: [
      'La calabaza suelta bastante agua: no llenes la cesta más de la mitad.',
      'Con un poco de canela en lugar de comino queda más dulce.'
    ],
    tags: ['saludable', 'vegetariana', 'economica', 'sin-gluten']
  },
  {
    id: 84, name: 'Alcachofas crujientes', emoji: '🌿', category: 'verduras',
    description: 'Cuartos de alcachofa dorados por fuera y cremosos por dentro.',
    prepTime: 12, cookTime: 16, temperature: 190, difficulty: 'Media',
    servings: 2, calories: 130, popularity: 63,
    ingredients: [
      { q: 6, u: 'ud', n: 'alcachofas frescas' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 2, u: 'ud', n: 'dientes de ajo picados' },
      { q: 1, u: 'ud', n: 'limón' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Limpia las alcachofas quitando las hojas duras y córtalas en cuartos.' },
      { t: 'Sumérgelas en agua con limón para que no se oscurezcan.' },
      { t: 'Escúrrelas, sécalas y mézclalas con el aceite, el ajo, la sal y la pimienta.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 16 minutos agitando la cesta cada 6 minutos.', timer: 16 },
      { t: 'Riega con limón al servir.' }
    ],
    tips: [
      'Sécalas bien tras el agua con limón o no se dorarán.',
      'También funciona con alcachofas de bote bien escurridas: 10 minutos bastan.'
    ],
    tags: ['saludable', 'vegetariana', 'sin-gluten']
  },

  /* ─────────────  PATATAS (ampliación)  ───────────── */
  {
    id: 85, name: 'Patatas hasselback', emoji: '🥔', category: 'patatas',
    description: 'Cortadas en acordeón: crujientes por los bordes y cremosas por dentro. Muy vistosas.',
    prepTime: 15, cookTime: 30, temperature: 190, difficulty: 'Media',
    servings: 2, calories: 260, popularity: 79,
    ingredients: [
      { q: 4, u: 'ud', n: 'patatas medianas' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 20, u: 'g', n: 'mantequilla derretida' },
      { q: 1, u: 'cdta', n: 'ajo en polvo' },
      { q: 1, u: 'cdta', n: 'romero seco' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Coloca cada patata entre dos palillos y haz cortes cada 3 mm sin llegar al fondo.' },
      { t: 'Mezcla el aceite con la mantequilla, el ajo, el romero, la sal y la pimienta.' },
      { t: 'Pinta bien las patatas procurando que entre entre los cortes.' },
      { t: 'Precalienta a 190 °C durante 4 minutos.', timer: 4 },
      { t: 'Cocina 30 minutos, pintando de nuevo a los 15 minutos.', timer: 30 },
      { t: 'Sirve con cebollino o queso rallado.' }
    ],
    tips: [
      'Los palillos a ambos lados evitan que el cuchillo llegue hasta abajo.',
      'Las láminas se abren a mitad de cocción: es entonces cuando conviene volver a pintar.'
    ],
    tags: ['vegetariana', 'economica', 'crujiente', 'familiar', 'sin-gluten']
  },
  {
    id: 86, name: 'Patatas panadera', emoji: '🧅', category: 'patatas',
    description: 'Patatas y cebolla en láminas, tiernas y ligeramente doradas. La guarnición clásica.',
    prepTime: 12, cookTime: 25, temperature: 180, difficulty: 'Fácil',
    servings: 4, calories: 220, popularity: 74,
    ingredients: [
      { q: 800, u: 'g', n: 'patatas' },
      { q: 2, u: 'ud', n: 'cebollas' },
      { q: 3, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'orégano seco' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Corta las patatas en láminas de 5 mm y las cebollas en juliana.' },
      { t: 'Mézclalas con el aceite, el orégano, la sal y la pimienta.' },
      { t: 'Precalienta a 180 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 25 minutos removiendo cada 8 minutos.', timer: 25 },
      { t: 'Sirve como base de pescados o carnes al horno.' }
    ],
    tips: [
      'Son la guarnición ideal para acompañar el pollo asado de la air fryer.',
      'Si prefieres que doren más, sube a 200 °C los últimos 5 minutos.'
    ],
    tags: ['vegetariana', 'economica', 'familiar', 'sin-gluten']
  },
  {
    id: 87, name: 'Chips de patata caseros', emoji: '🍘', category: 'patatas',
    description: 'Patatas de bolsa hechas en casa: finísimas y crujientes con una cucharada de aceite.',
    prepTime: 10, cookTime: 15, temperature: 160, difficulty: 'Media',
    servings: 2, calories: 180, popularity: 77,
    ingredients: [
      { q: 400, u: 'g', n: 'patatas' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal y pimentón al gusto' }
    ],
    steps: [
      { t: 'Corta las patatas en láminas muy finas, mejor con mandolina.' },
      { t: 'Déjalas en agua fría 10 minutos y sécalas por completo.', timer: 10 },
      { t: 'Mézclalas con el aceite hasta que apenas brillen.' },
      { t: 'Cocina a 160 °C durante 15 minutos agitando la cesta cada 4 minutos.', timer: 15 },
      { t: 'Sala al sacarlas y déjalas enfriar sobre papel: terminan de endurecerse.' }
    ],
    tips: [
      'Temperatura baja y tiempo largo: a 200 °C se queman antes de secarse.',
      'Cocina en tandas de una sola capa; amontonadas quedan blandas.'
    ],
    tags: ['vegetariana', 'economica', 'crujiente', 'sin-gluten']
  },
  {
    id: 88, name: 'Rösti de patata', emoji: '🥞', category: 'patatas',
    description: 'Torta suiza de patata rallada, crujiente por fuera y tierna por dentro.',
    prepTime: 15, cookTime: 18, temperature: 190, difficulty: 'Media',
    servings: 2, calories: 240, popularity: 66,
    ingredients: [
      { q: 500, u: 'g', n: 'patatas' },
      { q: 1, u: 'ud', n: 'cebolla pequeña rallada' },
      { q: 1, u: 'cda', n: 'maicena' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Ralla las patatas en grueso y escúrrelas apretando con un paño hasta quitar toda el agua.' },
      { t: 'Mézclalas con la cebolla, la maicena, el aceite, la sal y la pimienta.' },
      { t: 'Forma una torta de 2 cm sobre papel de air fryer.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 12 minutos, dale la vuelta con ayuda de un plato y cocina 6 minutos más.', timer: 18 },
      { t: 'Sirve con huevo frito o salmón ahumado.' }
    ],
    tips: [
      'Escurrir la patata es EL paso crítico: si queda agua, no se dora nunca.',
      'La maicena une la torta y ayuda a que no se rompa al girarla.'
    ],
    tags: ['vegetariana', 'economica', 'crujiente', 'sin-gluten']
  },
  {
    id: 89, name: 'Patatas baby al romero', emoji: '🌿', category: 'patatas',
    description: 'Patatas pequeñas enteras con la piel arrugada y crujiente. Cero preparación.',
    prepTime: 8, cookTime: 20, temperature: 200, difficulty: 'Fácil',
    servings: 4, calories: 190, popularity: 81,
    ingredients: [
      { q: 700, u: 'g', n: 'patatas baby' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'romero seco' },
      { q: 3, u: 'ud', n: 'dientes de ajo sin pelar' },
      { q: null, u: '', n: 'Sal gruesa y pimienta' }
    ],
    steps: [
      { t: 'Lava las patatas y sécalas sin pelarlas.' },
      { t: 'Mézclalas con el aceite, el romero, la sal y la pimienta.' },
      { t: 'Precalienta a 200 °C durante 3 minutos.', timer: 3 },
      { t: 'Añade los ajos sin pelar y cocina 20 minutos agitando cada 7 minutos.', timer: 20 },
      { t: 'Aplasta ligeramente cada patata con un tenedor antes de servir.' }
    ],
    tips: [
      'Aplastarlas al final multiplica la superficie crujiente.',
      'Los ajos sin pelar perfuman sin quemarse; exprímelos sobre las patatas al servir.'
    ],
    tags: ['vegetariana', 'economica', 'familiar', 'sin-gluten']
  },

  /* ─────────────  HUEVOS (ampliación)  ───────────── */
  {
    id: 90, name: 'Huevos rellenos de atún', emoji: '🥚', category: 'huevos',
    description: 'El entrante de toda la vida, con los huevos cocidos hechos en la air fryer.',
    prepTime: 15, cookTime: 15, temperature: 140, difficulty: 'Fácil',
    servings: 4, calories: 190, popularity: 73,
    ingredients: [
      { q: 6, u: 'ud', n: 'huevos' },
      { q: 120, u: 'g', n: 'atún en conserva escurrido' },
      { q: 3, u: 'cda', n: 'mayonesa' },
      { q: 2, u: 'cda', n: 'tomate frito' },
      { q: null, u: '', n: 'Sal, pimienta y aceitunas para decorar' }
    ],
    steps: [
      { t: 'Cocina los huevos a 140 °C durante 15 minutos.', timer: 15 },
      { t: 'Pásalos a agua con hielo 5 minutos y pélalos.', timer: 5 },
      { t: 'Córtalos por la mitad y saca las yemas.' },
      { t: 'Mezcla las yemas con el atún, la mayonesa, el tomate frito, la sal y la pimienta.' },
      { t: 'Rellena las claras y decora con una aceituna. Sirve frío.' }
    ],
    tips: [
      'El baño de hielo evita el borde verdoso de la yema y facilita el pelado.',
      'Se pueden preparar con antelación y guardar tapados en la nevera.'
    ],
    tags: ['proteina', 'economica', 'familiar', 'sin-gluten']
  },
  {
    id: 91, name: 'Frittata de verduras', emoji: '🍅', category: 'huevos',
    description: 'Tortilla italiana al horno con verduras y queso. Ideal para aprovechar restos.',
    prepTime: 12, cookTime: 18, temperature: 160, difficulty: 'Media',
    servings: 4, calories: 210, popularity: 70,
    ingredients: [
      { q: 6, u: 'ud', n: 'huevos' },
      { q: 1, u: 'ud', n: 'calabacín en dados' },
      { q: 1, u: 'ud', n: 'pimiento rojo en dados' },
      { q: 100, u: 'g', n: 'queso rallado' },
      { q: 3, u: 'cda', n: 'leche' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal, pimienta y orégano' }
    ],
    steps: [
      { t: 'Mezcla las verduras con el aceite y cocínalas a 190 °C durante 8 minutos.', timer: 8 },
      { t: 'Bate los huevos con la leche, el queso, la sal, la pimienta y el orégano.' },
      { t: 'Engrasa un molde, pon las verduras y vierte el huevo por encima.' },
      { t: 'Cocina a 160 °C durante 18 minutos hasta que el centro esté cuajado.', timer: 18 },
      { t: 'Deja reposar 5 minutos y desmolda.', timer: 5 }
    ],
    tips: [
      'Adelantar las verduras evita que suelten agua sobre el huevo.',
      'Está lista cuando al pinchar con un palillo sale limpio.'
    ],
    tags: ['saludable', 'proteina', 'vegetariana', 'economica', 'sin-gluten']
  },
  {
    id: 92, name: 'Huevos rotos con jamón', emoji: '🍟', category: 'huevos',
    description: 'Patatas crujientes, huevo con la yema líquida y virutas de jamón. Plato de bar.',
    prepTime: 10, cookTime: 20, temperature: 200, difficulty: 'Media',
    servings: 2, calories: 480, popularity: 85,
    ingredients: [
      { q: 500, u: 'g', n: 'patatas' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 4, u: 'ud', n: 'huevos' },
      { q: 80, u: 'g', n: 'jamón serrano en virutas' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Corta las patatas en bastones, sécalas y mézclalas con el aceite y la sal.' },
      { t: 'Cocina a 200 °C durante 16 minutos agitando cada 6 minutos.', timer: 16 },
      { t: 'Haz dos huecos entre las patatas y casca los huevos dentro.' },
      { t: 'Baja a 160 °C y cocina 4-6 minutos, hasta que la clara cuaje.', timer: 4 },
      { t: 'Reparte el jamón por encima, rompe las yemas y sirve al momento.' }
    ],
    tips: [
      'Baja la temperatura al añadir los huevos: a 200 °C la yema se cuaja enseguida.',
      'El jamón se pone crudo al final; con el calor residual queda perfecto.'
    ],
    tags: ['proteina', 'familiar', 'sin-gluten']
  },

  /* ─────────────  PIZZA Y PANES (ampliación)  ───────────── */
  {
    id: 93, name: 'Focaccia de romero', emoji: '🫓', category: 'pizza',
    description: 'Miga esponjosa, corteza crujiente y mucho aceite de oliva. Sale perfecta en air fryer.',
    prepTime: 20, cookTime: 18, temperature: 180, difficulty: 'Media',
    servings: 4, calories: 290, popularity: 75,
    ingredients: [
      { q: 300, u: 'g', n: 'harina de fuerza' },
      { q: 200, u: 'ml', n: 'agua templada' },
      { q: 5, u: 'g', n: 'levadura seca de panadería' },
      { q: 4, u: 'cda', n: 'aceite de oliva virgen extra' },
      { q: 1, u: 'cdta', n: 'romero seco' },
      { q: null, u: '', n: 'Sal gruesa al gusto' }
    ],
    steps: [
      { t: 'Mezcla la harina, el agua, la levadura y una cucharadita de sal hasta formar una masa pegajosa.' },
      { t: 'Deja levar tapada 1 hora, hasta que doble su volumen.', timer: 60 },
      { t: 'Extiende la masa en un molde engrasado y marca hoyuelos con los dedos.' },
      { t: 'Riega con el aceite, el romero y la sal gruesa y deja reposar 20 minutos más.', timer: 20 },
      { t: 'Precalienta a 180 °C durante 4 minutos y cocina 18 minutos.', timer: 18 },
      { t: 'Deja templar sobre una rejilla antes de cortar.' }
    ],
    tips: [
      'Los hoyuelos con los dedos son los que retienen el aceite: no te saltes ese paso.',
      'Si la superficie se dora antes de tiempo, cúbrela con papel de aluminio.'
    ],
    tags: ['vegetariana', 'economica', 'familiar']
  },
  {
    id: 94, name: 'Bagels de dos ingredientes', emoji: '🥯', category: 'pizza',
    description: 'Yogur griego y harina: bagels tiernos sin levadura ni tiempos de espera.',
    prepTime: 15, cookTime: 14, temperature: 180, difficulty: 'Media',
    servings: 4, calories: 280, popularity: 69,
    ingredients: [
      { q: 250, u: 'g', n: 'harina con levadura' },
      { q: 250, u: 'g', n: 'yogur griego natural' },
      { q: 1, u: 'ud', n: 'huevo batido para pintar' },
      { q: 1, u: 'cda', n: 'semillas de sésamo o amapola' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Mezcla la harina con el yogur y una pizca de sal hasta formar una masa manejable.' },
      { t: 'Divide en 4 porciones, forma cilindros y únelos en forma de rosca.' },
      { t: 'Pinta con huevo batido y espolvorea las semillas.' },
      { t: 'Precalienta a 180 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 14 minutos dando la vuelta a los 9 minutos.', timer: 14 },
      { t: 'Deja enfriar antes de abrirlos.' }
    ],
    tips: [
      'Usa yogur griego espeso, no yogur líquido, o la masa quedará imposible de manejar.',
      'El agujero central se cierra al cocer: hazlo más grande de lo que parece necesario.'
    ],
    tags: ['vegetariana', 'proteina', 'familiar']
  },
  {
    id: 95, name: 'Bocaditos de pizza', emoji: '🍕', category: 'pizza',
    description: 'Bolitas de masa rellenas de tomate, queso y pepperoni. Aperitivo infalible.',
    prepTime: 15, cookTime: 12, temperature: 180, difficulty: 'Fácil',
    servings: 4, calories: 320, popularity: 78,
    ingredients: [
      { q: 1, u: 'ud', n: 'masa de pizza' },
      { q: 120, u: 'g', n: 'mozzarella en dados' },
      { q: 60, u: 'g', n: 'pepperoni o jamón en dados' },
      { q: 4, u: 'cda', n: 'salsa de tomate' },
      { q: 20, u: 'g', n: 'mantequilla derretida' },
      { q: 1, u: 'cdta', n: 'orégano seco' }
    ],
    steps: [
      { t: 'Corta la masa en cuadrados de 6 cm.' },
      { t: 'Pon en el centro tomate, queso y pepperoni y cierra formando bolitas bien selladas.' },
      { t: 'Pinta con la mantequilla y espolvorea orégano.' },
      { t: 'Precalienta a 180 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 12 minutos agitando la cesta a los 7 minutos.', timer: 12 },
      { t: 'Sirve con salsa de tomate para mojar.' }
    ],
    tips: [
      'Sella muy bien la unión y colócalas con el cierre hacia abajo.',
      'Poco relleno: si se escapa el queso, se pega en toda la cesta.'
    ],
    tags: ['familiar', 'rapida']
  },
  {
    id: 96, name: 'Pan de pita relleno', emoji: '🥙', category: 'pizza',
    description: 'Pita crujiente rellena de pollo, queso y verduras. Cena en menos de 20 minutos.',
    prepTime: 10, cookTime: 8, temperature: 180, difficulty: 'Fácil',
    servings: 2, calories: 340, popularity: 71,
    ingredients: [
      { q: 2, u: 'ud', n: 'panes de pita' },
      { q: 150, u: 'g', n: 'pollo cocinado desmenuzado' },
      { q: 80, u: 'g', n: 'queso rallado' },
      { q: 1, u: 'ud', n: 'tomate en rodajas' },
      { q: 2, u: 'cda', n: 'salsa de yogur' },
      { q: null, u: '', n: 'Sal, pimienta y orégano' }
    ],
    steps: [
      { t: 'Abre las pitas por un lado formando un bolsillo.' },
      { t: 'Rellena con el pollo, el queso y el tomate. Salpimienta.' },
      { t: 'Precalienta a 180 °C durante 2 minutos.', timer: 2 },
      { t: 'Cocina 8 minutos dando la vuelta a los 5 minutos.', timer: 8 },
      { t: 'Añade la salsa de yogur al abrir y sirve.' }
    ],
    tips: [
      'No rellenes en exceso o la pita se romperá con el calor.',
      'La salsa siempre después de cocinar: dentro humedecería el pan.'
    ],
    tags: ['rapida', 'proteina', 'familiar']
  },

  /* ─────────────  SNACKS (ampliación)  ───────────── */
  {
    id: 97, name: 'Rollitos de primavera', emoji: '🥢', category: 'snacks',
    description: 'Crujientes por fuera y con verduras salteadas dentro, sin baño de aceite.',
    prepTime: 20, cookTime: 12, temperature: 190, difficulty: 'Media',
    servings: 4, calories: 260, popularity: 80,
    ingredients: [
      { q: 12, u: 'ud', n: 'obleas para rollitos' },
      { q: 200, u: 'g', n: 'col china en juliana' },
      { q: 1, u: 'ud', n: 'zanahoria rallada' },
      { q: 100, u: 'g', n: 'brotes de soja' },
      { q: 2, u: 'cda', n: 'salsa de soja' },
      { q: 1, u: 'cdta', n: 'jengibre rallado' },
      { q: null, u: '', n: 'Aceite en espray y agua para sellar' }
    ],
    steps: [
      { t: 'Saltea las verduras 4 minutos con la soja y el jengibre y deja enfriar bien.', timer: 4 },
      { t: 'Escurre el relleno: no debe quedar nada de líquido.' },
      { t: 'Rellena las obleas, dobla los laterales y enrolla sellando el borde con agua.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y pulveriza aceite sobre los rollitos.', timer: 3 },
      { t: 'Cocina 12 minutos dando la vuelta a los 7 minutos.', timer: 12 },
      { t: 'Sirve con salsa agridulce.' }
    ],
    tips: [
      'El relleno caliente o húmedo rompe la oblea: enfríalo y escúrrelo siempre.',
      'Pulveriza aceite por toda la superficie o quedarán zonas blancas y correosas.'
    ],
    tags: ['vegetariana', 'crujiente', 'familiar']
  },
  {
    id: 98, name: 'Jalapeños rellenos de queso', emoji: '🌶️', category: 'snacks',
    description: 'Picantes, cremosos y envueltos en bacon. El aperitivo que engancha.',
    prepTime: 15, cookTime: 12, temperature: 190, difficulty: 'Media',
    servings: 4, calories: 220, popularity: 74,
    ingredients: [
      { q: 10, u: 'ud', n: 'jalapeños frescos' },
      { q: 200, u: 'g', n: 'queso crema' },
      { q: 80, u: 'g', n: 'queso rallado' },
      { q: 5, u: 'ud', n: 'lonchas de bacon' },
      { q: 0.5, u: 'cdta', n: 'ajo en polvo' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Corta los jalapeños por la mitad a lo largo y retira semillas y venas.' },
      { t: 'Mezcla los quesos con el ajo en polvo, la sal y la pimienta.' },
      { t: 'Rellena cada mitad y envuélvela con media loncha de bacon.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 12 minutos con el relleno hacia arriba, sin darles la vuelta.', timer: 12 },
      { t: 'Deja templar 3 minutos antes de servir.', timer: 3 }
    ],
    tips: [
      'Las semillas y las venas concentran el picante: retíralas para una versión suave.',
      'Usa guantes al manipularlos y no te toques los ojos.'
    ],
    tags: ['picante', 'familiar', 'sin-gluten']
  },
  {
    id: 99, name: 'Tequeños', emoji: '🧀', category: 'snacks',
    description: 'Palitos de queso envueltos en masa, dorados y elásticos por dentro.',
    prepTime: 20, cookTime: 10, temperature: 200, difficulty: 'Media',
    servings: 4, calories: 300, popularity: 76,
    ingredients: [
      { q: 250, u: 'g', n: 'queso semiduro tipo mozzarella en bastones' },
      { q: 1, u: 'ud', n: 'lámina de masa quebrada o de empanadillas' },
      { q: 1, u: 'ud', n: 'huevo batido' },
      { q: null, u: '', n: 'Aceite en espray' }
    ],
    steps: [
      { t: 'Corta la masa en tiras de 2 cm de ancho.' },
      { t: 'Envuelve cada bastón de queso en espiral, solapando los bordes y sellando los extremos.' },
      { t: 'Congélalos 20 minutos.', timer: 20 },
      { t: 'Precalienta a 200 °C durante 3 minutos, pinta con huevo y pulveriza aceite.', timer: 3 },
      { t: 'Cocina 10 minutos dando la vuelta a los 6 minutos.', timer: 10 },
      { t: 'Sirve calientes, con salsa rosa o guacamole.' }
    ],
    tips: [
      'Sellar bien los extremos y congelarlos es lo que impide que el queso se escape.',
      'Cómelos recién hechos: al enfriarse el queso se endurece.'
    ],
    tags: ['vegetariana', 'crujiente', 'familiar']
  },
  {
    id: 100, name: 'Nachos con queso', emoji: '🌮', category: 'snacks',
    description: 'Seis minutos para un plato de nachos con el queso perfectamente fundido.',
    prepTime: 5, cookTime: 6, temperature: 180, difficulty: 'Fácil',
    servings: 4, calories: 340, popularity: 83,
    ingredients: [
      { q: 200, u: 'g', n: 'nachos de maíz' },
      { q: 150, u: 'g', n: 'queso rallado para fundir' },
      { q: 60, u: 'g', n: 'jalapeños en rodajas' },
      { q: 100, u: 'g', n: 'guacamole' },
      { q: 100, u: 'g', n: 'pico de gallo o tomate picado' }
    ],
    steps: [
      { t: 'Forra la cesta con papel de air fryer y reparte los nachos en una capa.' },
      { t: 'Cubre con el queso y los jalapeños.' },
      { t: 'Cocina a 180 °C durante 6 minutos.', timer: 6 },
      { t: 'Añade el guacamole y el pico de gallo por encima y sirve al momento.' }
    ],
    tips: [
      'Una sola capa: apilados, los de abajo quedan sin queso y los de arriba se queman.',
      'Los ingredientes fríos van siempre al final.'
    ],
    tags: ['vegetariana', 'rapida', 'familiar', 'picante']
  },
  {
    id: 101, name: 'Falafel', emoji: '🧆', category: 'snacks',
    description: 'Bolitas de garbanzo y hierbas, crujientes fuera y esponjosas dentro. 100 % vegetal.',
    prepTime: 20, cookTime: 15, temperature: 190, difficulty: 'Media',
    servings: 4, calories: 230, popularity: 72,
    ingredients: [
      { q: 400, u: 'g', n: 'garbanzos secos remojados 12 h (sin cocer)' },
      { q: 1, u: 'ud', n: 'cebolla' },
      { q: 3, u: 'ud', n: 'dientes de ajo' },
      { q: 4, u: 'cda', n: 'perejil fresco' },
      { q: 1, u: 'cdta', n: 'comino molido' },
      { q: 1, u: 'cdta', n: 'cilantro molido' },
      { q: 2, u: 'cda', n: 'harina de garbanzo' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Tritura los garbanzos remojados con la cebolla, el ajo, el perejil y las especias hasta obtener una pasta con grano.' },
      { t: 'Añade la harina, salpimienta y refrigera la mezcla 20 minutos.', timer: 20 },
      { t: 'Forma bolitas aplanadas de unos 4 cm.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y pulveriza aceite.', timer: 3 },
      { t: 'Cocina 15 minutos dando la vuelta a los 8 minutos.', timer: 15 },
      { t: 'Sirve con hummus, pan de pita y salsa de yogur.' }
    ],
    tips: [
      'Usa garbanzos SECOS remojados, nunca cocidos: con los de bote la masa se deshace.',
      'Si la mezcla no liga, añade otra cucharada de harina de garbanzo.'
    ],
    tags: ['vegetariana', 'saludable', 'proteina', 'economica', 'crujiente']
  },

  /* ─────────────  POSTRES (ampliación)  ───────────── */
  {
    id: 102, name: 'Bizcocho de yogur', emoji: '🍰', category: 'postres',
    description: 'El bizcocho de la infancia, esponjoso y con la medida del vaso de yogur.',
    prepTime: 15, cookTime: 28, temperature: 160, difficulty: 'Media',
    servings: 6, calories: 290, popularity: 84,
    ingredients: [
      { q: 125, u: 'g', n: 'yogur natural' },
      { q: 2, u: 'ud', n: 'huevos' },
      { q: 150, u: 'g', n: 'azúcar' },
      { q: 200, u: 'g', n: 'harina' },
      { q: 80, u: 'ml', n: 'aceite de girasol' },
      { q: 8, u: 'g', n: 'levadura química' },
      { q: 1, u: 'ud', n: 'ralladura de limón' }
    ],
    steps: [
      { t: 'Bate los huevos con el azúcar hasta que blanqueen.' },
      { t: 'Añade el yogur, el aceite y la ralladura y mezcla.' },
      { t: 'Incorpora la harina con la levadura tamizadas, con movimientos envolventes.' },
      { t: 'Vierte en un molde engrasado que quepa holgado en la cesta.' },
      { t: 'Cocina a 160 °C durante 28 minutos sin abrir la tapa los primeros 20.', timer: 28 },
      { t: 'Comprueba con un palillo y deja enfriar sobre una rejilla 15 minutos.', timer: 15 }
    ],
    tips: [
      'Abrir la air fryer antes de tiempo hace que el bizcocho se baje.',
      'Cubre con aluminio si la superficie se dora antes de que cuaje el centro.',
      'Nunca superes los 165 °C en repostería: se quema por fuera y queda crudo por dentro.'
    ],
    tags: ['vegetariana', 'familiar', 'economica']
  },
  {
    id: 103, name: 'Coulant de chocolate', emoji: '🌋', category: 'postres',
    description: 'Corazón líquido de chocolate en 9 minutos. Cuestión de cronómetro.',
    prepTime: 15, cookTime: 9, temperature: 190, difficulty: 'Difícil',
    servings: 2, calories: 380, popularity: 86,
    ingredients: [
      { q: 100, u: 'g', n: 'chocolate negro' },
      { q: 70, u: 'g', n: 'mantequilla' },
      { q: 2, u: 'ud', n: 'huevos' },
      { q: 60, u: 'g', n: 'azúcar' },
      { q: 40, u: 'g', n: 'harina' },
      { q: null, u: '', n: 'Mantequilla y cacao para los moldes' }
    ],
    steps: [
      { t: 'Funde el chocolate con la mantequilla y deja templar.' },
      { t: 'Bate los huevos con el azúcar, añade el chocolate y por último la harina tamizada.' },
      { t: 'Engrasa dos moldes individuales y espolvoréalos con cacao.' },
      { t: 'Reparte la masa y refrigera 15 minutos.', timer: 15 },
      { t: 'Precalienta a 190 °C durante 4 minutos y cocina exactamente 9 minutos.', timer: 9 },
      { t: 'Desmolda con cuidado y sirve inmediatamente.' }
    ],
    tips: [
      'El borde debe verse cuajado y el centro tembloroso: ese es el punto exacto.',
      'Un minuto de más y se queda sin corazón líquido. Cronometra.',
      'Refrigerar la masa antes ayuda mucho a que el centro quede fundido.'
    ],
    tags: ['vegetariana', 'rapida']
  },
  {
    id: 104, name: 'Crumble de manzana', emoji: '🍏', category: 'postres',
    description: 'Manzana especiada bajo una capa crujiente de mantequilla, harina y avena.',
    prepTime: 15, cookTime: 20, temperature: 170, difficulty: 'Fácil',
    servings: 4, calories: 310, popularity: 79,
    ingredients: [
      { q: 4, u: 'ud', n: 'manzanas' },
      { q: 100, u: 'g', n: 'harina' },
      { q: 60, u: 'g', n: 'copos de avena' },
      { q: 80, u: 'g', n: 'mantequilla fría en dados' },
      { q: 80, u: 'g', n: 'azúcar moreno' },
      { q: 1, u: 'cdta', n: 'canela molida' },
      { q: 1, u: 'cda', n: 'zumo de limón' }
    ],
    steps: [
      { t: 'Pela y trocea las manzanas y mézclalas con el limón, la canela y la mitad del azúcar.' },
      { t: 'Frota la harina, la avena, la mantequilla y el resto del azúcar con los dedos hasta obtener migas.' },
      { t: 'Pon la manzana en un molde y cúbrela con la mezcla de migas.' },
      { t: 'Cocina a 170 °C durante 20 minutos.', timer: 20 },
      { t: 'Deja templar 10 minutos y sirve con helado de vainilla.', timer: 10 }
    ],
    tips: [
      'La mantequilla debe estar fría: es lo que crea las migas crujientes.',
      'Si la cobertura se dora demasiado pronto, cúbrela con papel de aluminio.'
    ],
    tags: ['vegetariana', 'familiar', 'economica']
  },
  {
    id: 105, name: 'Muffins de arándanos', emoji: '🧁', category: 'postres',
    description: 'Esponjosos, con la cúpula dorada y arándanos jugosos. Salen 6 unidades.',
    prepTime: 15, cookTime: 16, temperature: 160, difficulty: 'Fácil',
    servings: 6, calories: 240, popularity: 77,
    ingredients: [
      { q: 200, u: 'g', n: 'harina' },
      { q: 100, u: 'g', n: 'azúcar' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 120, u: 'ml', n: 'leche' },
      { q: 60, u: 'ml', n: 'aceite de girasol' },
      { q: 8, u: 'g', n: 'levadura química' },
      { q: 120, u: 'g', n: 'arándanos' }
    ],
    steps: [
      { t: 'Mezcla los ingredientes secos por un lado y los líquidos por otro.' },
      { t: 'Únelos removiendo lo justo: la masa debe quedar con grumos.' },
      { t: 'Incorpora los arándanos enharinados y reparte en cápsulas de papel.' },
      { t: 'Precalienta a 160 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 16 minutos, máximo 4 muffins por tanda.', timer: 16 },
      { t: 'Deja enfriar 10 minutos sobre una rejilla.', timer: 10 }
    ],
    tips: [
      'Enharinar los arándanos evita que se hundan al fondo.',
      'Batir de más desarrolla el gluten y los deja gomosos: mezcla lo mínimo.',
      'Usa cápsulas dobles o metálicas: las de papel solas se abren con el aire.'
    ],
    tags: ['vegetariana', 'familiar']
  },
  {
    id: 106, name: 'Tostadas francesas', emoji: '🍞', category: 'postres',
    description: 'Pan empapado en huevo y leche, dorado y con canela. Desayuno de fin de semana.',
    prepTime: 10, cookTime: 10, temperature: 180, difficulty: 'Fácil',
    servings: 2, calories: 320, popularity: 81,
    ingredients: [
      { q: 4, u: 'ud', n: 'rebanadas de pan brioche o de molde grueso' },
      { q: 2, u: 'ud', n: 'huevos' },
      { q: 120, u: 'ml', n: 'leche' },
      { q: 1, u: 'cdta', n: 'canela molida' },
      { q: 1, u: 'cdta', n: 'extracto de vainilla' },
      { q: 1, u: 'cda', n: 'azúcar' },
      { q: null, u: '', n: 'Mantequilla, miel o sirope para servir' }
    ],
    steps: [
      { t: 'Bate los huevos con la leche, la canela, la vainilla y el azúcar.' },
      { t: 'Empapa cada rebanada 20 segundos por cada lado y escurre el exceso.' },
      { t: 'Precalienta a 180 °C durante 3 minutos y forra la cesta con papel de air fryer.', timer: 3 },
      { t: 'Cocina 10 minutos dando la vuelta a los 6 minutos.', timer: 10 },
      { t: 'Sirve con mantequilla, miel y fruta fresca.' }
    ],
    tips: [
      'El pan del día anterior absorbe mejor y no se deshace.',
      'Escurre bien: empapado en exceso queda crudo por dentro.'
    ],
    tags: ['vegetariana', 'rapida', 'economica', 'familiar']
  },
  {
    id: 107, name: 'Buñuelos de viento', emoji: '🍩', category: 'postres',
    description: 'Ligeros y huecos por dentro, rebozados en azúcar. Todo un clásico de otoño.',
    prepTime: 25, cookTime: 12, temperature: 190, difficulty: 'Difícil',
    servings: 4, calories: 250, popularity: 67,
    ingredients: [
      { q: 125, u: 'ml', n: 'agua' },
      { q: 125, u: 'ml', n: 'leche' },
      { q: 150, u: 'g', n: 'harina' },
      { q: 60, u: 'g', n: 'mantequilla' },
      { q: 3, u: 'ud', n: 'huevos' },
      { q: 1, u: 'pizca', n: 'sal' },
      { q: 50, u: 'g', n: 'azúcar para rebozar' }
    ],
    steps: [
      { t: 'Hierve el agua con la leche, la mantequilla y la sal. Añade la harina de golpe y remueve hasta que la masa se despegue.' },
      { t: 'Deja templar 10 minutos e incorpora los huevos uno a uno, integrando bien cada uno.', timer: 10 },
      { t: 'Forma bolitas con dos cucharas sobre papel de air fryer, bien separadas.' },
      { t: 'Precalienta a 190 °C durante 4 minutos y pulveriza aceite.', timer: 4 },
      { t: 'Cocina 12 minutos sin abrir los primeros 8 minutos.', timer: 12 },
      { t: 'Reboza en azúcar en caliente y rellena de crema o nata si quieres.' }
    ],
    tips: [
      'Abrir antes de los 8 minutos hace que se desinflen de golpe.',
      'Añade los huevos de uno en uno: si la masa se corta, ya no sube.',
      'Crecen mucho: no pongas más de 5 por tanda.'
    ],
    tags: ['vegetariana', 'familiar', 'economica']
  },
  {
    id: 108, name: 'Piña asada con canela', emoji: '🍍', category: 'postres',
    description: 'Rodajas caramelizadas por fuera y jugosas por dentro. Postre ligero en 12 minutos.',
    prepTime: 5, cookTime: 12, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 110, popularity: 66,
    ingredients: [
      { q: 6, u: 'ud', n: 'rodajas de piña natural' },
      { q: 1, u: 'cda', n: 'azúcar moreno' },
      { q: 1, u: 'cdta', n: 'canela molida' },
      { q: 1, u: 'cda', n: 'zumo de lima' }
    ],
    steps: [
      { t: 'Seca las rodajas de piña con papel de cocina.' },
      { t: 'Espolvorea el azúcar y la canela por ambas caras.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 12 minutos dando la vuelta a los 7 minutos.', timer: 12 },
      { t: 'Riega con zumo de lima y sirve sola o con yogur griego.' }
    ],
    tips: [
      'Usa papel de air fryer: el azúcar caramelizado se pega muchísimo.',
      'Con piña de lata escurrida funciona igual, pero baja a 8 minutos.'
    ],
    tags: ['saludable', 'vegetariana', 'rapida', 'sin-gluten']
  },

  /* ─────────────  POLLO (ampliación 2)  ───────────── */
  {
    id: 109, name: 'Pollo al ajillo', emoji: '🧄', category: 'pollo',
    description: 'Pollo troceado con mucho ajo, vino blanco y perejil. Receta de abuela sin sartén.',
    prepTime: 10, cookTime: 22, temperature: 190, difficulty: 'Fácil',
    servings: 4, calories: 320, popularity: 84,
    ingredients: [
      { q: 1, u: 'ud', n: 'pollo troceado (1 kg)' },
      { q: 8, u: 'ud', n: 'dientes de ajo laminados' },
      { q: 3, u: 'cda', n: 'aceite de oliva' },
      { q: 60, u: 'ml', n: 'vino blanco' },
      { q: 3, u: 'cda', n: 'perejil fresco picado' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Salpimienta el pollo y mézclalo con el aceite y la mitad del ajo.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 15 minutos dando la vuelta a los 8 minutos.', timer: 15 },
      { t: 'Añade el resto del ajo y el vino y cocina 7 minutos más.', timer: 7 },
      { t: 'Espolvorea el perejil y sirve con el jugo de la cesta.' }
    ],
    tips: [
      'Reserva la mitad del ajo para el final: si va todo desde el principio, se quema y amarga.',
      'Usa un molde o papel con borde para no perder el jugo del vino.'
    ],
    tags: ['proteina', 'familiar', 'economica', 'sin-gluten']
  },
  {
    id: 110, name: 'Pechuga rellena de espinacas y queso', emoji: '🌿', category: 'pollo',
    description: 'Relleno cremoso de espinacas y queso dentro de una pechuga jugosa.',
    prepTime: 15, cookTime: 20, temperature: 185, difficulty: 'Media',
    servings: 2, calories: 320, popularity: 74,
    ingredients: [
      { q: 2, u: 'ud', n: 'pechugas de pollo' },
      { q: 100, u: 'g', n: 'espinacas frescas' },
      { q: 80, u: 'g', n: 'queso crema' },
      { q: 1, u: 'ud', n: 'diente de ajo picado' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal, pimienta y pimentón' }
    ],
    steps: [
      { t: 'Saltea las espinacas con el ajo 2 minutos y escúrrelas bien.', timer: 2 },
      { t: 'Mézclalas con el queso crema, sal y pimienta.' },
      { t: 'Haz un corte lateral profundo en cada pechuga y rellénalas. Cierra con palillos.' },
      { t: 'Unta con aceite y pimentón por fuera.' },
      { t: 'Precalienta a 185 °C durante 3 minutos y cocina 20 minutos dando la vuelta a los 11.', timer: 20 },
      { t: 'Deja reposar 5 minutos antes de cortar.', timer: 5 }
    ],
    tips: [
      'Escurre muy bien las espinacas o el relleno se saldrá.',
      'Los palillos son imprescindibles: el aire caliente abre el corte.'
    ],
    tags: ['proteina', 'saludable', 'sin-gluten']
  },
  {
    id: 111, name: 'Pollo a la naranja', emoji: '🍊', category: 'pollo',
    description: 'Dados crujientes bañados en una salsa cítrica y brillante. Estilo asiático.',
    prepTime: 15, cookTime: 16, temperature: 195, difficulty: 'Media',
    servings: 2, calories: 340, popularity: 76,
    ingredients: [
      { q: 400, u: 'g', n: 'pechuga de pollo en dados' },
      { q: 2, u: 'cda', n: 'maicena' },
      { q: 150, u: 'ml', n: 'zumo de naranja' },
      { q: 1, u: 'cda', n: 'salsa de soja' },
      { q: 1, u: 'cda', n: 'miel' },
      { q: 1, u: 'cdta', n: 'jengibre rallado' },
      { q: 1, u: 'cda', n: 'semillas de sésamo' }
    ],
    steps: [
      { t: 'Reboza el pollo en la maicena y sacude el exceso.' },
      { t: 'Precalienta a 195 °C durante 3 minutos y cocina el pollo 16 minutos agitando cada 5.', timer: 16 },
      { t: 'Reduce en un cazo el zumo, la soja, la miel y el jengibre hasta que espese, unos 6 minutos.', timer: 6 },
      { t: 'Mezcla el pollo con la salsa justo antes de servir.' },
      { t: 'Espolvorea sésamo y acompaña con arroz.' }
    ],
    tips: [
      'Mezcla pollo y salsa en el último momento para que no pierda el crujiente.',
      'La ralladura de la naranja intensifica muchísimo el sabor.'
    ],
    tags: ['proteina', 'familiar']
  },
  {
    id: 112, name: 'Alitas al limón y pimienta', emoji: '🍋', category: 'pollo',
    description: 'Versión cítrica y fresca de las alitas, con mucha pimienta negra.',
    prepTime: 10, cookTime: 22, temperature: 200, difficulty: 'Fácil',
    servings: 2, calories: 310, popularity: 78,
    ingredients: [
      { q: 700, u: 'g', n: 'alitas de pollo partidas' },
      { q: 1, u: 'cdta', n: 'levadura química (impulsor)' },
      { q: 1, u: 'ud', n: 'limón (zumo y ralladura)' },
      { q: 1, u: 'cdta', n: 'pimienta negra molida gruesa' },
      { q: 20, u: 'g', n: 'mantequilla derretida' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Seca las alitas y mézclalas con la levadura, la sal y media cucharadita de pimienta.' },
      { t: 'Precalienta a 200 °C durante 3 minutos y cocina 22 minutos dando la vuelta a los 12.', timer: 22 },
      { t: 'Mezcla la mantequilla con el zumo, la ralladura y el resto de la pimienta.' },
      { t: 'Baña las alitas calientes y remueve bien.' }
    ],
    tips: [
      'La ralladura aporta más aroma que el zumo: no la tires.',
      'Muele la pimienta en el momento; la ya molida pierde casi todo el punto.'
    ],
    tags: ['proteina', 'crujiente', 'sin-gluten', 'familiar']
  },
  {
    id: 113, name: 'Milanesa de pollo', emoji: '🍗', category: 'pollo',
    description: 'Filete fino empanado con parmesano, dorado y crujiente en 12 minutos.',
    prepTime: 15, cookTime: 12, temperature: 200, difficulty: 'Fácil',
    servings: 2, calories: 350, popularity: 86,
    ingredients: [
      { q: 4, u: 'ud', n: 'filetes finos de pechuga de pollo' },
      { q: 2, u: 'ud', n: 'huevos' },
      { q: 120, u: 'g', n: 'pan rallado' },
      { q: 40, u: 'g', n: 'queso parmesano rallado' },
      { q: 1, u: 'ud', n: 'diente de ajo picado' },
      { q: null, u: '', n: 'Sal, pimienta, perejil y aceite en espray' }
    ],
    steps: [
      { t: 'Bate los huevos con el ajo, el perejil, la sal y la pimienta y marina los filetes 10 minutos.', timer: 10 },
      { t: 'Mezcla el pan rallado con el parmesano y reboza presionando bien.' },
      { t: 'Precalienta a 200 °C durante 3 minutos y pulveriza aceite por ambas caras.', timer: 3 },
      { t: 'Cocina 12 minutos dando la vuelta a los 7 minutos.', timer: 12 },
      { t: 'Sirve con limón y ensalada.' }
    ],
    tips: [
      'Filetes de menos de 1 cm: si son gruesos, quedan crudos por dentro.',
      'El parmesano en el rebozado es lo que da el dorado bonito.'
    ],
    tags: ['proteina', 'crujiente', 'familiar', 'rapida']
  },
  {
    id: 114, name: 'Medio pollo a la brasa', emoji: '🔥', category: 'pollo',
    description: 'Adobo ahumado y piel muy crujiente. Media pieza que cabe perfecta en la cesta.',
    prepTime: 12, cookTime: 35, temperature: 185, difficulty: 'Media',
    servings: 2, calories: 400, popularity: 79,
    ingredients: [
      { q: 1, u: 'ud', n: 'medio pollo abierto' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'pimentón ahumado' },
      { q: 1, u: 'cdta', n: 'ajo en polvo' },
      { q: 1, u: 'cdta', n: 'orégano seco' },
      { q: 1, u: 'cdta', n: 'azúcar moreno' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Seca el pollo y frótalo con el aceite y todas las especias.' },
      { t: 'Deja reposar 30 minutos si tienes tiempo.', timer: 30 },
      { t: 'Precalienta a 185 °C durante 4 minutos.', timer: 4 },
      { t: 'Cocina 20 minutos con la piel hacia abajo.', timer: 20 },
      { t: 'Dale la vuelta y cocina 15 minutos más con la piel hacia arriba.', timer: 15 },
      { t: 'Deja reposar 8 minutos antes de trocear.', timer: 8 }
    ],
    tips: [
      'Aplasta el pollo para que quede lo más plano posible: se hace mucho más uniforme.',
      'El azúcar del adobo ayuda a dorar, pero vigila los últimos 5 minutos.'
    ],
    tags: ['proteina', 'familiar', 'sin-gluten']
  },
  {
    id: 115, name: 'Burritos de pollo', emoji: '🌯', category: 'pollo',
    description: 'Tortilla dorada y crujiente por fuera, con pollo, arroz y queso dentro.',
    prepTime: 15, cookTime: 10, temperature: 190, difficulty: 'Fácil',
    servings: 4, calories: 420, popularity: 82,
    ingredients: [
      { q: 4, u: 'ud', n: 'tortillas de trigo grandes' },
      { q: 300, u: 'g', n: 'pollo cocinado desmenuzado' },
      { q: 200, u: 'g', n: 'arroz cocido' },
      { q: 150, u: 'g', n: 'queso rallado' },
      { q: 150, u: 'g', n: 'alubias rojas cocidas' },
      { q: 1, u: 'cdta', n: 'comino molido' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Mezcla el pollo con el arroz, las alubias, el comino, la sal y la pimienta.' },
      { t: 'Rellena las tortillas, añade el queso y ciérralas doblando los laterales.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y pulveriza aceite.', timer: 3 },
      { t: 'Cocina 10 minutos con el cierre hacia abajo, dando la vuelta a los 6 minutos.', timer: 10 },
      { t: 'Corta por la mitad y sirve con guacamole.' }
    ],
    tips: [
      'Cierre hacia abajo al principio: así se sella solo y no se abre.',
      'Perfecto para aprovechar restos de pollo o arroz del día anterior.'
    ],
    tags: ['proteina', 'familiar', 'economica']
  },
  {
    id: 116, name: 'Pollo con champiñones y nata', emoji: '🍄', category: 'pollo',
    description: 'Plato único cremoso: dados de pollo y champiñones en salsa de nata.',
    prepTime: 12, cookTime: 20, temperature: 185, difficulty: 'Media',
    servings: 2, calories: 380, popularity: 73,
    ingredients: [
      { q: 400, u: 'g', n: 'pechuga de pollo en dados' },
      { q: 250, u: 'g', n: 'champiñones laminados' },
      { q: 150, u: 'ml', n: 'nata para cocinar' },
      { q: 1, u: 'ud', n: 'cebolla en juliana' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal, pimienta y perejil' }
    ],
    steps: [
      { t: 'Mezcla el pollo, los champiñones y la cebolla con el aceite, la sal y la pimienta en un molde.' },
      { t: 'Precalienta a 185 °C durante 3 minutos y cocina 14 minutos removiendo a mitad.', timer: 14 },
      { t: 'Añade la nata y remueve.' },
      { t: 'Cocina 6 minutos más hasta que la salsa espese.', timer: 6 },
      { t: 'Espolvorea perejil y sirve con arroz o pasta.' }
    ],
    tips: [
      'Necesitas un molde apto: la salsa se perdería por la rejilla.',
      'Los champiñones sueltan agua al principio; la salsa espesa al final.'
    ],
    tags: ['proteina', 'familiar', 'sin-gluten']
  },
  {
    id: 117, name: 'Muslos de pollo con patatas', emoji: '🥔', category: 'pollo',
    description: 'Plato único de domingo: el pollo suelta su jugo sobre las patatas.',
    prepTime: 15, cookTime: 30, temperature: 190, difficulty: 'Fácil',
    servings: 4, calories: 450, popularity: 88,
    ingredients: [
      { q: 4, u: 'ud', n: 'muslos de pollo' },
      { q: 700, u: 'g', n: 'patatas en gajos' },
      { q: 1, u: 'ud', n: 'cebolla en juliana' },
      { q: 3, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: 1, u: 'cdta', n: 'tomillo seco' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Mezcla las patatas y la cebolla con la mitad del aceite, sal y pimienta.' },
      { t: 'Adoba los muslos con el resto del aceite, el pimentón y el tomillo.' },
      { t: 'Precalienta a 190 °C durante 4 minutos y pon las patatas abajo con el pollo encima.', timer: 4 },
      { t: 'Cocina 18 minutos.', timer: 18 },
      { t: 'Remueve las patatas, da la vuelta al pollo y cocina 12 minutos más.', timer: 12 },
      { t: 'Deja reposar 5 minutos y sirve todo junto.', timer: 5 }
    ],
    tips: [
      'El pollo arriba y las patatas abajo: así reciben toda la grasa y quedan mucho más sabrosas.',
      'Si tu cesta es pequeña, cocina las patatas primero y luego junta todo 12 minutos.'
    ],
    tags: ['proteina', 'familiar', 'economica', 'sin-gluten']
  },
  {
    id: 118, name: 'Pollo búfalo picante', emoji: '🌶️', category: 'pollo',
    description: 'Tiras crujientes bañadas en salsa búfalo. Pican, avisamos.',
    prepTime: 15, cookTime: 16, temperature: 200, difficulty: 'Media',
    servings: 2, calories: 330, popularity: 77,
    ingredients: [
      { q: 400, u: 'g', n: 'pechuga de pollo en tiras' },
      { q: 60, u: 'g', n: 'harina' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 100, u: 'g', n: 'pan rallado panko' },
      { q: 4, u: 'cda', n: 'salsa picante tipo búfalo' },
      { q: 20, u: 'g', n: 'mantequilla derretida' },
      { q: null, u: '', n: 'Sal y aceite en espray' }
    ],
    steps: [
      { t: 'Pasa las tiras por harina, huevo y panko.' },
      { t: 'Precalienta a 200 °C durante 3 minutos y pulveriza aceite.', timer: 3 },
      { t: 'Cocina 16 minutos dando la vuelta a los 9 minutos.', timer: 16 },
      { t: 'Mezcla la salsa picante con la mantequilla y baña el pollo.' },
      { t: 'Sirve con salsa de queso azul o yogur y apio.' }
    ],
    tips: [
      'La mantequilla suaviza el picante y hace que la salsa se pegue mejor.',
      'Baña justo antes de servir para no perder el crujiente.'
    ],
    tags: ['proteina', 'picante', 'crujiente']
  },
  {
    id: 119, name: 'Nuggets rellenos de queso', emoji: '🍗', category: 'pollo',
    description: 'Nuggets caseros con corazón de mozzarella fundida. Éxito garantizado.',
    prepTime: 25, cookTime: 12, temperature: 200, difficulty: 'Media',
    servings: 4, calories: 300, popularity: 81,
    ingredients: [
      { q: 500, u: 'g', n: 'pollo picado' },
      { q: 120, u: 'g', n: 'mozzarella en dados' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 120, u: 'g', n: 'pan rallado panko' },
      { q: 50, u: 'g', n: 'harina' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Salpimienta el pollo picado y forma bolas aplanadas con un dado de queso dentro.' },
      { t: 'Séllalas bien con las manos húmedas para que no se escape el queso.' },
      { t: 'Pásalas por harina, huevo y panko.' },
      { t: 'Congélalas 15 minutos.', timer: 15 },
      { t: 'Precalienta a 200 °C durante 3 minutos, pulveriza aceite y cocina 12 minutos dando la vuelta a los 7.', timer: 12 },
      { t: 'Deja templar 3 minutos: el queso quema mucho.', timer: 3 }
    ],
    tips: [
      'Sellar bien y congelar antes es lo único que impide que el queso se escape.',
      'Se congelan crudos perfectamente: añade 4 minutos al cocinarlos.'
    ],
    tags: ['proteina', 'familiar', 'crujiente']
  },
  {
    id: 120, name: 'Pollo tandoori', emoji: '🍛', category: 'pollo',
    description: 'Marinada india de yogur y especias, con ese color rojizo tan característico.',
    prepTime: 15, cookTime: 22, temperature: 195, difficulty: 'Fácil',
    servings: 4, calories: 300, popularity: 72,
    ingredients: [
      { q: 8, u: 'ud', n: 'contramuslos de pollo' },
      { q: 200, u: 'g', n: 'yogur natural' },
      { q: 2, u: 'cdta', n: 'pimentón dulce' },
      { q: 1, u: 'cdta', n: 'garam masala o curry' },
      { q: 1, u: 'cdta', n: 'comino molido' },
      { q: 2, u: 'ud', n: 'dientes de ajo rallados' },
      { q: 1, u: 'cda', n: 'zumo de limón' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Haz cortes en el pollo para que penetre la marinada.' },
      { t: 'Mezcla el yogur con todas las especias, el ajo, el limón y la sal.' },
      { t: 'Marina el pollo al menos 30 minutos (mejor toda la noche).', timer: 30 },
      { t: 'Escurre bien y precalienta a 195 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 22 minutos dando la vuelta a los 12 minutos.', timer: 22 },
      { t: 'Sirve con arroz basmati, cebolla morada y limón.' }
    ],
    tips: [
      'Escurrir el exceso de yogur es clave: si no, se cuece en vez de tostarse.',
      'Los cortes en la carne hacen que la marinada llegue al interior.'
    ],
    tags: ['proteina', 'saludable', 'sin-gluten', 'familiar']
  },

  /* ─────────────  CARNE (ampliación 2)  ───────────── */
  {
    id: 121, name: 'Redondo de ternera asado', emoji: '🍖', category: 'carne',
    description: 'Una pieza entera para toda la semana: en caliente como plato, en frío para bocadillos.',
    prepTime: 12, cookTime: 35, temperature: 180, difficulty: 'Media',
    servings: 6, calories: 260, popularity: 70,
    ingredients: [
      { q: 900, u: 'g', n: 'redondo de ternera' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'romero seco' },
      { q: 1, u: 'cdta', n: 'ajo en polvo' },
      { q: 1, u: 'cdta', n: 'mostaza de Dijon' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Ata la pieza con hilo de cocina para que mantenga la forma.' },
      { t: 'Úntala con el aceite, la mostaza y las especias.' },
      { t: 'Precalienta a 200 °C durante 5 minutos y sella la carne 8 minutos dándole vueltas.', timer: 8 },
      { t: 'Baja a 180 °C y cocina 27 minutos más, girando cada 9 minutos.', timer: 27 },
      { t: 'Envuelve en aluminio y deja reposar 15 minutos antes de cortar muy fino.', timer: 15 }
    ],
    tips: [
      'Sellar primero a temperatura alta y bajar después es lo que mantiene el interior jugoso.',
      'Cortar en frío permite lonchas mucho más finas para bocadillos.'
    ],
    tags: ['proteina', 'familiar', 'sin-gluten']
  },
  {
    id: 122, name: 'Chuletas de cerdo con manzana', emoji: '🍎', category: 'carne',
    description: 'El dulce de la manzana asada equilibra la chuleta. Plato completo en una tanda.',
    prepTime: 10, cookTime: 18, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 340, popularity: 68,
    ingredients: [
      { q: 2, u: 'ud', n: 'chuletas de cerdo' },
      { q: 2, u: 'ud', n: 'manzanas en gajos' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'tomillo seco' },
      { q: 1, u: 'cda', n: 'miel' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Salpimienta las chuletas y úntalas con aceite y tomillo.' },
      { t: 'Mezcla los gajos de manzana con la miel.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina las chuletas 10 minutos.', timer: 10 },
      { t: 'Dales la vuelta, añade la manzana y cocina 8 minutos más.', timer: 8 },
      { t: 'Deja reposar 3 minutos y sirve.', timer: 3 }
    ],
    tips: [
      'La manzana entra después: si va desde el principio, se deshace.',
      'Chuletas de 2 cm son las que mejor punto dan en air fryer.'
    ],
    tags: ['proteina', 'sin-gluten', 'familiar']
  },
  {
    id: 123, name: 'Mini hamburguesas', emoji: '🍔', category: 'carne',
    description: 'Sliders para compartir: se hacen seis de una vez y desaparecen en un momento.',
    prepTime: 15, cookTime: 10, temperature: 195, difficulty: 'Fácil',
    servings: 3, calories: 380, popularity: 80,
    ingredients: [
      { q: 500, u: 'g', n: 'carne picada de ternera' },
      { q: 6, u: 'ud', n: 'panecillos pequeños' },
      { q: 6, u: 'ud', n: 'lonchas de queso' },
      { q: 1, u: 'cdta', n: 'ajo en polvo' },
      { q: 1, u: 'cdta', n: 'cebolla en polvo' },
      { q: null, u: '', n: 'Sal, pimienta, pepinillos y salsas' }
    ],
    steps: [
      { t: 'Mezcla la carne con las especias, la sal y la pimienta sin amasar de más.' },
      { t: 'Forma 6 hamburguesitas de 1,5 cm con un hoyito en el centro.' },
      { t: 'Precalienta a 195 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 5 minutos, da la vuelta y cocina 4 minutos más.', timer: 9 },
      { t: 'Pon el queso encima y cocina 1 minuto para fundirlo.', timer: 1 },
      { t: 'Monta con pepinillos y tus salsas favoritas.' }
    ],
    tips: [
      'Al ser pequeñas se hacen antes: no las dejes más de 10 minutos o se secan.',
      'Tuesta los panecillos 2 minutos a 180 °C mientras reposa la carne.'
    ],
    tags: ['proteina', 'familiar', 'rapida']
  },
  {
    id: 124, name: 'Pastel de carne', emoji: '🍖', category: 'carne',
    description: 'Meatloaf jugoso con glaseado de tomate. Se corta en lonchas y aguanta días.',
    prepTime: 20, cookTime: 35, temperature: 175, difficulty: 'Media',
    servings: 6, calories: 320, popularity: 66,
    ingredients: [
      { q: 700, u: 'g', n: 'carne picada mixta' },
      { q: 1, u: 'ud', n: 'cebolla picada' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 80, u: 'g', n: 'pan rallado' },
      { q: 4, u: 'cda', n: 'kétchup' },
      { q: 1, u: 'cda', n: 'salsa Worcestershire' },
      { q: null, u: '', n: 'Sal, pimienta y perejil' }
    ],
    steps: [
      { t: 'Mezcla la carne con la cebolla, el huevo, el pan rallado, 2 cucharadas de kétchup, la salsa, sal y pimienta.' },
      { t: 'Forma un pan alargado en un molde engrasado que quepa en la cesta.' },
      { t: 'Precalienta a 175 °C durante 4 minutos y cocina 25 minutos.', timer: 25 },
      { t: 'Pinta con el resto del kétchup y cocina 10 minutos más.', timer: 10 },
      { t: 'Deja reposar 10 minutos antes de cortar en lonchas.', timer: 10 }
    ],
    tips: [
      'Sin reposo se desmonta al cortarlo: espera esos 10 minutos.',
      'Escurre la grasa del molde a mitad de cocción si la carne es muy grasa.'
    ],
    tags: ['proteina', 'familiar', 'economica']
  },
  {
    id: 125, name: 'Pinchos morunos', emoji: '🍢', category: 'carne',
    description: 'Brochetas especiadas de cerdo con comino, pimentón y cúrcuma. Sabor de feria.',
    prepTime: 15, cookTime: 14, temperature: 195, difficulty: 'Fácil',
    servings: 4, calories: 290, popularity: 75,
    ingredients: [
      { q: 600, u: 'g', n: 'lomo de cerdo en dados' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'comino molido' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: 0.5, u: 'cdta', n: 'cúrcuma' },
      { q: 2, u: 'ud', n: 'dientes de ajo picados' },
      { q: null, u: '', n: 'Sal, pimienta y perejil' }
    ],
    steps: [
      { t: 'Mezcla el aceite con todas las especias, el ajo, la sal y la pimienta.' },
      { t: 'Marina la carne al menos 30 minutos.', timer: 30 },
      { t: 'Monta las brochetas apretando bien los dados.' },
      { t: 'Precalienta a 195 °C durante 3 minutos y cocina 14 minutos dando la vuelta a los 7.', timer: 14 },
      { t: 'Sirve con pan y ensalada.' }
    ],
    tips: [
      'Comprueba que la brocheta cabe en la cesta antes de montarla.',
      'Dados de 2,5 cm: más pequeños se secan, más grandes quedan crudos.'
    ],
    tags: ['proteina', 'economica', 'familiar', 'sin-gluten']
  },
  {
    id: 126, name: 'Panceta crujiente', emoji: '🥩', category: 'carne',
    description: 'Cubos de panceta con la corteza crujiente y el interior meloso.',
    prepTime: 8, cookTime: 25, temperature: 190, difficulty: 'Media',
    servings: 3, calories: 460, popularity: 69,
    ingredients: [
      { q: 500, u: 'g', n: 'panceta fresca en cubos' },
      { q: 1, u: 'cdta', n: 'pimentón ahumado' },
      { q: 1, u: 'cdta', n: 'ajo en polvo' },
      { q: null, u: '', n: 'Sal gruesa y pimienta' }
    ],
    steps: [
      { t: 'Seca los cubos y haz cortes en la corteza sin llegar a la carne.' },
      { t: 'Frota con sal gruesa, pimentón, ajo y pimienta.' },
      { t: 'Precalienta a 190 °C durante 4 minutos.', timer: 4 },
      { t: 'Cocina 25 minutos agitando la cesta cada 8 minutos.', timer: 25 },
      { t: 'Escurre sobre papel y sirve muy caliente.' }
    ],
    tips: [
      'Suelta bastante grasa: retírala a mitad para evitar humo.',
      'Los cortes en la corteza son los que la hacen explotar de crujiente.'
    ],
    tags: ['proteina', 'crujiente', 'sin-gluten']
  },
  {
    id: 127, name: 'Salchichas con cebolla y pimiento', emoji: '🌭', category: 'carne',
    description: 'Plato único de una sola tanda: salchichas doradas sobre verduras caramelizadas.',
    prepTime: 10, cookTime: 20, temperature: 185, difficulty: 'Fácil',
    servings: 3, calories: 350, popularity: 74,
    ingredients: [
      { q: 6, u: 'ud', n: 'salchichas frescas' },
      { q: 2, u: 'ud', n: 'pimientos en tiras' },
      { q: 2, u: 'ud', n: 'cebollas en juliana' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'orégano seco' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Mezcla las verduras con el aceite, el orégano, la sal y la pimienta.' },
      { t: 'Precalienta a 185 °C durante 3 minutos y cocina las verduras 8 minutos.', timer: 8 },
      { t: 'Pon las salchichas encima y cocina 12 minutos más, dándoles la vuelta a los 6.', timer: 12 },
      { t: 'Sirve en pan o con arroz.' }
    ],
    tips: [
      'Las verduras primero: necesitan más tiempo que las salchichas.',
      'Pincha las salchichas para que no revienten.'
    ],
    tags: ['proteina', 'economica', 'familiar', 'sin-gluten']
  },
  {
    id: 128, name: 'Hamburguesa de pavo', emoji: '🍔', category: 'carne',
    description: 'Versión ligera de la hamburguesa, con hierbas y cebolla para que no quede seca.',
    prepTime: 12, cookTime: 14, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 280, popularity: 67,
    ingredients: [
      { q: 400, u: 'g', n: 'pavo picado' },
      { q: 0.5, u: 'ud', n: 'cebolla rallada y escurrida' },
      { q: 1, u: 'cda', n: 'pan rallado' },
      { q: 1, u: 'cdta', n: 'mostaza de Dijon' },
      { q: 2, u: 'cda', n: 'perejil fresco picado' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Mezcla todos los ingredientes y forma 2 hamburguesas con un hoyito central.' },
      { t: 'Refrigéralas 10 minutos para que se compacten.', timer: 10 },
      { t: 'Precalienta a 190 °C durante 3 minutos y pulveriza aceite.', timer: 3 },
      { t: 'Cocina 14 minutos dando la vuelta a los 8 minutos.', timer: 14 },
      { t: 'Monta con lechuga, tomate y una salsa de yogur.' }
    ],
    tips: [
      'El pavo es muy magro: la cebolla rallada y la mostaza aportan la jugosidad que le falta.',
      'No superes los 15 minutos o se secará.'
    ],
    tags: ['saludable', 'proteina', 'rapida']
  },
  {
    id: 129, name: 'Escalope de ternera', emoji: '🥩', category: 'carne',
    description: 'Filete empanado fino y crujiente, listo en 12 minutos. Clásico de cualquier menú.',
    prepTime: 12, cookTime: 12, temperature: 200, difficulty: 'Fácil',
    servings: 2, calories: 390, popularity: 76,
    ingredients: [
      { q: 4, u: 'ud', n: 'filetes finos de ternera' },
      { q: 2, u: 'ud', n: 'huevos' },
      { q: 60, u: 'g', n: 'harina' },
      { q: 120, u: 'g', n: 'pan rallado' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Aplana los filetes con un mazo y salpimienta.' },
      { t: 'Pásalos por harina, huevo batido y pan rallado presionando bien.' },
      { t: 'Precalienta a 200 °C durante 3 minutos y pulveriza aceite por las dos caras.', timer: 3 },
      { t: 'Cocina 12 minutos dando la vuelta a los 7 minutos.', timer: 12 },
      { t: 'Sirve con limón y patatas.' }
    ],
    tips: [
      'Pulveriza bien: las zonas secas quedan blancas y con sabor a harina cruda.',
      'Cuanto más fino el filete, más crujiente el resultado.'
    ],
    tags: ['proteina', 'crujiente', 'rapida', 'familiar']
  },
  {
    id: 130, name: 'Chistorra', emoji: '🌭', category: 'carne',
    description: 'Chistorra dorada y sin salpicaduras, lista en 8 minutos para el aperitivo.',
    prepTime: 3, cookTime: 8, temperature: 190, difficulty: 'Fácil',
    servings: 3, calories: 380, popularity: 71,
    ingredients: [
      { q: 400, u: 'g', n: 'chistorra' },
      { q: null, u: '', n: 'Pan para acompañar' }
    ],
    steps: [
      { t: 'Corta la chistorra en trozos de unos 8 cm.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 8 minutos dando la vuelta a los 4 minutos.', timer: 8 },
      { t: 'Sirve con pan para mojar la grasa.' }
    ],
    tips: [
      'No añadas aceite: suelta muchísima grasa por sí sola.',
      'Pon una rebanada de pan debajo: se empapa y está buenísima.'
    ],
    tags: ['rapida', 'proteina', 'familiar', 'sin-gluten']
  },
  {
    id: 131, name: 'Brochetas de solomillo y champiñones', emoji: '🍄', category: 'carne',
    description: 'Elegantes y rápidas: solomillo tierno con champiñones y pimiento.',
    prepTime: 15, cookTime: 12, temperature: 200, difficulty: 'Media',
    servings: 2, calories: 300, popularity: 66,
    ingredients: [
      { q: 400, u: 'g', n: 'solomillo de cerdo en dados' },
      { q: 200, u: 'g', n: 'champiñones enteros' },
      { q: 1, u: 'ud', n: 'pimiento rojo en trozos' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'romero seco' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Adoba la carne y las verduras con el aceite, el romero, la sal y la pimienta.' },
      { t: 'Monta las brochetas alternando ingredientes.' },
      { t: 'Precalienta a 200 °C durante 4 minutos.', timer: 4 },
      { t: 'Cocina 12 minutos dando la vuelta a los 6 minutos.', timer: 12 },
      { t: 'Deja reposar 3 minutos antes de servir.', timer: 3 }
    ],
    tips: [
      'El solomillo se pasa muy rápido: 12 minutos son suficientes.',
      'Champiñones pequeños enteros aguantan mejor que laminados.'
    ],
    tags: ['proteina', 'rapida', 'sin-gluten']
  },
  {
    id: 132, name: 'Lomo relleno de queso y jamón', emoji: '🥩', category: 'carne',
    description: 'Rollo de lomo con queso fundido dentro y costra dorada por fuera.',
    prepTime: 18, cookTime: 22, temperature: 185, difficulty: 'Media',
    servings: 4, calories: 400, popularity: 68,
    ingredients: [
      { q: 700, u: 'g', n: 'lomo de cerdo abierto en libro' },
      { q: 100, u: 'g', n: 'queso en lonchas' },
      { q: 80, u: 'g', n: 'jamón serrano' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Salpimienta el lomo abierto y cúbrelo con el jamón y el queso.' },
      { t: 'Enróllalo apretando y átalo con hilo de cocina.' },
      { t: 'Úntalo con aceite y pimentón.' },
      { t: 'Precalienta a 185 °C durante 4 minutos y cocina 22 minutos girando cada 7 minutos.', timer: 22 },
      { t: 'Deja reposar 10 minutos antes de cortar en rodajas.', timer: 10 }
    ],
    tips: [
      'Atar bien es lo que evita que el queso se escape por los lados.',
      'Deja enfriar un poco antes de cortar o el relleno se saldrá.'
    ],
    tags: ['proteina', 'familiar']
  },

  /* ─────────────  PESCADO (ampliación 2)  ───────────── */
  {
    id: 133, name: 'Salmón teriyaki', emoji: '🍣', category: 'pescado',
    description: 'Lomos lacados con salsa teriyaki y sésamo. Doce minutos de reloj.',
    prepTime: 10, cookTime: 12, temperature: 180, difficulty: 'Fácil',
    servings: 2, calories: 340, popularity: 85,
    ingredients: [
      { q: 2, u: 'ud', n: 'lomos de salmón' },
      { q: 3, u: 'cda', n: 'salsa de soja' },
      { q: 1, u: 'cda', n: 'miel' },
      { q: 1, u: 'cdta', n: 'jengibre rallado' },
      { q: 1, u: 'cdta', n: 'aceite de sésamo' },
      { q: 1, u: 'cda', n: 'semillas de sésamo' }
    ],
    steps: [
      { t: 'Mezcla la soja, la miel, el jengibre y el aceite de sésamo.' },
      { t: 'Marina el salmón 10 minutos reservando parte de la salsa.', timer: 10 },
      { t: 'Precalienta a 180 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 9 minutos con la piel hacia abajo.', timer: 9 },
      { t: 'Pinta con la salsa reservada y cocina 3 minutos más.', timer: 3 },
      { t: 'Espolvorea sésamo y sirve con arroz.' }
    ],
    tips: [
      'La salsa con miel al final: si va desde el principio se quema.',
      'No pases de 12-13 minutos o el salmón perderá toda su jugosidad.'
    ],
    tags: ['proteina', 'saludable', 'rapida']
  },
  {
    id: 134, name: 'Brochetas de langostinos y piña', emoji: '🍤', category: 'pescado',
    description: 'Dulce y salado en la misma brocheta, con un toque de lima.',
    prepTime: 12, cookTime: 10, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 220, popularity: 71,
    ingredients: [
      { q: 400, u: 'g', n: 'langostinos pelados' },
      { q: 200, u: 'g', n: 'piña en dados' },
      { q: 1, u: 'ud', n: 'pimiento rojo en trozos' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: 1, u: 'ud', n: 'lima' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Adoba los langostinos con el aceite, el pimentón, la sal y la pimienta.' },
      { t: 'Monta las brochetas alternando langostino, piña y pimiento.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 10 minutos dando la vuelta a los 5 minutos.', timer: 10 },
      { t: 'Riega con zumo de lima al servir.' }
    ],
    tips: [
      'Los langostinos se pasan enseguida: en cuanto estén rosados y curvados, listos.',
      'La piña caramelizada es lo mejor de la brocheta: no la sustituyas por piña de lata muy blanda.'
    ],
    tags: ['saludable', 'proteina', 'rapida', 'sin-gluten']
  },
  {
    id: 135, name: 'Lubina al horno con verduras', emoji: '🍋', category: 'pescado',
    description: 'Filetes de lubina sobre una cama de verduras. Cena completa y ligera.',
    prepTime: 12, cookTime: 16, temperature: 180, difficulty: 'Media',
    servings: 2, calories: 260, popularity: 69,
    ingredients: [
      { q: 2, u: 'ud', n: 'filetes de lubina' },
      { q: 1, u: 'ud', n: 'calabacín en rodajas' },
      { q: 1, u: 'ud', n: 'pimiento en tiras' },
      { q: 1, u: 'ud', n: 'cebolla en juliana' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'ud', n: 'limón en rodajas' },
      { q: null, u: '', n: 'Sal, pimienta y eneldo' }
    ],
    steps: [
      { t: 'Mezcla las verduras con la mitad del aceite, sal y pimienta.' },
      { t: 'Precalienta a 180 °C durante 3 minutos y cocina las verduras 8 minutos.', timer: 8 },
      { t: 'Coloca la lubina encima con el resto del aceite, el eneldo y el limón.' },
      { t: 'Cocina 8 minutos más sin darle la vuelta.', timer: 8 },
      { t: 'Sirve con el jugo de las verduras.' }
    ],
    tips: [
      'El pescado siempre encima de las verduras: se cocina al vapor de ellas y queda más jugoso.',
      'Está listo cuando la carne se abre en lascas con el tenedor.'
    ],
    tags: ['saludable', 'proteina', 'sin-gluten']
  },
  {
    id: 136, name: 'Sardinas asadas', emoji: '🐟', category: 'pescado',
    description: 'Sardinas con la piel crujiente y sin llenar la cocina de humo.',
    prepTime: 8, cookTime: 10, temperature: 200, difficulty: 'Fácil',
    servings: 2, calories: 240, popularity: 64,
    ingredients: [
      { q: 8, u: 'ud', n: 'sardinas limpias' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal gruesa y limón' }
    ],
    steps: [
      { t: 'Seca las sardinas y úntalas con un poco de aceite y sal gruesa.' },
      { t: 'Precalienta a 200 °C durante 3 minutos y forra la cesta con papel de air fryer.', timer: 3 },
      { t: 'Cocina 10 minutos dando la vuelta a los 6 minutos.', timer: 10 },
      { t: 'Sirve con limón y pan.' }
    ],
    tips: [
      'Pon dos cucharadas de agua en el cajón inferior: reduce muchísimo el humo del pescado azul.',
      'El papel de air fryer evita que se peguen y se rompan al girarlas.'
    ],
    tags: ['saludable', 'proteina', 'economica', 'rapida', 'sin-gluten']
  },
  {
    id: 137, name: 'Hamburguesas de salmón', emoji: '🍔', category: 'pescado',
    description: 'Salmón picado con eneldo y limón, en formato hamburguesa. Muy jugosas.',
    prepTime: 20, cookTime: 12, temperature: 190, difficulty: 'Media',
    servings: 4, calories: 290, popularity: 68,
    ingredients: [
      { q: 600, u: 'g', n: 'salmón fresco sin piel' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 60, u: 'g', n: 'pan rallado panko' },
      { q: 2, u: 'cda', n: 'eneldo fresco picado' },
      { q: 1, u: 'cda', n: 'zumo de limón' },
      { q: 2, u: 'ud', n: 'cebolletas picadas' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Pica el salmón a cuchillo en trozos pequeños (no lo tritures).' },
      { t: 'Mézclalo con el huevo, el panko, el eneldo, el limón, la cebolleta, la sal y la pimienta.' },
      { t: 'Forma 4 hamburguesas y refrigéralas 15 minutos.', timer: 15 },
      { t: 'Precalienta a 190 °C durante 3 minutos y pulveriza aceite.', timer: 3 },
      { t: 'Cocina 12 minutos dando la vuelta a los 7 minutos.', timer: 12 },
      { t: 'Sirve con salsa de yogur y eneldo.' }
    ],
    tips: [
      'Picar a cuchillo mantiene la textura; triturado queda pastoso.',
      'El paso por la nevera es lo que impide que se deshagan al girarlas.'
    ],
    tags: ['saludable', 'proteina']
  },
  {
    id: 138, name: 'Soldaditos de Pavía', emoji: '🐟', category: 'pescado',
    description: 'Tiras de bacalao con rebozado amarillo y crujiente. Tapa clásica del sur.',
    prepTime: 20, cookTime: 12, temperature: 200, difficulty: 'Media',
    servings: 4, calories: 270, popularity: 66,
    ingredients: [
      { q: 500, u: 'g', n: 'bacalao desalado en tiras' },
      { q: 120, u: 'g', n: 'harina' },
      { q: 150, u: 'ml', n: 'agua fría con gas' },
      { q: 0.5, u: 'cdta', n: 'levadura química' },
      { q: 0.5, u: 'cdta', n: 'cúrcuma o azafrán' },
      { q: null, u: '', n: 'Sal y aceite en espray' }
    ],
    steps: [
      { t: 'Bate la harina con el agua con gas, la levadura, la cúrcuma y una pizca de sal.' },
      { t: 'Seca el bacalao y pásalo por la masa dejando escurrir el exceso.' },
      { t: 'Precalienta a 200 °C durante 3 minutos y forra la cesta con papel de air fryer.', timer: 3 },
      { t: 'Pulveriza aceite generosamente y cocina 12 minutos dando la vuelta a los 7 minutos.', timer: 12 },
      { t: 'Sirve inmediatamente con limón.' }
    ],
    tips: [
      'El agua con gas muy fría hace el rebozado mucho más ligero.',
      'Sin papel de air fryer, la masa líquida gotea y se pega a la rejilla.'
    ],
    tags: ['proteina', 'crujiente']
  },
  {
    id: 139, name: 'Anillas de calamar con lima', emoji: '🦑', category: 'pescado',
    description: 'Calamar con rebozado ligero de maicena y un toque de lima y chile.',
    prepTime: 15, cookTime: 10, temperature: 200, difficulty: 'Media',
    servings: 2, calories: 250, popularity: 67,
    ingredients: [
      { q: 400, u: 'g', n: 'anillas de calamar' },
      { q: 60, u: 'g', n: 'maicena' },
      { q: 1, u: 'cdta', n: 'pimentón picante' },
      { q: 1, u: 'ud', n: 'lima' },
      { q: null, u: '', n: 'Sal y aceite en espray' }
    ],
    steps: [
      { t: 'Seca muy bien las anillas.' },
      { t: 'Mezcla la maicena con el pimentón y la sal y reboza sacudiendo el exceso.' },
      { t: 'Precalienta a 200 °C durante 3 minutos y pulveriza aceite.', timer: 3 },
      { t: 'Cocina 10 minutos dando la vuelta a los 6 minutos.', timer: 10 },
      { t: 'Ralla lima por encima y sirve con alioli.' }
    ],
    tips: [
      'La maicena da un rebozado mucho más fino y crujiente que la harina.',
      'Más de 11 minutos y el calamar se vuelve gomoso.'
    ],
    tags: ['proteina', 'crujiente', 'rapida', 'picante']
  },
  {
    id: 140, name: 'Trucha con almendras', emoji: '🐟', category: 'pescado',
    description: 'Trucha entera con almendras tostadas y mantequilla. Receta navarra.',
    prepTime: 10, cookTime: 16, temperature: 185, difficulty: 'Media',
    servings: 2, calories: 320, popularity: 62,
    ingredients: [
      { q: 2, u: 'ud', n: 'truchas limpias' },
      { q: 40, u: 'g', n: 'almendras laminadas' },
      { q: 20, u: 'g', n: 'mantequilla' },
      { q: 2, u: 'ud', n: 'lonchas de jamón serrano' },
      { q: 1, u: 'ud', n: 'limón' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Salpimienta las truchas por dentro y mete una loncha de jamón en cada una.' },
      { t: 'Precalienta a 185 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 12 minutos dando la vuelta a los 7 minutos.', timer: 12 },
      { t: 'Añade las almendras y la mantequilla y cocina 4 minutos más.', timer: 4 },
      { t: 'Riega con limón y sirve.' }
    ],
    tips: [
      'Las almendras al final: en 4 minutos se tuestan y en 8 se queman.',
      'Comprueba que la trucha cabe entera antes de rellenarla.'
    ],
    tags: ['proteina', 'saludable', 'sin-gluten']
  },
  {
    id: 141, name: 'Tacos de atún con sésamo', emoji: '🌮', category: 'pescado',
    description: 'Atún sellado por fuera y rosado por dentro sobre tortilla con aguacate.',
    prepTime: 15, cookTime: 8, temperature: 200, difficulty: 'Media',
    servings: 2, calories: 330, popularity: 70,
    ingredients: [
      { q: 300, u: 'g', n: 'atún fresco en tacos' },
      { q: 2, u: 'cda', n: 'semillas de sésamo' },
      { q: 2, u: 'cda', n: 'salsa de soja' },
      { q: 4, u: 'ud', n: 'tortillas de maíz' },
      { q: 1, u: 'ud', n: 'aguacate' },
      { q: 1, u: 'ud', n: 'lima' },
      { q: null, u: '', n: 'Sal, pimienta y cilantro' }
    ],
    steps: [
      { t: 'Marina el atún con la soja 10 minutos y rebózalo en sésamo.', timer: 10 },
      { t: 'Precalienta a 200 °C durante 4 minutos.', timer: 4 },
      { t: 'Cocina 8 minutos dando la vuelta a los 4 minutos.', timer: 8 },
      { t: 'Calienta las tortillas 2 minutos a 160 °C.', timer: 2 },
      { t: 'Corta el atún en láminas y monta con aguacate, lima y cilantro.' }
    ],
    tips: [
      'Si te gusta el atún crudo por dentro, baja a 6 minutos.',
      'El sésamo forma una costra que protege el interior del calor.'
    ],
    tags: ['saludable', 'proteina', 'rapida']
  },
  {
    id: 142, name: 'Merluza con espárragos', emoji: '🌱', category: 'pescado',
    description: 'Lomos de merluza con espárragos trigueros y ajo. Cena ligera en 15 minutos.',
    prepTime: 10, cookTime: 15, temperature: 180, difficulty: 'Fácil',
    servings: 2, calories: 230, popularity: 72,
    ingredients: [
      { q: 2, u: 'ud', n: 'lomos de merluza' },
      { q: 300, u: 'g', n: 'espárragos trigueros' },
      { q: 2, u: 'ud', n: 'dientes de ajo laminados' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cda', n: 'zumo de limón' },
      { q: null, u: '', n: 'Sal, pimienta y perejil' }
    ],
    steps: [
      { t: 'Mezcla los espárragos con la mitad del aceite, el ajo, la sal y la pimienta.' },
      { t: 'Precalienta a 180 °C durante 3 minutos y cocina los espárragos 7 minutos.', timer: 7 },
      { t: 'Coloca la merluza encima con el resto del aceite y salpimienta.' },
      { t: 'Cocina 8 minutos más.', timer: 8 },
      { t: 'Riega con limón y perejil al servir.' }
    ],
    tips: [
      'Las verduras primero y el pescado después: cada uno con su tiempo justo.',
      'Si los lomos son muy gruesos, súmales 2 minutos.'
    ],
    tags: ['saludable', 'proteina', 'rapida', 'sin-gluten']
  },

  /* ─────────────  VERDURAS (ampliación 2)  ───────────── */
  {
    id: 143, name: 'Pimientos rellenos de queso', emoji: '🫑', category: 'verduras',
    description: 'Mitades de pimiento con relleno cremoso y gratinado. Entrante vistoso.',
    prepTime: 15, cookTime: 16, temperature: 185, difficulty: 'Fácil',
    servings: 4, calories: 190, popularity: 71,
    ingredients: [
      { q: 4, u: 'ud', n: 'pimientos rojos' },
      { q: 200, u: 'g', n: 'queso crema' },
      { q: 100, u: 'g', n: 'queso rallado' },
      { q: 2, u: 'ud', n: 'dientes de ajo picados' },
      { q: 2, u: 'cda', n: 'perejil fresco picado' },
      { q: null, u: '', n: 'Sal, pimienta y aceite de oliva' }
    ],
    steps: [
      { t: 'Corta los pimientos por la mitad y retira las semillas.' },
      { t: 'Mezcla el queso crema con el ajo, el perejil, la sal y la pimienta.' },
      { t: 'Rellena las mitades y cúbrelas con el queso rallado.' },
      { t: 'Precalienta a 185 °C durante 3 minutos y cocina 16 minutos.', timer: 16 },
      { t: 'Deja templar 3 minutos antes de servir.', timer: 3 }
    ],
    tips: [
      'No les des la vuelta: se cocinan solo por arriba.',
      'Si el pimiento no se apoya bien, córtale una base plana.'
    ],
    tags: ['vegetariana', 'sin-gluten', 'familiar']
  },
  {
    id: 144, name: 'Tomates rellenos de atún', emoji: '🍅', category: 'verduras',
    description: 'Tomates asados con relleno de atún y huevo. Ligeros y de aprovechamiento.',
    prepTime: 15, cookTime: 14, temperature: 180, difficulty: 'Fácil',
    servings: 4, calories: 170, popularity: 65,
    ingredients: [
      { q: 4, u: 'ud', n: 'tomates grandes' },
      { q: 160, u: 'g', n: 'atún en conserva escurrido' },
      { q: 2, u: 'ud', n: 'huevos cocidos picados' },
      { q: 60, u: 'g', n: 'queso rallado' },
      { q: 2, u: 'cda', n: 'mayonesa' },
      { q: null, u: '', n: 'Sal, pimienta y orégano' }
    ],
    steps: [
      { t: 'Corta la parte superior de los tomates y vacíalos con una cuchara.' },
      { t: 'Mezcla el atún con el huevo, la mayonesa, la sal y la pimienta.' },
      { t: 'Rellena los tomates y cubre con queso y orégano.' },
      { t: 'Precalienta a 180 °C durante 3 minutos y cocina 14 minutos.', timer: 14 },
      { t: 'Sirve templados.' }
    ],
    tips: [
      'Sala el interior del tomate y déjalo boca abajo 10 minutos: soltará el exceso de agua.',
      'Usa tomates firmes; los muy maduros se deshacen.'
    ],
    tags: ['saludable', 'proteina', 'economica', 'sin-gluten']
  },
  {
    id: 145, name: 'Setas al ajillo', emoji: '🍄', category: 'verduras',
    description: 'Setas variadas con ajo, guindilla y perejil. Guarnición de lujo en 10 minutos.',
    prepTime: 8, cookTime: 10, temperature: 195, difficulty: 'Fácil',
    servings: 2, calories: 100, popularity: 70,
    ingredients: [
      { q: 400, u: 'g', n: 'setas variadas' },
      { q: 3, u: 'ud', n: 'dientes de ajo laminados' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'ud', n: 'guindilla seca' },
      { q: 2, u: 'cda', n: 'perejil fresco picado' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Limpia las setas con un paño y trocéalas.' },
      { t: 'Mézclalas con el aceite, la sal y la pimienta.' },
      { t: 'Precalienta a 195 °C durante 3 minutos y cocina 7 minutos.', timer: 7 },
      { t: 'Añade el ajo y la guindilla y cocina 3 minutos más.', timer: 3 },
      { t: 'Espolvorea perejil al sacarlas.' }
    ],
    tips: [
      'Nunca laves las setas bajo el grifo: absorben agua y luego se cuecen.',
      'El ajo al final para que no se queme.'
    ],
    tags: ['saludable', 'vegetariana', 'rapida', 'sin-gluten']
  },
  {
    id: 146, name: 'Pisto de verduras', emoji: '🍆', category: 'verduras',
    description: 'El pisto de siempre, pero sin estar media hora removiendo la sartén.',
    prepTime: 15, cookTime: 22, temperature: 185, difficulty: 'Fácil',
    servings: 4, calories: 140, popularity: 74,
    ingredients: [
      { q: 1, u: 'ud', n: 'berenjena en dados' },
      { q: 1, u: 'ud', n: 'calabacín en dados' },
      { q: 1, u: 'ud', n: 'pimiento rojo en dados' },
      { q: 1, u: 'ud', n: 'cebolla en dados' },
      { q: 200, u: 'ml', n: 'tomate triturado' },
      { q: 3, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal, pimienta y azúcar' }
    ],
    steps: [
      { t: 'Mezcla todas las verduras con el aceite, la sal y la pimienta.' },
      { t: 'Precalienta a 185 °C durante 3 minutos y cocina 14 minutos removiendo cada 5.', timer: 14 },
      { t: 'Añade el tomate triturado y una pizca de azúcar en un molde.' },
      { t: 'Cocina 8 minutos más.', timer: 8 },
      { t: 'Sirve solo, con huevo frito o como guarnición.' }
    ],
    tips: [
      'Las verduras se doran primero y el tomate se añade después: así no quedan cocidas.',
      'Está aún mejor de un día para otro.'
    ],
    tags: ['saludable', 'vegetariana', 'economica', 'sin-gluten', 'familiar']
  },
  {
    id: 147, name: 'Puerros gratinados', emoji: '🧅', category: 'verduras',
    description: 'Puerros tiernos con bechamel rápida y queso gratinado por encima.',
    prepTime: 15, cookTime: 20, temperature: 180, difficulty: 'Media',
    servings: 4, calories: 210, popularity: 61,
    ingredients: [
      { q: 6, u: 'ud', n: 'puerros' },
      { q: 200, u: 'ml', n: 'nata para cocinar' },
      { q: 100, u: 'g', n: 'queso rallado' },
      { q: 1, u: 'cda', n: 'mantequilla' },
      { q: null, u: '', n: 'Sal, pimienta y nuez moscada' }
    ],
    steps: [
      { t: 'Limpia los puerros y córtalos en trozos de 6 cm.' },
      { t: 'Precalienta a 180 °C durante 3 minutos y cocina los puerros con la mantequilla 12 minutos.', timer: 12 },
      { t: 'Colócalos en un molde, cubre con la nata, la sal, la pimienta y la nuez moscada.' },
      { t: 'Añade el queso y cocina 8 minutos más hasta gratinar.', timer: 8 },
      { t: 'Deja templar 3 minutos antes de servir.', timer: 3 }
    ],
    tips: [
      'Usa solo la parte blanca y verde clara: la verde oscura queda fibrosa.',
      'Si tu air fryer no gratina bien, sube a 200 °C los 3 últimos minutos.'
    ],
    tags: ['vegetariana', 'sin-gluten']
  },
  {
    id: 148, name: 'Chips de calabacín', emoji: '🥒', category: 'verduras',
    description: 'Rodajas finísimas y crujientes. Snack vegetal con menos de 100 kcal.',
    prepTime: 10, cookTime: 14, temperature: 170, difficulty: 'Media',
    servings: 2, calories: 90, popularity: 68,
    ingredients: [
      { q: 2, u: 'ud', n: 'calabacines' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'ajo en polvo' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Corta el calabacín en rodajas de 3 mm, mejor con mandolina.' },
      { t: 'Sálalas y déjalas 10 minutos sobre papel para que suelten agua. Sécalas.', timer: 10 },
      { t: 'Mézclalas con el aceite y el ajo en polvo.' },
      { t: 'Cocina a 170 °C durante 14 minutos agitando cada 5 minutos.', timer: 14 },
      { t: 'Deja enfriar 5 minutos: terminan de quedar crujientes.', timer: 5 }
    ],
    tips: [
      'Sacar el agua con sal antes de cocinar es lo que marca la diferencia.',
      'Temperatura baja y paciencia: a 200 °C se queman los bordes y el centro queda blando.'
    ],
    tags: ['saludable', 'vegetariana', 'crujiente', 'economica', 'sin-gluten']
  },
  {
    id: 149, name: 'Remolacha asada', emoji: '🫒', category: 'verduras',
    description: 'Dulce, terrosa y perfecta para ensaladas. Se asa sin manchar nada.',
    prepTime: 10, cookTime: 25, temperature: 190, difficulty: 'Fácil',
    servings: 4, calories: 90, popularity: 58,
    ingredients: [
      { q: 500, u: 'g', n: 'remolacha cruda' },
      { q: 1.5, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'tomillo seco' },
      { q: 1, u: 'cda', n: 'vinagre balsámico' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Pela la remolacha y córtala en dados de 2 cm.' },
      { t: 'Mézclala con el aceite, el tomillo, la sal y la pimienta.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y cocina 25 minutos agitando cada 8.', timer: 25 },
      { t: 'Riega con el vinagre balsámico al sacarla.' },
      { t: 'Sirve templada con queso de cabra y nueces.' }
    ],
    tips: [
      'Usa guantes al pelarla: tiñe muchísimo las manos.',
      'Es una de las verduras que más tarda: no la mezcles con otras de cocción rápida.'
    ],
    tags: ['saludable', 'vegetariana', 'economica', 'sin-gluten']
  },
  {
    id: 150, name: 'Edamame especiado', emoji: '🫛', category: 'verduras',
    description: 'Vainas de soja con sal, ajo y sésamo. Aperitivo proteico en 8 minutos.',
    prepTime: 5, cookTime: 8, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 130, popularity: 60,
    ingredients: [
      { q: 300, u: 'g', n: 'edamame congelado en vaina' },
      { q: 1, u: 'cda', n: 'aceite de sésamo' },
      { q: 1, u: 'cdta', n: 'ajo en polvo' },
      { q: 1, u: 'cda', n: 'semillas de sésamo' },
      { q: null, u: '', n: 'Sal gruesa al gusto' }
    ],
    steps: [
      { t: 'Descongela el edamame y sécalo bien.' },
      { t: 'Mézclalo con el aceite y el ajo en polvo.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y cocina 8 minutos agitando a mitad.', timer: 8 },
      { t: 'Espolvorea sal gruesa y sésamo y sirve caliente.' }
    ],
    tips: [
      'Se come solo el interior: la vaina se chupa y se descarta.',
      'Si lo cocinas congelado, súmale 3 minutos.'
    ],
    tags: ['saludable', 'vegetariana', 'proteina', 'rapida', 'sin-gluten']
  },
  {
    id: 151, name: 'Boniato relleno', emoji: '🍠', category: 'verduras',
    description: 'Boniato asado abierto y relleno de garbanzos, yogur y especias. Plato completo vegano.',
    prepTime: 12, cookTime: 35, temperature: 195, difficulty: 'Media',
    servings: 2, calories: 320, popularity: 66,
    ingredients: [
      { q: 2, u: 'ud', n: 'boniatos grandes' },
      { q: 200, u: 'g', n: 'garbanzos cocidos' },
      { q: 1, u: 'cdta', n: 'comino molido' },
      { q: 1, u: 'cdta', n: 'pimentón ahumado' },
      { q: 100, u: 'g', n: 'yogur natural' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal, pimienta y cilantro' }
    ],
    steps: [
      { t: 'Pincha los boniatos, úntalos con aceite y sal y cocínalos a 195 °C durante 30 minutos.', timer: 30 },
      { t: 'Mezcla los garbanzos escurridos con el comino, el pimentón, aceite y sal.' },
      { t: 'Añádelos a la cesta y cocina 5 minutos más.', timer: 5 },
      { t: 'Abre los boniatos por la mitad y aplasta un poco la pulpa.' },
      { t: 'Rellena con los garbanzos, el yogur y el cilantro.' }
    ],
    tips: [
      'Elige boniatos alargados y del mismo grosor para que se hagan a la vez.',
      'Está listo cuando el cuchillo entra sin resistencia hasta el centro.'
    ],
    tags: ['saludable', 'vegetariana', 'proteina', 'economica', 'sin-gluten']
  },
  {
    id: 152, name: 'Calabacines rellenos de carne', emoji: '🥒', category: 'verduras',
    description: 'Barquitas de calabacín con carne picada y queso gratinado.',
    prepTime: 20, cookTime: 22, temperature: 185, difficulty: 'Media',
    servings: 4, calories: 260, popularity: 72,
    ingredients: [
      { q: 4, u: 'ud', n: 'calabacines medianos' },
      { q: 400, u: 'g', n: 'carne picada' },
      { q: 1, u: 'ud', n: 'cebolla picada' },
      { q: 150, u: 'ml', n: 'tomate frito' },
      { q: 100, u: 'g', n: 'queso rallado' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal, pimienta y orégano' }
    ],
    steps: [
      { t: 'Corta los calabacines por la mitad a lo largo y vacíalos dejando 1 cm de pared.' },
      { t: 'Pica la pulpa y saltéala con la cebolla y la carne 8 minutos. Añade el tomate.', timer: 8 },
      { t: 'Rellena las barquitas y cúbrelas con queso y orégano.' },
      { t: 'Precalienta a 185 °C durante 3 minutos y cocina 22 minutos.', timer: 22 },
      { t: 'Deja templar 5 minutos antes de servir.', timer: 5 }
    ],
    tips: [
      'No vacíes demasiado la pared o la barquita se romperá.',
      'La carne debe ir ya cocinada: dentro del calabacín solo se calienta y gratina.'
    ],
    tags: ['proteina', 'familiar', 'sin-gluten']
  },
  {
    id: 153, name: 'Berenjenas rellenas', emoji: '🍆', category: 'verduras',
    description: 'Mitades de berenjena con sofrito de verduras y queso. Se pueden hacer veganas.',
    prepTime: 20, cookTime: 28, temperature: 185, difficulty: 'Media',
    servings: 4, calories: 240, popularity: 70,
    ingredients: [
      { q: 2, u: 'ud', n: 'berenjenas grandes' },
      { q: 1, u: 'ud', n: 'cebolla picada' },
      { q: 1, u: 'ud', n: 'pimiento rojo picado' },
      { q: 200, u: 'ml', n: 'tomate triturado' },
      { q: 100, u: 'g', n: 'queso rallado' },
      { q: 3, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal, pimienta y orégano' }
    ],
    steps: [
      { t: 'Corta las berenjenas por la mitad, haz cortes en la pulpa y úntalas con aceite y sal.' },
      { t: 'Cocina a 185 °C durante 18 minutos con el corte hacia arriba.', timer: 18 },
      { t: 'Vacía parte de la pulpa y saltéala con la cebolla, el pimiento y el tomate 8 minutos.', timer: 8 },
      { t: 'Rellena las mitades, cubre con queso y orégano.' },
      { t: 'Cocina 10 minutos más hasta gratinar.', timer: 10 }
    ],
    tips: [
      'Los cortes en cruz en la pulpa hacen que se ase por dentro y no solo por la superficie.',
      'Sin queso y con un poco de levadura nutricional queda perfecta en versión vegana.'
    ],
    tags: ['vegetariana', 'saludable', 'economica', 'sin-gluten', 'familiar']
  },
  {
    id: 154, name: 'Croquetas de espinacas y queso', emoji: '🥬', category: 'verduras',
    description: 'Bolitas crujientes de espinacas, patata y queso. Ideales para que los niños coman verdura.',
    prepTime: 25, cookTime: 14, temperature: 195, difficulty: 'Media',
    servings: 4, calories: 210, popularity: 64,
    ingredients: [
      { q: 400, u: 'g', n: 'patatas cocidas y aplastadas' },
      { q: 200, u: 'g', n: 'espinacas cocidas y escurridas' },
      { q: 100, u: 'g', n: 'queso rallado' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 120, u: 'g', n: 'pan rallado panko' },
      { q: null, u: '', n: 'Sal, pimienta, nuez moscada y aceite en espray' }
    ],
    steps: [
      { t: 'Escurre las espinacas apretando muy fuerte para quitar toda el agua.' },
      { t: 'Mézclalas con la patata, el queso, la sal, la pimienta y la nuez moscada.' },
      { t: 'Forma bolitas, pásalas por huevo y panko.' },
      { t: 'Refrigera 15 minutos.', timer: 15 },
      { t: 'Precalienta a 195 °C durante 3 minutos, pulveriza aceite y cocina 14 minutos agitando a mitad.', timer: 14 },
      { t: 'Sirve con salsa de yogur.' }
    ],
    tips: [
      'Si la masa queda húmeda no se sostendrá: escurre las espinacas hasta que no suelten nada.',
      'La nevera antes de cocinar evita que se abran.'
    ],
    tags: ['vegetariana', 'economica', 'crujiente', 'familiar']
  },

  /* ─────────────  PATATAS (ampliación 2)  ───────────── */
  {
    id: 155, name: 'Patatas con queso y bacon', emoji: '🍟', category: 'patatas',
    description: 'Patatas crujientes cubiertas de queso fundido, bacon y cebollino. Para compartir.',
    prepTime: 12, cookTime: 25, temperature: 200, difficulty: 'Fácil',
    servings: 4, calories: 380, popularity: 86,
    ingredients: [
      { q: 800, u: 'g', n: 'patatas en gajos' },
      { q: 150, u: 'g', n: 'queso rallado' },
      { q: 100, u: 'g', n: 'bacon en tiras' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 2, u: 'cda', n: 'cebollino picado' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Seca las patatas y mézclalas con el aceite, la sal y la pimienta.' },
      { t: 'Precalienta a 200 °C durante 3 minutos y cocina 20 minutos agitando cada 7.', timer: 20 },
      { t: 'Añade el bacon y cocina 3 minutos.', timer: 3 },
      { t: 'Cubre con el queso y cocina 2 minutos más hasta que funda.', timer: 2 },
      { t: 'Espolvorea cebollino y sirve al momento.' }
    ],
    tips: [
      'El queso al final y solo 2 minutos: si lo pones antes se quema y se pega.',
      'Sirve directamente en la cesta con papel para no ensuciar más.'
    ],
    tags: ['familiar', 'economica', 'crujiente']
  },
  {
    id: 156, name: 'Patatas al ajillo', emoji: '🧄', category: 'patatas',
    description: 'Dados de patata con mucho ajo y perejil. Guarnición de cinco ingredientes.',
    prepTime: 10, cookTime: 20, temperature: 195, difficulty: 'Fácil',
    servings: 4, calories: 200, popularity: 76,
    ingredients: [
      { q: 700, u: 'g', n: 'patatas en dados' },
      { q: 5, u: 'ud', n: 'dientes de ajo picados' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 3, u: 'cda', n: 'perejil fresco picado' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Seca las patatas y mézclalas con el aceite, la sal y la pimienta.' },
      { t: 'Precalienta a 195 °C durante 3 minutos y cocina 17 minutos agitando cada 6.', timer: 17 },
      { t: 'Añade el ajo picado y cocina 3 minutos más.', timer: 3 },
      { t: 'Mezcla con el perejil fresco y sirve.' }
    ],
    tips: [
      'El ajo picado se quema en menos de 5 minutos: siempre al final.',
      'Con un huevo frito encima se convierte en plato único.'
    ],
    tags: ['vegetariana', 'economica', 'familiar', 'sin-gluten']
  },
  {
    id: 157, name: 'Bolitas de patata rellenas', emoji: '🥔', category: 'patatas',
    description: 'Puré de patata con corazón de queso, empanado y crujiente por fuera.',
    prepTime: 25, cookTime: 14, temperature: 200, difficulty: 'Media',
    servings: 4, calories: 260, popularity: 70,
    ingredients: [
      { q: 600, u: 'g', n: 'patatas cocidas y aplastadas' },
      { q: 120, u: 'g', n: 'mozzarella en dados' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 120, u: 'g', n: 'pan rallado panko' },
      { q: 40, u: 'g', n: 'queso parmesano rallado' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Mezcla el puré con el parmesano, la sal y la pimienta. Debe quedar espeso.' },
      { t: 'Forma bolas con un dado de mozzarella dentro y séllalas bien.' },
      { t: 'Pásalas por huevo y panko y refrigera 15 minutos.', timer: 15 },
      { t: 'Precalienta a 200 °C durante 3 minutos, pulveriza aceite y cocina 14 minutos agitando a mitad.', timer: 14 },
      { t: 'Deja templar 3 minutos antes de comer.', timer: 3 }
    ],
    tips: [
      'El puré debe estar frío: en caliente no se pueden formar las bolas.',
      'Sella muy bien el queso o se escapará por el punto más débil.'
    ],
    tags: ['vegetariana', 'economica', 'crujiente', 'familiar']
  },
  {
    id: 158, name: 'Patatas fritas de boniato', emoji: '🍠', category: 'patatas',
    description: 'Bastones de boniato con maicena para que queden realmente crujientes.',
    prepTime: 12, cookTime: 18, temperature: 190, difficulty: 'Media',
    servings: 2, calories: 200, popularity: 75,
    ingredients: [
      { q: 600, u: 'g', n: 'boniato' },
      { q: 1, u: 'cda', n: 'maicena' },
      { q: 1.5, u: 'cda', n: 'aceite de oliva' },
      { q: 0.5, u: 'cdta', n: 'pimentón dulce' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Corta el boniato en bastones de 1 cm y sécalos bien.' },
      { t: 'Espolvorea la maicena y remueve hasta cubrirlos por completo.' },
      { t: 'Añade el aceite, el pimentón y la sal y mezcla otra vez.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y cocina 18 minutos agitando cada 6.', timer: 18 },
      { t: 'Sirve enseguida: el boniato pierde el crujiente rápido.' }
    ],
    tips: [
      'La maicena antes que el aceite: así se adhiere y crea la costra.',
      'El boniato nunca queda tan crujiente como la patata, pero este truco es lo que más se acerca.'
    ],
    tags: ['saludable', 'vegetariana', 'crujiente', 'sin-gluten']
  },
  {
    id: 159, name: 'Patatas con chorizo', emoji: '🥘', category: 'patatas',
    description: 'Patatas impregnadas del pimentón del chorizo. Plato de cuchara sin cuchara.',
    prepTime: 10, cookTime: 22, temperature: 190, difficulty: 'Fácil',
    servings: 3, calories: 380, popularity: 79,
    ingredients: [
      { q: 700, u: 'g', n: 'patatas en dados' },
      { q: 200, u: 'g', n: 'chorizo en rodajas' },
      { q: 1, u: 'ud', n: 'cebolla en juliana' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Mezcla las patatas y la cebolla con el aceite, el pimentón, la sal y la pimienta.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y cocina 16 minutos agitando cada 6.', timer: 16 },
      { t: 'Añade el chorizo y cocina 6 minutos más.', timer: 6 },
      { t: 'Remueve bien para que las patatas cojan la grasa del chorizo y sirve.' }
    ],
    tips: [
      'El chorizo al final: si va desde el principio suelta toda la grasa y se queda seco.',
      'Con un huevo escalfado encima es cena completa.'
    ],
    tags: ['economica', 'familiar', 'proteina', 'sin-gluten']
  },
  {
    id: 160, name: 'Patatas rellenas de atún', emoji: '🥔', category: 'patatas',
    description: 'Patatas asadas con relleno de atún, tomate y queso. Aprovechan la despensa.',
    prepTime: 12, cookTime: 35, temperature: 200, difficulty: 'Media',
    servings: 2, calories: 350, popularity: 68,
    ingredients: [
      { q: 2, u: 'ud', n: 'patatas grandes para asar' },
      { q: 160, u: 'g', n: 'atún en conserva escurrido' },
      { q: 100, u: 'ml', n: 'tomate frito' },
      { q: 80, u: 'g', n: 'queso rallado' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal, pimienta y orégano' }
    ],
    steps: [
      { t: 'Pincha las patatas, úntalas con aceite y sal y cocínalas a 200 °C durante 30 minutos.', timer: 30 },
      { t: 'Ábrelas por la mitad y vacía parte de la pulpa.' },
      { t: 'Mezcla la pulpa con el atún, el tomate frito, la sal y la pimienta.' },
      { t: 'Rellena, cubre con queso y orégano y cocina 5 minutos más.', timer: 5 },
      { t: 'Sirve caliente.' }
    ],
    tips: [
      'Pinchar la piel evita que la patata reviente por dentro.',
      'Elige patatas del mismo tamaño para que estén listas a la vez.'
    ],
    tags: ['proteina', 'economica', 'familiar', 'sin-gluten']
  },

  /* ─────────────  HUEVOS (ampliación 2)  ───────────── */
  {
    id: 161, name: 'Huevos al horno en aguacate', emoji: '🥑', category: 'huevos',
    description: 'Medio aguacate con un huevo dentro. Desayuno proteico en 12 minutos.',
    prepTime: 5, cookTime: 12, temperature: 180, difficulty: 'Fácil',
    servings: 2, calories: 260, popularity: 72,
    ingredients: [
      { q: 2, u: 'ud', n: 'aguacates' },
      { q: 4, u: 'ud', n: 'huevos pequeños' },
      { q: 40, u: 'g', n: 'queso rallado' },
      { q: null, u: '', n: 'Sal, pimienta y pimentón' }
    ],
    steps: [
      { t: 'Parte los aguacates y retira el hueso. Amplía un poco el hueco con una cuchara.' },
      { t: 'Casca un huevo en cada mitad, con cuidado de que no se desborde.' },
      { t: 'Salpimienta y añade el queso.' },
      { t: 'Cocina a 180 °C durante 12 minutos, o hasta que la clara cuaje.', timer: 12 },
      { t: 'Espolvorea pimentón y sirve.' }
    ],
    tips: [
      'Usa huevos pequeños o se saldrán del hueco.',
      'Apoya los aguacates en un molde para que no vuelquen.'
    ],
    tags: ['saludable', 'proteina', 'vegetariana', 'rapida', 'sin-gluten']
  },
  {
    id: 162, name: 'Muffins de huevo y verduras', emoji: '🥚', category: 'huevos',
    description: 'Mini tortillas en molde individual. Meal prep de desayunos para toda la semana.',
    prepTime: 12, cookTime: 14, temperature: 165, difficulty: 'Fácil',
    servings: 6, calories: 120, popularity: 74,
    ingredients: [
      { q: 6, u: 'ud', n: 'huevos' },
      { q: 1, u: 'ud', n: 'pimiento rojo picado' },
      { q: 100, u: 'g', n: 'espinacas picadas' },
      { q: 80, u: 'g', n: 'queso rallado' },
      { q: 3, u: 'cda', n: 'leche' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Bate los huevos con la leche, la sal y la pimienta.' },
      { t: 'Reparte las verduras y el queso en moldes de magdalena engrasados.' },
      { t: 'Vierte el huevo hasta 3/4 de cada molde.' },
      { t: 'Precalienta a 165 °C durante 3 minutos y cocina 14 minutos.', timer: 14 },
      { t: 'Deja templar 5 minutos y desmolda.', timer: 5 }
    ],
    tips: [
      'Usa moldes de silicona: se desmoldan sin romperse.',
      'Aguantan 4 días en la nevera y se recalientan en 2 minutos a 150 °C.'
    ],
    tags: ['saludable', 'proteina', 'vegetariana', 'rapida', 'sin-gluten']
  },
  {
    id: 163, name: 'Huevos escoceses', emoji: '🥚', category: 'huevos',
    description: 'Huevo cocido envuelto en carne y empanado. Espectacular al cortarlo.',
    prepTime: 25, cookTime: 16, temperature: 190, difficulty: 'Difícil',
    servings: 4, calories: 340, popularity: 63,
    ingredients: [
      { q: 4, u: 'ud', n: 'huevos cocidos y pelados' },
      { q: 400, u: 'g', n: 'carne de salchicha o picada' },
      { q: 1, u: 'ud', n: 'huevo batido' },
      { q: 60, u: 'g', n: 'harina' },
      { q: 120, u: 'g', n: 'pan rallado panko' },
      { q: null, u: '', n: 'Sal, pimienta, tomillo y aceite en espray' }
    ],
    steps: [
      { t: 'Sazona la carne con sal, pimienta y tomillo y divídela en 4 porciones.' },
      { t: 'Aplana cada porción y envuelve con ella un huevo cocido, sellando bien.' },
      { t: 'Pasa por harina, huevo batido y panko.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y pulveriza aceite.', timer: 3 },
      { t: 'Cocina 16 minutos girándolos cada 5 minutos.', timer: 16 },
      { t: 'Deja templar 5 minutos y corta por la mitad.', timer: 5 }
    ],
    tips: [
      'Cuece los huevos 11 minutos si quieres la yema aún cremosa al cortar.',
      'Humedece tus manos al envolver: la carne se pega mucho menos.'
    ],
    tags: ['proteina', 'crujiente', 'familiar']
  },

  /* ─────────────  PIZZA Y PANES (ampliación 2)  ───────────── */
  {
    id: 164, name: 'Pizza cuatro quesos', emoji: '🧀', category: 'pizza',
    description: 'Mozzarella, parmesano, azul y de cabra sobre base fina. Para los muy queseros.',
    prepTime: 12, cookTime: 10, temperature: 180, difficulty: 'Media',
    servings: 2, calories: 520, popularity: 83,
    ingredients: [
      { q: 1, u: 'ud', n: 'base de pizza pequeña' },
      { q: 3, u: 'cda', n: 'salsa de tomate' },
      { q: 100, u: 'g', n: 'mozzarella rallada' },
      { q: 40, u: 'g', n: 'queso azul' },
      { q: 40, u: 'g', n: 'queso de cabra' },
      { q: 30, u: 'g', n: 'queso parmesano rallado' },
      { q: 1, u: 'cdta', n: 'orégano seco' }
    ],
    steps: [
      { t: 'Precalienta a 180 °C durante 3 minutos y cocina la base sola 3 minutos.', timer: 3 },
      { t: 'Extiende el tomate y reparte los cuatro quesos.' },
      { t: 'Cocina 7 minutos más hasta que burbujee.', timer: 7 },
      { t: 'Espolvorea orégano y sirve.' }
    ],
    tips: [
      'Precocinar la base sola evita el centro húmedo.',
      'El queso azul es muy potente: 40 g son suficientes para dos.'
    ],
    tags: ['vegetariana', 'familiar']
  },
  {
    id: 165, name: 'Pan de queso', emoji: '🥯', category: 'pizza',
    description: 'Bolitas de pan sin gluten, elásticas por dentro. El chipá brasileño.',
    prepTime: 15, cookTime: 16, temperature: 180, difficulty: 'Media',
    servings: 4, calories: 220, popularity: 69,
    ingredients: [
      { q: 250, u: 'g', n: 'almidón de mandioca o maicena' },
      { q: 150, u: 'g', n: 'queso rallado curado' },
      { q: 2, u: 'ud', n: 'huevos' },
      { q: 80, u: 'ml', n: 'leche' },
      { q: 60, u: 'ml', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Calienta la leche con el aceite y una pizca de sal sin que hierva.' },
      { t: 'Vierte sobre el almidón y mezcla. Deja templar 5 minutos.', timer: 5 },
      { t: 'Añade los huevos y el queso y amasa hasta obtener una masa pegajosa pero manejable.' },
      { t: 'Forma bolitas con las manos aceitadas.' },
      { t: 'Precalienta a 180 °C durante 3 minutos y cocina 16 minutos.', timer: 16 },
      { t: 'Sirve calientes: recién hechos están mucho mejor.' }
    ],
    tips: [
      'Si la masa se pega demasiado, aceita tus manos en vez de añadir más almidón.',
      'Naturalmente sin gluten: perfecto para celíacos.'
    ],
    tags: ['vegetariana', 'sin-gluten', 'familiar']
  },
  {
    id: 166, name: 'Empanada de atún', emoji: '🥧', category: 'pizza',
    description: 'Empanada gallega en versión pequeña, con relleno jugoso y masa dorada.',
    prepTime: 25, cookTime: 22, temperature: 175, difficulty: 'Media',
    servings: 4, calories: 380, popularity: 74,
    ingredients: [
      { q: 2, u: 'ud', n: 'láminas de masa de empanada' },
      { q: 200, u: 'g', n: 'atún en conserva escurrido' },
      { q: 2, u: 'ud', n: 'cebollas en juliana' },
      { q: 1, u: 'ud', n: 'pimiento rojo en tiras' },
      { q: 150, u: 'ml', n: 'tomate frito' },
      { q: 1, u: 'ud', n: 'huevo batido' },
      { q: null, u: '', n: 'Sal, pimienta y aceite de oliva' }
    ],
    steps: [
      { t: 'Pocha la cebolla y el pimiento 10 minutos y mézclalos con el tomate y el atún.', timer: 10 },
      { t: 'Deja enfriar el relleno por completo.' },
      { t: 'Coloca una lámina de masa en un molde, añade el relleno y cubre con la otra. Sella los bordes.' },
      { t: 'Pinta con huevo y haz un agujero en el centro para que salga el vapor.' },
      { t: 'Precalienta a 175 °C durante 4 minutos y cocina 22 minutos.', timer: 22 },
      { t: 'Deja templar 10 minutos antes de cortar.', timer: 10 }
    ],
    tips: [
      'El relleno debe estar frío o la masa se ablanda y no sube.',
      'El agujero central es imprescindible: sin él la empanada se abre por los lados.'
    ],
    tags: ['familiar', 'economica', 'proteina']
  },
  {
    id: 167, name: 'Pan naan de yogur', emoji: '🫓', category: 'pizza',
    description: 'Pan plano indio, esponjoso y con burbujas, sin horno ni levadura de panadería.',
    prepTime: 15, cookTime: 8, temperature: 190, difficulty: 'Media',
    servings: 4, calories: 230, popularity: 71,
    ingredients: [
      { q: 250, u: 'g', n: 'harina con levadura' },
      { q: 180, u: 'g', n: 'yogur griego natural' },
      { q: 20, u: 'g', n: 'mantequilla derretida' },
      { q: 2, u: 'ud', n: 'dientes de ajo picados' },
      { q: 2, u: 'cda', n: 'cilantro fresco picado' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Mezcla la harina con el yogur y la sal hasta formar una masa suave. Amasa 3 minutos.', timer: 3 },
      { t: 'Deja reposar 15 minutos tapada.', timer: 15 },
      { t: 'Divide en 4 y estira cada porción en forma de lágrima, de unos 5 mm.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y cocina cada pan 8 minutos, dándole la vuelta a los 5.', timer: 8 },
      { t: 'Pinta con la mantequilla mezclada con ajo y cilantro nada más sacarlo.' }
    ],
    tips: [
      'Cocina de uno en uno: necesitan espacio para hinchar.',
      'La mantequilla de ajo siempre al salir, en caliente, para que se absorba.'
    ],
    tags: ['vegetariana', 'economica', 'rapida', 'familiar']
  },

  /* ─────────────  SNACKS (ampliación 2)  ───────────── */
  {
    id: 168, name: 'Samosas de verduras', emoji: '🥟', category: 'snacks',
    description: 'Triángulos crujientes rellenos de patata y guisantes al curry.',
    prepTime: 25, cookTime: 14, temperature: 190, difficulty: 'Media',
    servings: 4, calories: 240, popularity: 68,
    ingredients: [
      { q: 8, u: 'ud', n: 'láminas de pasta filo u obleas' },
      { q: 300, u: 'g', n: 'patatas cocidas y aplastadas' },
      { q: 100, u: 'g', n: 'guisantes cocidos' },
      { q: 1, u: 'cdta', n: 'curry en polvo' },
      { q: 0.5, u: 'cdta', n: 'comino molido' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Mezcla la patata con los guisantes, el curry, el comino, la sal y la pimienta.' },
      { t: 'Corta las láminas en tiras y forma triángulos rellenos doblando en zigzag.' },
      { t: 'Sella el borde con un poco de agua.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y pulveriza aceite.', timer: 3 },
      { t: 'Cocina 14 minutos dando la vuelta a los 8 minutos.', timer: 14 },
      { t: 'Sirve con chutney de mango o salsa de yogur.' }
    ],
    tips: [
      'La pasta filo se seca muy rápido: tapa las láminas que no uses con un paño húmedo.',
      'Pulveriza aceite entre capas para que quede hojaldrada.'
    ],
    tags: ['vegetariana', 'crujiente', 'economica']
  },
  {
    id: 169, name: 'Chips de tortilla caseros', emoji: '🌽', category: 'snacks',
    description: 'Nachos hechos con tortillas de trigo o maíz. Cinco minutos y sin fritura.',
    prepTime: 5, cookTime: 7, temperature: 180, difficulty: 'Fácil',
    servings: 4, calories: 150, popularity: 76,
    ingredients: [
      { q: 4, u: 'ud', n: 'tortillas de maíz o trigo' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Corta cada tortilla en 8 triángulos.' },
      { t: 'Pincélalos con aceite y espolvorea el pimentón y la sal.' },
      { t: 'Precalienta a 180 °C durante 2 minutos.', timer: 2 },
      { t: 'Cocina 7 minutos agitando la cesta a los 4 minutos.', timer: 7 },
      { t: 'Deja enfriar 3 minutos: terminan de endurecerse fuera.', timer: 3 }
    ],
    tips: [
      'Vigila el último minuto: pasan de dorados a quemados muy rápido.',
      'En una sola capa; apilados quedan blandos.'
    ],
    tags: ['vegetariana', 'economica', 'rapida', 'crujiente']
  },
  {
    id: 170, name: 'Arancini de arroz', emoji: '🍙', category: 'snacks',
    description: 'Bolas de risotto rellenas de mozzarella, empanadas y crujientes. Aprovechan el arroz sobrante.',
    prepTime: 25, cookTime: 15, temperature: 195, difficulty: 'Difícil',
    servings: 4, calories: 290, popularity: 65,
    ingredients: [
      { q: 500, u: 'g', n: 'arroz cocido frío (mejor risotto)' },
      { q: 120, u: 'g', n: 'mozzarella en dados' },
      { q: 2, u: 'ud', n: 'huevos' },
      { q: 60, u: 'g', n: 'harina' },
      { q: 140, u: 'g', n: 'pan rallado panko' },
      { q: 50, u: 'g', n: 'queso parmesano rallado' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Mezcla el arroz frío con el parmesano, un huevo, sal y pimienta.' },
      { t: 'Forma bolas con un dado de mozzarella dentro, sellando bien.' },
      { t: 'Pásalas por harina, huevo batido y panko.' },
      { t: 'Refrigera 20 minutos.', timer: 20 },
      { t: 'Precalienta a 195 °C durante 3 minutos, pulveriza aceite y cocina 15 minutos agitando a mitad.', timer: 15 },
      { t: 'Sirve con salsa de tomate.' }
    ],
    tips: [
      'El arroz debe estar frío de nevera: en caliente es imposible formar las bolas.',
      'Compacta bien apretando: una bola floja se abre al cocinarse.'
    ],
    tags: ['vegetariana', 'economica', 'crujiente', 'familiar']
  },
  {
    id: 171, name: 'Wontons crujientes', emoji: '🥟', category: 'snacks',
    description: 'Obleas rellenas de carne y verduras, doradas sin freír.',
    prepTime: 25, cookTime: 12, temperature: 190, difficulty: 'Media',
    servings: 4, calories: 250, popularity: 67,
    ingredients: [
      { q: 24, u: 'ud', n: 'obleas de wonton' },
      { q: 250, u: 'g', n: 'carne picada de cerdo' },
      { q: 2, u: 'ud', n: 'cebolletas picadas' },
      { q: 1, u: 'cdta', n: 'jengibre rallado' },
      { q: 2, u: 'cda', n: 'salsa de soja' },
      { q: 1, u: 'cdta', n: 'aceite de sésamo' },
      { q: null, u: '', n: 'Agua para sellar y aceite en espray' }
    ],
    steps: [
      { t: 'Mezcla la carne con la cebolleta, el jengibre, la soja y el aceite de sésamo.' },
      { t: 'Pon una cucharadita en cada oblea y ciérralas en triángulo sellando con agua.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y pulveriza aceite por ambas caras.', timer: 3 },
      { t: 'Cocina 12 minutos dando la vuelta a los 7 minutos.', timer: 12 },
      { t: 'Sirve con salsa de soja y vinagre.' }
    ],
    tips: [
      'Poco relleno: si sobresale, la oblea se abre y se quema.',
      'Sella con los dedos húmedos expulsando el aire del interior.'
    ],
    tags: ['proteina', 'crujiente', 'familiar']
  },
  {
    id: 172, name: 'Tostas de queso de cabra y cebolla', emoji: '🍯', category: 'snacks',
    description: 'Pan tostado con cebolla caramelizada, queso de cabra y miel. Entrante de diez.',
    prepTime: 10, cookTime: 18, temperature: 185, difficulty: 'Fácil',
    servings: 4, calories: 280, popularity: 73,
    ingredients: [
      { q: 8, u: 'ud', n: 'rebanadas de pan' },
      { q: 2, u: 'ud', n: 'cebollas en juliana' },
      { q: 150, u: 'g', n: 'queso de cabra en rodajas' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 2, u: 'cda', n: 'miel' },
      { q: null, u: '', n: 'Sal, pimienta y nueces' }
    ],
    steps: [
      { t: 'Mezcla la cebolla con el aceite y una pizca de sal.' },
      { t: 'Cocina a 185 °C durante 14 minutos removiendo cada 5, hasta que esté dorada.', timer: 14 },
      { t: 'Reparte la cebolla sobre el pan y pon una rodaja de queso encima.' },
      { t: 'Cocina 4 minutos más hasta que el queso se funda.', timer: 4 },
      { t: 'Riega con miel y añade nueces picadas.' }
    ],
    tips: [
      'La cebolla necesita su tiempo: no subas la temperatura para acelerar o se quemará.',
      'Un chorrito de vinagre balsámico al final le va perfecto.'
    ],
    tags: ['vegetariana', 'familiar', 'rapida']
  },

  /* ─────────────  POSTRES (ampliación 2)  ───────────── */
  {
    id: 173, name: 'Bizcocho de zanahoria', emoji: '🥕', category: 'postres',
    description: 'Jugoso, especiado y con nueces. Con o sin frosting de queso.',
    prepTime: 20, cookTime: 30, temperature: 160, difficulty: 'Media',
    servings: 6, calories: 310, popularity: 76,
    ingredients: [
      { q: 200, u: 'g', n: 'zanahoria rallada' },
      { q: 200, u: 'g', n: 'harina' },
      { q: 150, u: 'g', n: 'azúcar moreno' },
      { q: 3, u: 'ud', n: 'huevos' },
      { q: 120, u: 'ml', n: 'aceite de girasol' },
      { q: 8, u: 'g', n: 'levadura química' },
      { q: 1, u: 'cdta', n: 'canela molida' },
      { q: 60, u: 'g', n: 'nueces picadas' }
    ],
    steps: [
      { t: 'Bate los huevos con el azúcar hasta que doblen su volumen.' },
      { t: 'Añade el aceite en hilo y después la zanahoria rallada.' },
      { t: 'Incorpora la harina con la levadura y la canela, y por último las nueces.' },
      { t: 'Vierte en un molde engrasado que quepa holgado en la cesta.' },
      { t: 'Cocina a 160 °C durante 30 minutos sin abrir los primeros 22.', timer: 30 },
      { t: 'Comprueba con un palillo y deja enfriar sobre una rejilla.' }
    ],
    tips: [
      'Ralla la zanahoria fina: si es gruesa, quedan hilos duros.',
      'Cubre con aluminio si la superficie se dora antes de que cuaje el centro.'
    ],
    tags: ['vegetariana', 'familiar']
  },
  {
    id: 174, name: 'Tarta de manzana hojaldrada', emoji: '🍎', category: 'postres',
    description: 'Hojaldre crujiente con manzana en abanico y mermelada de albaricoque.',
    prepTime: 15, cookTime: 20, temperature: 175, difficulty: 'Fácil',
    servings: 4, calories: 290, popularity: 80,
    ingredients: [
      { q: 1, u: 'ud', n: 'lámina de hojaldre' },
      { q: 3, u: 'ud', n: 'manzanas en láminas finas' },
      { q: 3, u: 'cda', n: 'mermelada de albaricoque' },
      { q: 30, u: 'g', n: 'azúcar' },
      { q: 1, u: 'cdta', n: 'canela molida' },
      { q: 20, u: 'g', n: 'mantequilla derretida' }
    ],
    steps: [
      { t: 'Ajusta el hojaldre al tamaño de la cesta y pínchalo con un tenedor dejando un borde de 1 cm.' },
      { t: 'Coloca las láminas de manzana solapadas.' },
      { t: 'Pinta con la mantequilla y espolvorea el azúcar con la canela.' },
      { t: 'Precalienta a 175 °C durante 3 minutos y cocina 20 minutos.', timer: 20 },
      { t: 'Pinta con la mermelada templada al sacarla para darle brillo.' }
    ],
    tips: [
      'Pinchar el hojaldre evita que suba en el centro y desplace la fruta.',
      'La mermelada se pone al final, nunca antes de cocinar.'
    ],
    tags: ['vegetariana', 'familiar', 'rapida']
  },
  {
    id: 175, name: 'Galletas de avena y plátano', emoji: '🍌', category: 'postres',
    description: 'Solo dos ingredientes base, sin azúcar añadido. Postre o desayuno saludable.',
    prepTime: 10, cookTime: 12, temperature: 170, difficulty: 'Fácil',
    servings: 4, calories: 130, popularity: 74,
    ingredients: [
      { q: 2, u: 'ud', n: 'plátanos muy maduros' },
      { q: 150, u: 'g', n: 'copos de avena' },
      { q: 40, u: 'g', n: 'pepitas de chocolate (opcional)' },
      { q: 1, u: 'cdta', n: 'canela molida' },
      { q: 1, u: 'pizca', n: 'sal' }
    ],
    steps: [
      { t: 'Aplasta los plátanos con un tenedor hasta hacer puré.' },
      { t: 'Mezcla con la avena, la canela, la sal y las pepitas.' },
      { t: 'Deja reposar 5 minutos para que la avena absorba la humedad.', timer: 5 },
      { t: 'Forma galletas aplanadas sobre papel de air fryer, bien separadas.' },
      { t: 'Cocina a 170 °C durante 12 minutos.', timer: 12 },
      { t: 'Deja enfriar 10 minutos antes de moverlas.', timer: 10 }
    ],
    tips: [
      'Cuanto más maduro el plátano, más dulces salen sin añadir azúcar.',
      'Al salir están blandas: endurecen al enfriarse.'
    ],
    tags: ['saludable', 'vegetariana', 'economica', 'rapida']
  },
  {
    id: 176, name: 'Flan de huevo', emoji: '🍮', category: 'postres',
    description: 'Flan casero cuajado al baño maría en la air fryer. Textura de toda la vida.',
    prepTime: 20, cookTime: 30, temperature: 150, difficulty: 'Difícil',
    servings: 4, calories: 220, popularity: 78,
    ingredients: [
      { q: 4, u: 'ud', n: 'huevos' },
      { q: 500, u: 'ml', n: 'leche' },
      { q: 120, u: 'g', n: 'azúcar' },
      { q: 60, u: 'g', n: 'azúcar para el caramelo' },
      { q: 1, u: 'cdta', n: 'extracto de vainilla' }
    ],
    steps: [
      { t: 'Haz un caramelo con los 60 g de azúcar y repártelo en los moldes.' },
      { t: 'Bate los huevos con el azúcar restante, la leche y la vainilla sin hacer espuma.' },
      { t: 'Cuela la mezcla y viértela en los moldes. Cúbrelos con papel de aluminio.' },
      { t: 'Coloca los moldes en un recipiente con 2 cm de agua caliente.' },
      { t: 'Cocina a 150 °C durante 30 minutos.', timer: 30 },
      { t: 'Enfría en la nevera al menos 4 horas antes de desmoldar.' }
    ],
    tips: [
      'El baño maría y el aluminio son imprescindibles: sin ellos el flan se llena de agujeros.',
      'Está cuajado cuando tiembla ligeramente en el centro al mover el molde.',
      'Nunca subas de 150 °C o quedará agujereado y con sabor a huevo.'
    ],
    tags: ['vegetariana', 'familiar', 'sin-gluten', 'proteina']
  },
  {
    id: 177, name: 'Peras al vino y canela', emoji: '🍐', category: 'postres',
    description: 'Peras tiernas con vino tinto, canela y azúcar. Postre de restaurante.',
    prepTime: 10, cookTime: 22, temperature: 175, difficulty: 'Media',
    servings: 4, calories: 180, popularity: 62,
    ingredients: [
      { q: 4, u: 'ud', n: 'peras firmes' },
      { q: 200, u: 'ml', n: 'vino tinto' },
      { q: 80, u: 'g', n: 'azúcar' },
      { q: 1, u: 'ud', n: 'rama de canela' },
      { q: 1, u: 'ud', n: 'piel de naranja' }
    ],
    steps: [
      { t: 'Pela las peras dejando el rabito y córtales una base plana.' },
      { t: 'Colócalas de pie en un molde con el vino, el azúcar, la canela y la piel de naranja.' },
      { t: 'Precalienta a 175 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 22 minutos regándolas con el vino cada 8 minutos.', timer: 22 },
      { t: 'Reduce el líquido en un cazo 5 minutos y riégalas con el almíbar.', timer: 5 }
    ],
    tips: [
      'Peras firmes (conferencia o blanquilla): las muy maduras se deshacen.',
      'Regarlas durante la cocción es lo que les da ese color granate.'
    ],
    tags: ['saludable', 'vegetariana', 'sin-gluten']
  },
  {
    id: 178, name: 'Empanadillas de chocolate y plátano', emoji: '🍌', category: 'postres',
    description: 'Postre exprés con obleas, plátano y chocolate. Listo en 12 minutos.',
    prepTime: 10, cookTime: 12, temperature: 180, difficulty: 'Fácil',
    servings: 4, calories: 240, popularity: 77,
    ingredients: [
      { q: 8, u: 'ud', n: 'obleas para empanadillas' },
      { q: 2, u: 'ud', n: 'plátanos en rodajas' },
      { q: 100, u: 'g', n: 'chocolate negro troceado' },
      { q: 1, u: 'ud', n: 'huevo batido' },
      { q: 2, u: 'cda', n: 'azúcar con canela' }
    ],
    steps: [
      { t: 'Rellena cada oblea con plátano y chocolate.' },
      { t: 'Ciérralas y sella el borde con un tenedor.' },
      { t: 'Pinta con huevo batido.' },
      { t: 'Precalienta a 180 °C durante 3 minutos y cocina 12 minutos dando la vuelta a los 7.', timer: 12 },
      { t: 'Espolvorea azúcar con canela en caliente.' }
    ],
    tips: [
      'Sella muy bien: el chocolate fundido busca cualquier hueco.',
      'Deja templar 3 minutos, el relleno sale ardiendo.'
    ],
    tags: ['vegetariana', 'rapida', 'economica', 'familiar']
  },
  {
    id: 179, name: 'Magdalenas caseras', emoji: '🧁', category: 'postres',
    description: 'Con su copete alto y su aroma a limón. Salen 8 y desaparecen el mismo día.',
    prepTime: 20, cookTime: 15, temperature: 165, difficulty: 'Media',
    servings: 8, calories: 210, popularity: 79,
    ingredients: [
      { q: 2, u: 'ud', n: 'huevos' },
      { q: 150, u: 'g', n: 'azúcar' },
      { q: 200, u: 'g', n: 'harina' },
      { q: 120, u: 'ml', n: 'aceite de girasol' },
      { q: 60, u: 'ml', n: 'leche' },
      { q: 8, u: 'g', n: 'levadura química' },
      { q: 1, u: 'ud', n: 'ralladura de limón' }
    ],
    steps: [
      { t: 'Bate los huevos con el azúcar 5 minutos hasta que blanqueen.', timer: 5 },
      { t: 'Añade el aceite en hilo, la leche y la ralladura.' },
      { t: 'Incorpora la harina con la levadura tamizadas.' },
      { t: 'Refrigera la masa 30 minutos: es el secreto del copete.', timer: 30 },
      { t: 'Llena las cápsulas hasta 3/4 y espolvorea azúcar por encima.' },
      { t: 'Cocina a 165 °C durante 15 minutos, máximo 4 por tanda.', timer: 15 }
    ],
    tips: [
      'Masa fría + horno caliente = copete alto. Si te saltas la nevera, quedan planas.',
      'Usa cápsulas rígidas o dobles: las de papel solas se abren con el aire.'
    ],
    tags: ['vegetariana', 'familiar', 'economica']
  },
  {
    id: 180, name: 'Rosquillas de anís', emoji: '🍩', category: 'postres',
    description: 'Rosquillas tradicionales de aceite y anís, esponjosas y azucaradas.',
    prepTime: 25, cookTime: 12, temperature: 175, difficulty: 'Media',
    servings: 6, calories: 230, popularity: 68,
    ingredients: [
      { q: 350, u: 'g', n: 'harina' },
      { q: 2, u: 'ud', n: 'huevos' },
      { q: 100, u: 'g', n: 'azúcar' },
      { q: 80, u: 'ml', n: 'aceite de oliva suave' },
      { q: 2, u: 'cda', n: 'anís dulce' },
      { q: 8, u: 'g', n: 'levadura química' },
      { q: 50, u: 'g', n: 'azúcar para rebozar' }
    ],
    steps: [
      { t: 'Bate los huevos con el azúcar, el aceite y el anís.' },
      { t: 'Añade la harina con la levadura y amasa hasta obtener una masa manejable.' },
      { t: 'Deja reposar 15 minutos.', timer: 15 },
      { t: 'Forma rosquillas de 8 cm con las manos aceitadas.' },
      { t: 'Precalienta a 175 °C durante 3 minutos y cocina 12 minutos dando la vuelta a los 7.', timer: 12 },
      { t: 'Rebózalas en azúcar en caliente.' }
    ],
    tips: [
      'El agujero central debe ser generoso: se cierra bastante al cocinarse.',
      'Aceita tus manos en vez de añadir harina de más, o quedarán duras.'
    ],
    tags: ['vegetariana', 'economica', 'familiar']
  },

  /* ─────────────  POLLO (ampliación 3)  ───────────── */
  {
    id: 181, name: 'Pollo katsu', emoji: '🍱', category: 'pollo',
    description: 'Empanado japonés con panko, ultracrujiente, con su salsa tonkatsu agridulce.',
    prepTime: 15, cookTime: 16, temperature: 195, difficulty: 'Media',
    servings: 2, calories: 360, popularity: 79,
    ingredients: [
      { q: 2, u: 'ud', n: 'pechugas de pollo abiertas' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 60, u: 'g', n: 'harina' },
      { q: 140, u: 'g', n: 'pan rallado panko' },
      { q: 3, u: 'cda', n: 'kétchup' },
      { q: 1, u: 'cda', n: 'salsa Worcestershire' },
      { q: 1, u: 'cdta', n: 'salsa de soja' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Abre las pechugas en libro y aplánalas hasta dejarlas de 1 cm. Salpimienta.' },
      { t: 'Pásalas por harina, huevo batido y panko presionando con fuerza.' },
      { t: 'Precalienta a 195 °C durante 3 minutos y pulveriza aceite por las dos caras.', timer: 3 },
      { t: 'Cocina 16 minutos dando la vuelta a los 9 minutos.', timer: 16 },
      { t: 'Mezcla el kétchup, la Worcestershire y la soja para la salsa tonkatsu.' },
      { t: 'Corta en tiras y sirve sobre arroz con la salsa por encima.' }
    ],
    tips: [
      'El panko japonés tiene la miga más gruesa: es lo que da ese crujido tan característico.',
      'Corta siempre después de cocinar, nunca antes: el rebozado se abriría.'
    ],
    tags: ['proteina', 'crujiente', 'familiar']
  },
  {
    id: 182, name: 'Alitas coreanas picantes', emoji: '🌶️', category: 'pollo',
    description: 'Glaseado de gochujang, ajo y miel sobre alitas crujientes. Pican de verdad.',
    prepTime: 12, cookTime: 22, temperature: 200, difficulty: 'Media',
    servings: 2, calories: 350, popularity: 81,
    ingredients: [
      { q: 700, u: 'g', n: 'alitas de pollo partidas' },
      { q: 1, u: 'cdta', n: 'levadura química (impulsor)' },
      { q: 2, u: 'cda', n: 'pasta de gochujang o salsa picante' },
      { q: 1, u: 'cda', n: 'miel' },
      { q: 1, u: 'cda', n: 'salsa de soja' },
      { q: 2, u: 'ud', n: 'dientes de ajo rallados' },
      { q: 1, u: 'cda', n: 'semillas de sésamo' }
    ],
    steps: [
      { t: 'Seca muy bien las alitas y mézclalas con la levadura y una pizca de sal.' },
      { t: 'Precalienta a 200 °C durante 3 minutos y cocina 22 minutos dando la vuelta a los 12.', timer: 22 },
      { t: 'Calienta en un cazo el gochujang, la miel, la soja y el ajo 3 minutos.', timer: 3 },
      { t: 'Mezcla las alitas calientes con el glaseado hasta cubrirlas.' },
      { t: 'Espolvorea sésamo y cebolleta picada.' }
    ],
    tips: [
      'El glaseado siempre al final: lleva azúcar y se quemaría dentro de la cesta.',
      'Si no encuentras gochujang, sriracha con una cucharadita de miso funciona parecido.'
    ],
    tags: ['proteina', 'picante', 'crujiente', 'sin-gluten']
  },
  {
    id: 183, name: 'Pollo satay con salsa de cacahuete', emoji: '🥜', category: 'pollo',
    description: 'Brochetas marinadas en cúrcuma y leche de coco, con salsa cremosa de cacahuete.',
    prepTime: 20, cookTime: 14, temperature: 195, difficulty: 'Media',
    servings: 4, calories: 330, popularity: 74,
    ingredients: [
      { q: 600, u: 'g', n: 'pechuga de pollo en tiras' },
      { q: 100, u: 'ml', n: 'leche de coco' },
      { q: 1, u: 'cdta', n: 'cúrcuma' },
      { q: 1, u: 'cdta', n: 'comino molido' },
      { q: 4, u: 'cda', n: 'crema de cacahuete' },
      { q: 1, u: 'cda', n: 'salsa de soja' },
      { q: 1, u: 'cda', n: 'zumo de lima' },
      { q: null, u: '', n: 'Sal y agua para aligerar la salsa' }
    ],
    steps: [
      { t: 'Marina las tiras en la leche de coco con la cúrcuma, el comino y sal, 20 minutos.', timer: 20 },
      { t: 'Monta las tiras en brochetas en zigzag.' },
      { t: 'Precalienta a 195 °C durante 3 minutos y cocina 14 minutos dando la vuelta a los 7.', timer: 14 },
      { t: 'Mezcla la crema de cacahuete con la soja, la lima y agua hasta que quede una salsa fluida.' },
      { t: 'Sirve las brochetas con la salsa aparte.' }
    ],
    tips: [
      'Tiras finas y en zigzag: se hacen antes y quedan más jugosas que los dados.',
      'La salsa espesa al enfriarse; añade agua caliente a cucharadas.'
    ],
    tags: ['proteina', 'familiar', 'sin-gluten']
  },
  {
    id: 184, name: 'Fajitas de pollo', emoji: '🌯', category: 'pollo',
    description: 'Pollo y verduras especiadas para montar en tortillas. Una sola tanda, cero sartenes.',
    prepTime: 15, cookTime: 16, temperature: 195, difficulty: 'Fácil',
    servings: 4, calories: 340, popularity: 85,
    ingredients: [
      { q: 500, u: 'g', n: 'pechuga de pollo en tiras' },
      { q: 2, u: 'ud', n: 'pimientos en tiras' },
      { q: 1, u: 'ud', n: 'cebolla en juliana' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'comino molido' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: 8, u: 'ud', n: 'tortillas de trigo' },
      { q: null, u: '', n: 'Sal, pimienta, lima y guacamole' }
    ],
    steps: [
      { t: 'Mezcla el pollo y las verduras con el aceite, las especias, la sal y la pimienta.' },
      { t: 'Precalienta a 195 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 16 minutos agitando la cesta cada 5 minutos.', timer: 16 },
      { t: 'Calienta las tortillas 2 minutos a 160 °C.', timer: 2 },
      { t: 'Riega con lima y monta con guacamole y queso.' }
    ],
    tips: [
      'No llenes la cesta más de dos tercios o las verduras se cocerán en vez de tostarse.',
      'Corta todo del mismo grosor para que el pollo y el pimiento acaben a la vez.'
    ],
    tags: ['proteina', 'familiar', 'rapida']
  },
  {
    id: 185, name: 'Pollo caprese', emoji: '🍅', category: 'pollo',
    description: 'Pechuga con mozzarella fundida, tomate y albahaca. Italiano y ligero.',
    prepTime: 10, cookTime: 18, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 320, popularity: 76,
    ingredients: [
      { q: 2, u: 'ud', n: 'pechugas de pollo' },
      { q: 125, u: 'g', n: 'mozzarella en rodajas' },
      { q: 2, u: 'ud', n: 'tomates en rodajas' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cda', n: 'vinagre balsámico' },
      { q: null, u: '', n: 'Sal, pimienta y albahaca fresca' }
    ],
    steps: [
      { t: 'Salpimienta las pechugas y úntalas con el aceite.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y cocina 14 minutos dando la vuelta a los 8.', timer: 14 },
      { t: 'Coloca encima el tomate y la mozzarella.' },
      { t: 'Cocina 4 minutos más hasta que el queso se funda.', timer: 4 },
      { t: 'Añade albahaca fresca y un hilo de vinagre balsámico.' }
    ],
    tips: [
      'Escurre bien la mozzarella fresca o soltará agua sobre el pollo.',
      'La albahaca siempre en crudo al final: cocinada pierde todo el aroma.'
    ],
    tags: ['proteina', 'saludable', 'sin-gluten', 'rapida']
  },
  {
    id: 186, name: 'Pollo al pesto', emoji: '🌿', category: 'pollo',
    description: 'Dados de pollo con pesto y tomates cherry. Cena de 20 minutos con mucho sabor.',
    prepTime: 8, cookTime: 16, temperature: 190, difficulty: 'Fácil',
    servings: 2, calories: 340, popularity: 72,
    ingredients: [
      { q: 400, u: 'g', n: 'pechuga de pollo en dados' },
      { q: 3, u: 'cda', n: 'pesto' },
      { q: 200, u: 'g', n: 'tomates cherry' },
      { q: 30, u: 'g', n: 'queso parmesano rallado' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Mezcla el pollo con 2 cucharadas de pesto, sal y pimienta.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y cocina 10 minutos agitando a mitad.', timer: 10 },
      { t: 'Añade los tomates cherry y cocina 6 minutos más.', timer: 6 },
      { t: 'Mezcla con el pesto restante y el parmesano.' },
      { t: 'Sirve con pasta o con pan.' }
    ],
    tips: [
      'El pesto lleva albahaca y se amarga si se cocina mucho: reserva parte para el final.',
      'Los cherry entran después para que no se deshagan.'
    ],
    tags: ['proteina', 'rapida', 'sin-gluten']
  },
  {
    id: 187, name: 'Pollo a la cerveza', emoji: '🍺', category: 'pollo',
    description: 'Muslos jugosos con cebolla y cerveza, con la piel dorada y una salsa espectacular.',
    prepTime: 12, cookTime: 28, temperature: 185, difficulty: 'Media',
    servings: 4, calories: 380, popularity: 73,
    ingredients: [
      { q: 6, u: 'ud', n: 'muslos o contramuslos de pollo' },
      { q: 2, u: 'ud', n: 'cebollas en juliana' },
      { q: 150, u: 'ml', n: 'cerveza rubia' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: 2, u: 'ud', n: 'dientes de ajo picados' },
      { q: null, u: '', n: 'Sal, pimienta y tomillo' }
    ],
    steps: [
      { t: 'Adoba el pollo con el aceite, el pimentón, el tomillo, la sal y la pimienta.' },
      { t: 'Pon la cebolla y el ajo en un molde y el pollo encima con la piel hacia arriba.' },
      { t: 'Precalienta a 185 °C durante 4 minutos y cocina 18 minutos.', timer: 18 },
      { t: 'Riega con la cerveza y cocina 10 minutos más.', timer: 10 },
      { t: 'Deja reposar 5 minutos y sirve con la salsa del molde.', timer: 5 }
    ],
    tips: [
      'Necesitas molde: sobre la rejilla perderías toda la salsa.',
      'La cerveza a mitad de cocción; si va desde el principio, el pollo se cuece en vez de dorarse.'
    ],
    tags: ['proteina', 'familiar', 'sin-gluten']
  },
  {
    id: 188, name: 'Pollo con chimichurri', emoji: '🌿', category: 'pollo',
    description: 'Contramuslos dorados con salsa argentina de perejil, ajo y orégano.',
    prepTime: 12, cookTime: 22, temperature: 195, difficulty: 'Fácil',
    servings: 4, calories: 330, popularity: 70,
    ingredients: [
      { q: 8, u: 'ud', n: 'contramuslos de pollo' },
      { q: 4, u: 'cda', n: 'perejil fresco picado' },
      { q: 3, u: 'ud', n: 'dientes de ajo picados' },
      { q: 1, u: 'cdta', n: 'orégano seco' },
      { q: 4, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cda', n: 'vinagre de vino' },
      { q: 0.5, u: 'cdta', n: 'guindilla molida' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Mezcla el perejil, el ajo, el orégano, el aceite, el vinagre, la guindilla y la sal.' },
      { t: 'Reserva la mitad y unta el pollo con la otra mitad.' },
      { t: 'Precalienta a 195 °C durante 3 minutos y cocina 22 minutos dando la vuelta a los 12.', timer: 22 },
      { t: 'Sirve con el chimichurri reservado en crudo por encima.' }
    ],
    tips: [
      'El chimichurri crudo del final es el que aporta el sabor: no lo cocines todo.',
      'Está mejor si preparas la salsa una hora antes y reposa.'
    ],
    tags: ['proteina', 'sin-gluten', 'familiar', 'picante']
  },

  /* ─────────────  CARNE (ampliación 3)  ───────────── */
  {
    id: 189, name: 'Albóndigas suecas', emoji: '🍽️', category: 'carne',
    description: 'Pequeñas, especiadas y con salsa cremosa. Como las del mueble sueco, pero caseras.',
    prepTime: 20, cookTime: 14, temperature: 185, difficulty: 'Media',
    servings: 4, calories: 380, popularity: 78,
    ingredients: [
      { q: 500, u: 'g', n: 'carne picada mixta' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 50, u: 'g', n: 'pan rallado' },
      { q: 0.5, u: 'cdta', n: 'nuez moscada' },
      { q: 0.5, u: 'cdta', n: 'pimienta de Jamaica' },
      { q: 200, u: 'ml', n: 'nata para cocinar' },
      { q: 1, u: 'cdta', n: 'mostaza de Dijon' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Mezcla la carne con el huevo, el pan rallado, las especias, la sal y la pimienta.' },
      { t: 'Forma bolas pequeñas de unos 20 g.' },
      { t: 'Precalienta a 185 °C durante 3 minutos, pulveriza aceite y cocina 14 minutos agitando a mitad.', timer: 14 },
      { t: 'Calienta la nata con la mostaza en un cazo hasta que espese, 5 minutos.', timer: 5 },
      { t: 'Mezcla las albóndigas con la salsa y sirve con puré y mermelada de arándanos.' }
    ],
    tips: [
      'La nuez moscada y la pimienta de Jamaica son lo que las hace suecas: no las omitas.',
      'Bolas pequeñas e iguales; con una cuchara de helado salen todas del mismo tamaño.'
    ],
    tags: ['proteina', 'familiar']
  },
  {
    id: 190, name: 'Hamburguesa rellena de queso', emoji: '🍔', category: 'carne',
    description: 'La juicy lucy: el queso va dentro y se derrite al morder.',
    prepTime: 15, cookTime: 14, temperature: 190, difficulty: 'Media',
    servings: 2, calories: 520, popularity: 84,
    ingredients: [
      { q: 450, u: 'g', n: 'carne picada de ternera' },
      { q: 60, u: 'g', n: 'queso cheddar en dados' },
      { q: 2, u: 'ud', n: 'panes de hamburguesa' },
      { q: 1, u: 'cdta', n: 'ajo en polvo' },
      { q: null, u: '', n: 'Sal, pimienta y lo que quieras para montar' }
    ],
    steps: [
      { t: 'Sazona la carne y divídela en 4 discos finos.' },
      { t: 'Pon el queso en el centro de dos discos, tapa con los otros y sella muy bien los bordes.' },
      { t: 'Precalienta a 190 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 14 minutos dando la vuelta a los 8 minutos.', timer: 14 },
      { t: 'Deja reposar 3 minutos: el queso está a temperatura de lava.', timer: 3 },
      { t: 'Tuesta los panes 2 minutos y monta.', timer: 2 }
    ],
    tips: [
      'Sellar el borde apretando con los dedos es todo el secreto: si se abre, pierdes el queso.',
      'No la aplastes durante la cocción.'
    ],
    tags: ['proteina', 'familiar']
  },
  {
    id: 191, name: 'Rollitos de salchicha en hojaldre', emoji: '🥐', category: 'carne',
    description: 'Los sausage rolls británicos: hojaldre crujiente y carne especiada. Vuelan.',
    prepTime: 15, cookTime: 18, temperature: 180, difficulty: 'Fácil',
    servings: 4, calories: 340, popularity: 80,
    ingredients: [
      { q: 1, u: 'ud', n: 'lámina de hojaldre' },
      { q: 400, u: 'g', n: 'carne de salchicha' },
      { q: 1, u: 'cdta', n: 'tomillo seco' },
      { q: 0.5, u: 'cdta', n: 'nuez moscada' },
      { q: 1, u: 'ud', n: 'huevo batido' },
      { q: 1, u: 'cda', n: 'semillas de sésamo' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Mezcla la carne con el tomillo, la nuez moscada, la sal y la pimienta.' },
      { t: 'Extiende el hojaldre, corta tiras y coloca la carne en forma de churro a lo largo.' },
      { t: 'Enrolla, sella el borde y corta en trozos de 5 cm.' },
      { t: 'Pinta con huevo y espolvorea sésamo.' },
      { t: 'Precalienta a 180 °C durante 3 minutos y cocina 18 minutos.', timer: 18 },
      { t: 'Deja templar 5 minutos antes de servir.', timer: 5 }
    ],
    tips: [
      'Haz dos cortes en la superficie para que salga el vapor y el hojaldre suba parejo.',
      'Se congelan crudos: van directos a la cesta añadiendo 5 minutos.'
    ],
    tags: ['proteina', 'familiar', 'crujiente']
  },
  {
    id: 192, name: 'Morcilla crujiente con manzana', emoji: '🍎', category: 'carne',
    description: 'Rodajas de morcilla doradas sobre manzana asada. Tapa de contrastes.',
    prepTime: 8, cookTime: 14, temperature: 190, difficulty: 'Fácil',
    servings: 3, calories: 340, popularity: 66,
    ingredients: [
      { q: 300, u: 'g', n: 'morcilla de arroz o de cebolla' },
      { q: 2, u: 'ud', n: 'manzanas en gajos' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cda', n: 'miel' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Corta la morcilla en rodajas de 1,5 cm sin quitarle la piel.' },
      { t: 'Mezcla la manzana con el aceite y la miel.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y cocina la manzana 7 minutos.', timer: 7 },
      { t: 'Añade la morcilla y cocina 7 minutos más, dándole la vuelta a mitad.', timer: 7 },
      { t: 'Sirve sobre tostadas de pan.' }
    ],
    tips: [
      'No la muevas hasta que esté sellada o se desmigará.',
      'La manzana entra antes porque necesita el doble de tiempo.'
    ],
    tags: ['proteina', 'economica', 'sin-gluten']
  },
  {
    id: 193, name: 'Escalopines al limón', emoji: '🍋', category: 'carne',
    description: 'Filetes finos de ternera con salsa de limón y mantequilla. Elegante y en 12 minutos.',
    prepTime: 10, cookTime: 12, temperature: 190, difficulty: 'Media',
    servings: 2, calories: 320, popularity: 68,
    ingredients: [
      { q: 400, u: 'g', n: 'filetes finos de ternera' },
      { q: 2, u: 'cda', n: 'harina' },
      { q: 1, u: 'ud', n: 'limón (zumo y ralladura)' },
      { q: 30, u: 'g', n: 'mantequilla' },
      { q: 60, u: 'ml', n: 'caldo de carne' },
      { q: null, u: '', n: 'Sal, pimienta y perejil' }
    ],
    steps: [
      { t: 'Salpimienta los filetes y pásalos ligeramente por harina.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y cocina 8 minutos dando la vuelta a los 5.', timer: 8 },
      { t: 'Pon la mantequilla, el caldo, el zumo y la ralladura en un molde con la carne.' },
      { t: 'Cocina 4 minutos más para que se forme la salsa.', timer: 4 },
      { t: 'Espolvorea perejil y sirve enseguida.' }
    ],
    tips: [
      'La harina fina es lo que liga la salsa: no te pases o quedará pastosa.',
      'Filetes muy finos, de menos de 1 cm, o se endurecen.'
    ],
    tags: ['proteina', 'rapida']
  },
  {
    id: 194, name: 'Solomillo Wellington individual', emoji: '🍖', category: 'carne',
    description: 'Medallón de solomillo envuelto en champiñones y hojaldre. Plato de celebración.',
    prepTime: 30, cookTime: 20, temperature: 190, difficulty: 'Difícil',
    servings: 2, calories: 520, popularity: 71,
    ingredients: [
      { q: 2, u: 'ud', n: 'medallones de solomillo de ternera' },
      { q: 200, u: 'g', n: 'champiñones muy picados' },
      { q: 1, u: 'ud', n: 'lámina de hojaldre' },
      { q: 4, u: 'ud', n: 'lonchas de jamón serrano' },
      { q: 1, u: 'cdta', n: 'mostaza de Dijon' },
      { q: 1, u: 'ud', n: 'huevo batido' },
      { q: null, u: '', n: 'Sal, pimienta y aceite' }
    ],
    steps: [
      { t: 'Sella los medallones 5 minutos a 200 °C y deja enfriar. Úntalos con mostaza.', timer: 5 },
      { t: 'Saltea los champiñones hasta que suelten y evaporen toda el agua, unos 10 minutos.', timer: 10 },
      { t: 'Extiende el jamón, encima los champiñones fríos y envuelve la carne con ello.' },
      { t: 'Envuelve todo en hojaldre, sella y pinta con huevo. Refrigera 15 minutos.', timer: 15 },
      { t: 'Precalienta a 190 °C durante 4 minutos y cocina 15 minutos.', timer: 15 },
      { t: 'Deja reposar 8 minutos antes de cortar.', timer: 8 }
    ],
    tips: [
      'Los champiñones deben quedar SECOS: cualquier resto de agua ablanda el hojaldre por dentro.',
      'Todo frío antes de envolver, o el hojaldre se derrite antes de entrar.',
      'A 15 minutos la carne queda al punto; súmale 3 para más hecha.'
    ],
    tags: ['proteina', 'familiar']
  },
  {
    id: 195, name: 'Costillas agridulces', emoji: '🍖', category: 'carne',
    description: 'Costillas de cerdo lacadas en salsa china de soja, miel y jengibre.',
    prepTime: 15, cookTime: 32, temperature: 180, difficulty: 'Media',
    servings: 3, calories: 480, popularity: 76,
    ingredients: [
      { q: 800, u: 'g', n: 'costillar de cerdo en tiras' },
      { q: 4, u: 'cda', n: 'salsa de soja' },
      { q: 2, u: 'cda', n: 'miel' },
      { q: 2, u: 'cda', n: 'kétchup' },
      { q: 1, u: 'cdta', n: 'jengibre rallado' },
      { q: 2, u: 'ud', n: 'dientes de ajo rallados' },
      { q: 1, u: 'cda', n: 'vinagre de arroz' }
    ],
    steps: [
      { t: 'Mezcla todos los ingredientes de la salsa y marina las costillas 30 minutos.', timer: 30 },
      { t: 'Escurre y reserva la marinada.' },
      { t: 'Precalienta a 180 °C durante 4 minutos y cocina 28 minutos dando la vuelta cada 10.', timer: 28 },
      { t: 'Pinta con la marinada reducida en un cazo y cocina 4 minutos a 200 °C.', timer: 4 },
      { t: 'Espolvorea sésamo y cebolleta.' }
    ],
    tips: [
      'Hierve la marinada antes de usarla como glaseado: ha estado en contacto con carne cruda.',
      'Retira la membrana trasera del costillar para que quede más tierno.'
    ],
    tags: ['proteina', 'familiar']
  },
  {
    id: 196, name: 'Picadillo de carne con pimientos', emoji: '🫑', category: 'carne',
    description: 'Carne picada especiada con pimiento y cebolla. Base para tacos, arroces o pasta.',
    prepTime: 10, cookTime: 16, temperature: 190, difficulty: 'Fácil',
    servings: 4, calories: 280, popularity: 69,
    ingredients: [
      { q: 500, u: 'g', n: 'carne picada' },
      { q: 2, u: 'ud', n: 'pimientos en dados' },
      { q: 1, u: 'ud', n: 'cebolla picada' },
      { q: 2, u: 'ud', n: 'dientes de ajo picados' },
      { q: 1, u: 'cdta', n: 'comino molido' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Mezcla las verduras con el aceite y cocínalas a 190 °C durante 8 minutos en un molde.', timer: 8 },
      { t: 'Añade la carne desmenuzada y las especias.' },
      { t: 'Cocina 8 minutos más removiendo a mitad para que se suelte bien.', timer: 8 },
      { t: 'Ajusta de sal y usa como base de tacos, empanadillas o pasta.' }
    ],
    tips: [
      'Remover a mitad evita que la carne quede apelmazada en un bloque.',
      'Se congela en raciones perfectamente: es una base de aprovechamiento buenísima.'
    ],
    tags: ['proteina', 'economica', 'familiar', 'sin-gluten']
  },

  /* ─────────────  PESCADO (ampliación 3)  ───────────── */
  {
    id: 197, name: 'Salmón en papillote', emoji: '🐟', category: 'pescado',
    description: 'Cocinado en su propio vapor con verduras y limón: imposible que quede seco.',
    prepTime: 12, cookTime: 15, temperature: 180, difficulty: 'Fácil',
    servings: 2, calories: 300, popularity: 78,
    ingredients: [
      { q: 2, u: 'ud', n: 'lomos de salmón' },
      { q: 1, u: 'ud', n: 'calabacín en juliana' },
      { q: 1, u: 'ud', n: 'zanahoria en juliana' },
      { q: 1, u: 'ud', n: 'limón en rodajas' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 2, u: 'cda', n: 'vino blanco' },
      { q: null, u: '', n: 'Sal, pimienta y eneldo' }
    ],
    steps: [
      { t: 'Corta dos rectángulos grandes de papel de horno.' },
      { t: 'Reparte las verduras, pon el salmón encima y añade limón, aceite, vino, sal y eneldo.' },
      { t: 'Cierra los paquetes doblando los bordes varias veces para que no escape el vapor.' },
      { t: 'Precalienta a 180 °C durante 3 minutos y cocina 15 minutos.', timer: 15 },
      { t: 'Abre el papillote en el plato: el aroma es parte del plato.' }
    ],
    tips: [
      'Sujeta el papel con palillos: el aire de la air fryer levanta los paquetes mal cerrados.',
      'Cuidado al abrirlo, el vapor sale muy caliente.'
    ],
    tags: ['saludable', 'proteina', 'sin-gluten']
  },
  {
    id: 198, name: 'Pez espada a la plancha', emoji: '🗡️', category: 'pescado',
    description: 'Rodajas selladas por fuera y jugosas por dentro, con ajo y perejil.',
    prepTime: 8, cookTime: 12, temperature: 195, difficulty: 'Fácil',
    servings: 2, calories: 260, popularity: 67,
    ingredients: [
      { q: 2, u: 'ud', n: 'rodajas de pez espada' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 2, u: 'ud', n: 'dientes de ajo picados' },
      { q: 2, u: 'cda', n: 'perejil fresco picado' },
      { q: 1, u: 'ud', n: 'limón' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Seca las rodajas y úntalas con aceite, sal y pimienta.' },
      { t: 'Precalienta a 195 °C durante 4 minutos.', timer: 4 },
      { t: 'Cocina 6 minutos, da la vuelta y cocina 6 minutos más.', timer: 12 },
      { t: 'Mezcla el ajo y el perejil con el resto del aceite y riega el pescado al sacarlo.' },
      { t: 'Sirve con limón.' }
    ],
    tips: [
      'El pez espada se seca con facilidad: no pases de 13 minutos.',
      'El majado de ajo y perejil siempre en crudo al final.'
    ],
    tags: ['saludable', 'proteina', 'rapida', 'sin-gluten']
  },
  {
    id: 199, name: 'Croquetas de bacalao', emoji: '🥔', category: 'pescado',
    description: 'Bolinhos portugueses de bacalao y patata, crujientes por fuera y cremosos dentro.',
    prepTime: 25, cookTime: 14, temperature: 195, difficulty: 'Media',
    servings: 4, calories: 240, popularity: 70,
    ingredients: [
      { q: 300, u: 'g', n: 'bacalao desalado y desmigado' },
      { q: 400, u: 'g', n: 'patatas cocidas y aplastadas' },
      { q: 2, u: 'ud', n: 'huevos' },
      { q: 3, u: 'cda', n: 'perejil fresco picado' },
      { q: 1, u: 'ud', n: 'cebolla muy picada' },
      { q: 120, u: 'g', n: 'pan rallado' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Mezcla el bacalao con la patata, un huevo, la cebolla, el perejil y la pimienta.' },
      { t: 'Forma quenelles con dos cucharas o bolas alargadas.' },
      { t: 'Pásalas por el huevo restante y el pan rallado. Refrigera 15 minutos.', timer: 15 },
      { t: 'Precalienta a 195 °C durante 3 minutos, pulveriza aceite y cocina 14 minutos agitando a mitad.', timer: 14 },
      { t: 'Sirve con limón y alioli.' }
    ],
    tips: [
      'Prueba el punto de sal antes de formar: el bacalao ya sala bastante.',
      'La patata debe estar bien seca; si la coces, escúrrela y deja evaporar.'
    ],
    tags: ['proteina', 'crujiente', 'familiar']
  },
  {
    id: 200, name: 'Pastelitos de cangrejo', emoji: '🦀', category: 'pescado',
    description: 'Crab cakes con mayonesa, mostaza y cebolleta. Entrante de restaurante.',
    prepTime: 20, cookTime: 12, temperature: 190, difficulty: 'Media',
    servings: 4, calories: 220, popularity: 64,
    ingredients: [
      { q: 400, u: 'g', n: 'carne de cangrejo o surimi desmenuzado' },
      { q: 60, u: 'g', n: 'pan rallado panko' },
      { q: 2, u: 'cda', n: 'mayonesa' },
      { q: 1, u: 'cdta', n: 'mostaza de Dijon' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 2, u: 'ud', n: 'cebolletas picadas' },
      { q: null, u: '', n: 'Sal, pimienta, limón y aceite en espray' }
    ],
    steps: [
      { t: 'Mezcla todos los ingredientes con suavidad, sin deshacer del todo el cangrejo.' },
      { t: 'Forma discos de 2 cm y refrigéralos 20 minutos.', timer: 20 },
      { t: 'Precalienta a 190 °C durante 3 minutos y pulveriza aceite.', timer: 3 },
      { t: 'Cocina 12 minutos dando la vuelta con cuidado a los 7 minutos.', timer: 12 },
      { t: 'Sirve con salsa tártara y limón.' }
    ],
    tips: [
      'Mezcla lo justo: si lo trabajas mucho pierde la textura en hebras.',
      'El paso por la nevera es lo que impide que se rompan al girarlos.'
    ],
    tags: ['proteina', 'saludable']
  },
  {
    id: 201, name: 'Vieiras gratinadas', emoji: '🐚', category: 'pescado',
    description: 'Vieiras con sofrito de cebolla y pan rallado gratinado. Clásico gallego.',
    prepTime: 15, cookTime: 12, temperature: 190, difficulty: 'Media',
    servings: 4, calories: 200, popularity: 62,
    ingredients: [
      { q: 8, u: 'ud', n: 'vieiras en su concha' },
      { q: 1, u: 'ud', n: 'cebolla muy picada' },
      { q: 60, u: 'ml', n: 'vino blanco' },
      { q: 60, u: 'g', n: 'pan rallado' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Pocha la cebolla con el aceite 8 minutos y añade el vino y el pimentón.', timer: 8 },
      { t: 'Salpimienta las vieiras y cúbrelas con el sofrito.' },
      { t: 'Espolvorea el pan rallado por encima.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y cocina 12 minutos sin darles la vuelta.', timer: 12 },
      { t: 'Sirve en la propia concha.' }
    ],
    tips: [
      'Coloca las conchas bien estables; si bailan, se vuelca el sofrito.',
      'Vigila los últimos minutos: el pan rallado pasa de dorado a quemado enseguida.'
    ],
    tags: ['proteina', 'saludable']
  },
  {
    id: 202, name: 'Sepia a la plancha con ajo', emoji: '🦑', category: 'pescado',
    description: 'Sepia tierna con ajo y perejil, dorada por fuera. De chiringuito.',
    prepTime: 10, cookTime: 14, temperature: 200, difficulty: 'Media',
    servings: 2, calories: 210, popularity: 66,
    ingredients: [
      { q: 500, u: 'g', n: 'sepia limpia' },
      { q: 3, u: 'ud', n: 'dientes de ajo picados' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 3, u: 'cda', n: 'perejil fresco picado' },
      { q: 1, u: 'ud', n: 'limón' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Haz cortes en cuadrícula en la sepia y sécala muy bien.' },
      { t: 'Úntala con aceite, sal y pimienta.' },
      { t: 'Precalienta a 200 °C durante 4 minutos.', timer: 4 },
      { t: 'Cocina 14 minutos dando la vuelta a los 8 minutos.', timer: 14 },
      { t: 'Añade el ajo y el perejil crudos con limón al sacarla.' }
    ],
    tips: [
      'Los cortes en cuadrícula evitan que se encoja y se enrolle.',
      'O muy poco tiempo o mucho: en el punto intermedio queda gomosa.'
    ],
    tags: ['proteina', 'saludable', 'sin-gluten']
  },
  {
    id: 203, name: 'Rollitos de lenguado y gambas', emoji: '🌀', category: 'pescado',
    description: 'Filetes enrollados con relleno de gambas, al horno con vino blanco.',
    prepTime: 20, cookTime: 16, temperature: 180, difficulty: 'Media',
    servings: 2, calories: 250, popularity: 60,
    ingredients: [
      { q: 4, u: 'ud', n: 'filetes de lenguado' },
      { q: 200, u: 'g', n: 'gambas peladas picadas' },
      { q: 1, u: 'ud', n: 'cebolleta picada' },
      { q: 60, u: 'ml', n: 'vino blanco' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal, pimienta y perejil' }
    ],
    steps: [
      { t: 'Saltea las gambas con la cebolleta 3 minutos y deja enfriar.', timer: 3 },
      { t: 'Salpimienta los filetes, reparte el relleno y enróllalos sujetando con palillos.' },
      { t: 'Colócalos en un molde con el vino y el aceite.' },
      { t: 'Precalienta a 180 °C durante 3 minutos y cocina 16 minutos.', timer: 16 },
      { t: 'Sirve con el jugo del molde y perejil.' }
    ],
    tips: [
      'El relleno frío: caliente aflojaría el pescado y los rollitos se abrirían.',
      'El lenguado es finísimo, no lo cocines de más o se deshará.'
    ],
    tags: ['saludable', 'proteina', 'sin-gluten']
  },
  {
    id: 204, name: 'Tortitas de atún', emoji: '🥞', category: 'pescado',
    description: 'De aprovechamiento total: atún de lata, patata y huevo. Baratas y resultonas.',
    prepTime: 15, cookTime: 12, temperature: 190, difficulty: 'Fácil',
    servings: 4, calories: 190, popularity: 71,
    ingredients: [
      { q: 240, u: 'g', n: 'atún en conserva escurrido' },
      { q: 300, u: 'g', n: 'patatas cocidas y aplastadas' },
      { q: 2, u: 'ud', n: 'huevos' },
      { q: 60, u: 'g', n: 'pan rallado' },
      { q: 2, u: 'cda', n: 'perejil fresco picado' },
      { q: null, u: '', n: 'Sal, pimienta y aceite en espray' }
    ],
    steps: [
      { t: 'Mezcla el atún con la patata, un huevo, el perejil, la sal y la pimienta.' },
      { t: 'Forma tortitas de 1,5 cm.' },
      { t: 'Pásalas por el huevo restante y el pan rallado.' },
      { t: 'Precalienta a 190 °C durante 3 minutos, pulveriza aceite y cocina 12 minutos dando la vuelta a los 7.', timer: 12 },
      { t: 'Sirve con ensalada o salsa de yogur.' }
    ],
    tips: [
      'Escurre el atún a conciencia: el aceite sobrante ablanda la mezcla.',
      'Si la masa no liga, añade una cucharada más de pan rallado.'
    ],
    tags: ['proteina', 'economica', 'familiar', 'rapida']
  },

  /* ─────────────  VERDURAS (ampliación 3)  ───────────── */
  {
    id: 205, name: 'Champiñones rellenos', emoji: '🍄', category: 'verduras',
    description: 'Sombreros rellenos de queso, ajo y jamón, gratinados en 12 minutos.',
    prepTime: 15, cookTime: 12, temperature: 185, difficulty: 'Fácil',
    servings: 4, calories: 160, popularity: 77,
    ingredients: [
      { q: 12, u: 'ud', n: 'champiñones grandes' },
      { q: 150, u: 'g', n: 'queso crema' },
      { q: 80, u: 'g', n: 'jamón serrano picado' },
      { q: 2, u: 'ud', n: 'dientes de ajo picados' },
      { q: 60, u: 'g', n: 'queso rallado' },
      { q: null, u: '', n: 'Sal, pimienta y perejil' }
    ],
    steps: [
      { t: 'Retira los tallos de los champiñones y pícalos.' },
      { t: 'Mézclalos con el queso crema, el jamón, el ajo, la pimienta y el perejil.' },
      { t: 'Rellena los sombreros y cubre con queso rallado.' },
      { t: 'Precalienta a 185 °C durante 3 minutos y cocina 12 minutos sin darles la vuelta.', timer: 12 },
      { t: 'Deja templar 3 minutos antes de servir.', timer: 3 }
    ],
    tips: [
      'Sala poco: el jamón y el queso ya aportan bastante.',
      'Los champiñones sueltan agua; si quedan caldosos, sube 2 minutos a 200 °C.'
    ],
    tags: ['proteina', 'sin-gluten', 'familiar', 'rapida']
  },
  {
    id: 206, name: 'Coliflor entera asada', emoji: '🥦', category: 'verduras',
    description: 'Una coliflor entera especiada, dorada por fuera y tierna dentro. Muy vistosa.',
    prepTime: 12, cookTime: 35, temperature: 180, difficulty: 'Media',
    servings: 4, calories: 130, popularity: 72,
    ingredients: [
      { q: 1, u: 'ud', n: 'coliflor mediana' },
      { q: 3, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'pimentón ahumado' },
      { q: 1, u: 'cdta', n: 'comino molido' },
      { q: 1, u: 'cdta', n: 'ajo en polvo' },
      { q: 100, u: 'g', n: 'yogur natural' },
      { q: null, u: '', n: 'Sal, pimienta y limón' }
    ],
    steps: [
      { t: 'Retira las hojas y corta la base para que la coliflor se apoye plana.' },
      { t: 'Mezcla el aceite con las especias y la sal y úntala por todas partes, insistiendo entre los ramilletes.' },
      { t: 'Precalienta a 180 °C durante 4 minutos.', timer: 4 },
      { t: 'Cocina 35 minutos; comprueba con un cuchillo que el centro está tierno.', timer: 35 },
      { t: 'Sirve con yogur, limón y más especias por encima.' }
    ],
    tips: [
      'Comprueba que cabe con la tapa cerrada antes de sazonarla.',
      'Si se dora demasiado por fuera antes de estar tierna, cúbrela con aluminio.'
    ],
    tags: ['saludable', 'vegetariana', 'economica', 'sin-gluten']
  },
  {
    id: 207, name: 'Repollo asado en filetes', emoji: '🥗', category: 'verduras',
    description: 'Rodajas gruesas de col con los bordes tostados. Barato y sorprendentemente bueno.',
    prepTime: 8, cookTime: 18, temperature: 195, difficulty: 'Fácil',
    servings: 4, calories: 90, popularity: 63,
    ingredients: [
      { q: 1, u: 'ud', n: 'repollo pequeño' },
      { q: 3, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'ajo en polvo' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: null, u: '', n: 'Sal, pimienta y limón' }
    ],
    steps: [
      { t: 'Corta el repollo en rodajas de 2 cm conservando el tronco para que no se deshagan.' },
      { t: 'Pincélalas por las dos caras con el aceite y las especias.' },
      { t: 'Precalienta a 195 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 18 minutos dando la vuelta con cuidado a los 10 minutos.', timer: 18 },
      { t: 'Riega con limón al servir.' }
    ],
    tips: [
      'El tronco central es lo que mantiene la rodaja unida: no lo quites.',
      'Los bordes muy tostados son lo mejor del plato, no los temas.'
    ],
    tags: ['saludable', 'vegetariana', 'economica', 'sin-gluten']
  },
  {
    id: 208, name: 'Tempura de verduras', emoji: '🍤', category: 'verduras',
    description: 'Rebozado ligero y crujiente con agua muy fría. Verduras variadas.',
    prepTime: 15, cookTime: 12, temperature: 200, difficulty: 'Media',
    servings: 4, calories: 190, popularity: 70,
    ingredients: [
      { q: 400, u: 'g', n: 'verduras variadas (calabacín, zanahoria, cebolla, pimiento)' },
      { q: 120, u: 'g', n: 'harina' },
      { q: 30, u: 'g', n: 'maicena' },
      { q: 180, u: 'ml', n: 'agua con gas muy fría' },
      { q: null, u: '', n: 'Sal y aceite en espray' }
    ],
    steps: [
      { t: 'Corta las verduras en bastones o rodajas finas y sécalas.' },
      { t: 'Mezcla la harina con la maicena, la sal y el agua con gas fría sin batir en exceso: debe quedar con grumos.' },
      { t: 'Precalienta a 200 °C durante 3 minutos y forra la cesta con papel de air fryer.', timer: 3 },
      { t: 'Pasa las verduras por la masa escurriendo bien y pulveriza aceite.' },
      { t: 'Cocina 12 minutos dando la vuelta a los 7 minutos.', timer: 12 },
      { t: 'Sirve inmediatamente con salsa de soja.' }
    ],
    tips: [
      'La masa fría y con grumos es la clave: batida y templada queda pesada.',
      'Prepárala justo antes de usarla, no aguanta esperando.'
    ],
    tags: ['vegetariana', 'crujiente', 'familiar']
  },
  {
    id: 209, name: 'Cebollas rellenas', emoji: '🧅', category: 'verduras',
    description: 'Cebollas vaciadas y rellenas de carne y tomate. Plato de cuchara y tenedor.',
    prepTime: 20, cookTime: 28, temperature: 180, difficulty: 'Media',
    servings: 4, calories: 240, popularity: 61,
    ingredients: [
      { q: 4, u: 'ud', n: 'cebollas grandes' },
      { q: 300, u: 'g', n: 'carne picada' },
      { q: 150, u: 'ml', n: 'tomate frito' },
      { q: 60, u: 'g', n: 'queso rallado' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal, pimienta y orégano' }
    ],
    steps: [
      { t: 'Pela las cebollas, corta la parte superior y vacíalas dejando 2 capas de pared.' },
      { t: 'Pica lo que has sacado y saltéalo con la carne 8 minutos. Añade el tomate.', timer: 8 },
      { t: 'Rellena las cebollas y cúbrelas con queso.' },
      { t: 'Precalienta a 180 °C durante 3 minutos y cocina 28 minutos.', timer: 28 },
      { t: 'Comprueba que la cebolla está tierna al pincharla.' }
    ],
    tips: [
      'Deja pared suficiente o se romperán al rellenarlas.',
      'Si a los 28 minutos siguen duras, cúbrelas con aluminio y dales 8 minutos más.'
    ],
    tags: ['proteina', 'economica', 'familiar', 'sin-gluten']
  },
  {
    id: 210, name: 'Endivias gratinadas', emoji: '🫑', category: 'verduras',
    description: 'Endivias con jamón y bechamel rápida, gratinadas. Amargor y crema en equilibrio.',
    prepTime: 15, cookTime: 20, temperature: 180, difficulty: 'Media',
    servings: 4, calories: 220, popularity: 58,
    ingredients: [
      { q: 4, u: 'ud', n: 'endivias' },
      { q: 4, u: 'ud', n: 'lonchas de jamón cocido' },
      { q: 200, u: 'ml', n: 'nata para cocinar' },
      { q: 80, u: 'g', n: 'queso rallado' },
      { q: 1, u: 'cda', n: 'mantequilla' },
      { q: null, u: '', n: 'Sal, pimienta y nuez moscada' }
    ],
    steps: [
      { t: 'Corta las endivias por la mitad a lo largo.' },
      { t: 'Cocínalas a 180 °C con la mantequilla durante 10 minutos.', timer: 10 },
      { t: 'Envuelve cada mitad en media loncha de jamón y colócalas en un molde.' },
      { t: 'Cubre con la nata, la sal, la pimienta y la nuez moscada y añade el queso.' },
      { t: 'Cocina 10 minutos más hasta gratinar.', timer: 10 }
    ],
    tips: [
      'Un poco de amargor es normal; si no te gusta, retira el cono duro de la base.',
      'Sube a 200 °C los 3 últimos minutos si quieres más color.'
    ],
    tags: ['vegetariana', 'sin-gluten']
  },
  {
    id: 211, name: 'Aguacate crujiente', emoji: '🥑', category: 'verduras',
    description: 'Gajos de aguacate empanados: cremosos por dentro y crujientes por fuera.',
    prepTime: 12, cookTime: 10, temperature: 195, difficulty: 'Media',
    servings: 2, calories: 230, popularity: 68,
    ingredients: [
      { q: 2, u: 'ud', n: 'aguacates firmes' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 50, u: 'g', n: 'harina' },
      { q: 100, u: 'g', n: 'pan rallado panko' },
      { q: 0.5, u: 'cdta', n: 'pimentón dulce' },
      { q: null, u: '', n: 'Sal, lima y aceite en espray' }
    ],
    steps: [
      { t: 'Corta los aguacates en gajos gruesos, sin que estén demasiado maduros.' },
      { t: 'Pásalos por harina, huevo batido y panko con pimentón y sal.' },
      { t: 'Precalienta a 195 °C durante 3 minutos y pulveriza aceite.', timer: 3 },
      { t: 'Cocina 10 minutos dando la vuelta con cuidado a los 6 minutos.', timer: 10 },
      { t: 'Sirve con lima y salsa de yogur o chipotle.' }
    ],
    tips: [
      'Aguacate firme, casi verde: el maduro se deshace al rebozarlo.',
      'Manipúlalos con delicadeza, son muy frágiles al girarlos.'
    ],
    tags: ['vegetariana', 'crujiente', 'rapida']
  },
  {
    id: 212, name: 'Pimientos asados', emoji: '🫑', category: 'verduras',
    description: 'Pimientos rojos asados y pelados, en tiras con aceite y ajo. Base de mil platos.',
    prepTime: 5, cookTime: 25, temperature: 200, difficulty: 'Fácil',
    servings: 4, calories: 80, popularity: 74,
    ingredients: [
      { q: 4, u: 'ud', n: 'pimientos rojos' },
      { q: 3, u: 'cda', n: 'aceite de oliva virgen extra' },
      { q: 2, u: 'ud', n: 'dientes de ajo laminados' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Lava los pimientos enteros y úntalos con un poco de aceite.' },
      { t: 'Precalienta a 200 °C durante 4 minutos.', timer: 4 },
      { t: 'Cocina 25 minutos dándoles la vuelta cada 8 minutos, hasta que la piel esté negra por zonas.', timer: 25 },
      { t: 'Mételos en un bol tapado 10 minutos: el vapor despega la piel.', timer: 10 },
      { t: 'Pélalos, córtalos en tiras y alíñalos con el aceite, el ajo y la sal.' }
    ],
    tips: [
      'El bol tapado es el truco para pelarlos sin pelearte con ellos.',
      'Guarda el jugo que sueltan: es oro para el aliño.'
    ],
    tags: ['saludable', 'vegetariana', 'economica', 'sin-gluten']
  },

  /* ─────────────  PATATAS (ampliación 3)  ───────────── */
  {
    id: 213, name: 'Patatas gratinadas', emoji: '🧈', category: 'patatas',
    description: 'Láminas finas con nata, ajo y queso. La guarnición más goloso que existe.',
    prepTime: 15, cookTime: 30, temperature: 175, difficulty: 'Media',
    servings: 4, calories: 340, popularity: 79,
    ingredients: [
      { q: 800, u: 'g', n: 'patatas en láminas finas' },
      { q: 250, u: 'ml', n: 'nata para cocinar' },
      { q: 120, u: 'g', n: 'queso rallado' },
      { q: 2, u: 'ud', n: 'dientes de ajo picados' },
      { q: 1, u: 'cda', n: 'mantequilla' },
      { q: null, u: '', n: 'Sal, pimienta y nuez moscada' }
    ],
    steps: [
      { t: 'Corta las patatas en láminas de 3 mm, mejor con mandolina.' },
      { t: 'Mézclalas con la nata, el ajo, la sal, la pimienta y la nuez moscada.' },
      { t: 'Engrasa un molde con la mantequilla y coloca las láminas superpuestas.' },
      { t: 'Cubre con aluminio y cocina a 175 °C durante 22 minutos.', timer: 22 },
      { t: 'Retira el aluminio, añade el queso y cocina 8 minutos más.', timer: 8 },
      { t: 'Deja reposar 5 minutos antes de servir.', timer: 5 }
    ],
    tips: [
      'El aluminio al principio cuece la patata; sin él se tuesta antes de estar tierna.',
      'Láminas del mismo grosor: es lo único que garantiza que se hagan a la vez.'
    ],
    tags: ['vegetariana', 'familiar', 'sin-gluten']
  },
  {
    id: 214, name: 'Patatas bombay', emoji: '🍛', category: 'patatas',
    description: 'Dados especiados con cúrcuma, comino y mostaza. Guarnición india muy aromática.',
    prepTime: 10, cookTime: 22, temperature: 195, difficulty: 'Fácil',
    servings: 4, calories: 210, popularity: 71,
    ingredients: [
      { q: 700, u: 'g', n: 'patatas en dados' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'cúrcuma' },
      { q: 1, u: 'cdta', n: 'comino molido' },
      { q: 1, u: 'cdta', n: 'semillas de mostaza' },
      { q: 0.5, u: 'cdta', n: 'guindilla molida' },
      { q: null, u: '', n: 'Sal y cilantro fresco' }
    ],
    steps: [
      { t: 'Seca las patatas y mézclalas con el aceite y todas las especias.' },
      { t: 'Precalienta a 195 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 22 minutos agitando la cesta cada 7 minutos.', timer: 22 },
      { t: 'Espolvorea cilantro fresco al servir.' }
    ],
    tips: [
      'La cúrcuma tiñe mucho: usa un bol que no te importe manchar.',
      'Las semillas de mostaza estallan al calentarse y sueltan todo su aroma.'
    ],
    tags: ['vegetariana', 'saludable', 'economica', 'picante', 'sin-gluten']
  },
  {
    id: 215, name: 'Patatas duquesa', emoji: '👑', category: 'patatas',
    description: 'Rosetones de puré con yema y mantequilla, dorados por fuera. Muy elegantes.',
    prepTime: 20, cookTime: 14, temperature: 190, difficulty: 'Media',
    servings: 4, calories: 220, popularity: 64,
    ingredients: [
      { q: 700, u: 'g', n: 'patatas cocidas y aplastadas' },
      { q: 2, u: 'ud', n: 'yemas de huevo' },
      { q: 40, u: 'g', n: 'mantequilla' },
      { q: 40, u: 'g', n: 'queso parmesano rallado' },
      { q: null, u: '', n: 'Sal, pimienta, nuez moscada y huevo para pintar' }
    ],
    steps: [
      { t: 'Mezcla el puré aún templado con la mantequilla, las yemas, el parmesano y las especias.' },
      { t: 'Pon la masa en una manga con boquilla de estrella.' },
      { t: 'Forma rosetones sobre papel de air fryer, bien separados.' },
      { t: 'Refrigera 15 minutos y pinta con huevo batido.', timer: 15 },
      { t: 'Precalienta a 190 °C durante 3 minutos y cocina 14 minutos.', timer: 14 }
    ],
    tips: [
      'El puré debe quedar espeso; si está aguado, no mantendrán la forma.',
      'La nevera antes de cocinar es lo que fija el dibujo de la manga.'
    ],
    tags: ['vegetariana', 'familiar', 'sin-gluten']
  },
  {
    id: 216, name: 'Patatas a lo pobre', emoji: '🫑', category: 'patatas',
    description: 'Patatas, cebolla y pimiento en láminas, tiernas y melosas. Guarnición andaluza.',
    prepTime: 12, cookTime: 25, temperature: 180, difficulty: 'Fácil',
    servings: 4, calories: 230, popularity: 76,
    ingredients: [
      { q: 800, u: 'g', n: 'patatas en láminas' },
      { q: 2, u: 'ud', n: 'cebollas en juliana' },
      { q: 2, u: 'ud', n: 'pimientos verdes en tiras' },
      { q: 4, u: 'cda', n: 'aceite de oliva' },
      { q: 3, u: 'ud', n: 'dientes de ajo laminados' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Mezcla todas las verduras con el aceite, la sal y la pimienta.' },
      { t: 'Precalienta a 180 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 20 minutos removiendo cada 7 minutos.', timer: 20 },
      { t: 'Añade el ajo laminado y cocina 5 minutos más.', timer: 5 },
      { t: 'Sirve con huevo frito o como acompañamiento de carne.' }
    ],
    tips: [
      'Aquí no buscamos crujiente sino que queden melosas: por eso 180 °C y no 200 °C.',
      'El ajo al final para que no amargue.'
    ],
    tags: ['vegetariana', 'economica', 'familiar', 'sin-gluten']
  },
  {
    id: 217, name: 'Patatas cajún', emoji: '🍟', category: 'patatas',
    description: 'Bastones con mezcla cajún: ahumado, ajo, cebolla y un punto picante.',
    prepTime: 12, cookTime: 20, temperature: 200, difficulty: 'Fácil',
    servings: 3, calories: 230, popularity: 78,
    ingredients: [
      { q: 700, u: 'g', n: 'patatas en bastones' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'cdta', n: 'pimentón ahumado' },
      { q: 0.5, u: 'cdta', n: 'ajo en polvo' },
      { q: 0.5, u: 'cdta', n: 'cebolla en polvo' },
      { q: 0.5, u: 'cdta', n: 'orégano seco' },
      { q: 0.5, u: 'cdta', n: 'guindilla molida' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Deja los bastones en agua fría 15 minutos y sécalos por completo.', timer: 15 },
      { t: 'Mezcla todas las especias con la sal y la pimienta.' },
      { t: 'Impregna las patatas con el aceite y luego con la mezcla de especias.' },
      { t: 'Precalienta a 200 °C durante 3 minutos y cocina 20 minutos agitando cada 6.', timer: 20 },
      { t: 'Sirve con salsa de queso o alioli.' }
    ],
    tips: [
      'Primero el aceite y después las especias: así se pegan y no se caen al fondo.',
      'Sube la guindilla si te gusta el picante de verdad.'
    ],
    tags: ['vegetariana', 'economica', 'picante', 'crujiente', 'sin-gluten']
  },

  /* ─────────────  HUEVOS (ampliación 3)  ───────────── */
  {
    id: 218, name: 'Shakshuka', emoji: '🍅', category: 'huevos',
    description: 'Huevos escalfados en salsa de tomate especiada. Desayuno o cena de una sola pieza.',
    prepTime: 12, cookTime: 20, temperature: 175, difficulty: 'Media',
    servings: 2, calories: 280, popularity: 76,
    ingredients: [
      { q: 4, u: 'ud', n: 'huevos' },
      { q: 400, u: 'g', n: 'tomate triturado' },
      { q: 1, u: 'ud', n: 'cebolla picada' },
      { q: 1, u: 'ud', n: 'pimiento rojo en dados' },
      { q: 1, u: 'cdta', n: 'comino molido' },
      { q: 1, u: 'cdta', n: 'pimentón dulce' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal, pimienta y cilantro' }
    ],
    steps: [
      { t: 'Mezcla la cebolla y el pimiento con el aceite en un molde y cocina 8 minutos a 190 °C.', timer: 8 },
      { t: 'Añade el tomate y las especias y cocina 6 minutos más.', timer: 6 },
      { t: 'Haz huecos en la salsa y casca los huevos dentro.' },
      { t: 'Baja a 175 °C y cocina 6-8 minutos, hasta que la clara cuaje.', timer: 6 },
      { t: 'Espolvorea cilantro y sirve con pan.' }
    ],
    tips: [
      'La salsa debe estar espesa antes de poner los huevos, o quedará aguada.',
      'Vigila a partir del minuto 5 si te gusta la yema líquida.'
    ],
    tags: ['saludable', 'vegetariana', 'proteina', 'economica', 'sin-gluten']
  },
  {
    id: 219, name: 'Quiche lorraine', emoji: '🥓', category: 'huevos',
    description: 'Tarta salada de bacon, nata y queso sobre base quebrada. Clásico francés.',
    prepTime: 20, cookTime: 28, temperature: 170, difficulty: 'Media',
    servings: 4, calories: 380, popularity: 74,
    ingredients: [
      { q: 1, u: 'ud', n: 'lámina de masa quebrada' },
      { q: 150, u: 'g', n: 'bacon en tiras' },
      { q: 3, u: 'ud', n: 'huevos' },
      { q: 200, u: 'ml', n: 'nata para cocinar' },
      { q: 100, u: 'g', n: 'queso rallado' },
      { q: null, u: '', n: 'Sal, pimienta y nuez moscada' }
    ],
    steps: [
      { t: 'Forra un molde con la masa, pínchala con un tenedor y cocínala sola 8 minutos a 170 °C.', timer: 8 },
      { t: 'Cocina el bacon 6 minutos a 180 °C y escúrrelo.', timer: 6 },
      { t: 'Bate los huevos con la nata, el queso, la sal, la pimienta y la nuez moscada.' },
      { t: 'Reparte el bacon sobre la base y vierte la mezcla.' },
      { t: 'Cocina 28 minutos a 170 °C, hasta que el centro esté cuajado.', timer: 28 },
      { t: 'Deja templar 10 minutos antes de cortar.', timer: 10 }
    ],
    tips: [
      'Precocinar la base sola evita el temido fondo crudo y húmedo.',
      'Está lista cuando el centro tiembla apenas al mover el molde.'
    ],
    tags: ['proteina', 'familiar']
  },
  {
    id: 220, name: 'Huevos nube', emoji: '☁️', category: 'huevos',
    description: 'Clara montada horneada con la yema encima. Espectaculares y solo llevan huevo.',
    prepTime: 12, cookTime: 8, temperature: 175, difficulty: 'Difícil',
    servings: 2, calories: 110, popularity: 63,
    ingredients: [
      { q: 4, u: 'ud', n: 'huevos' },
      { q: 40, u: 'g', n: 'queso rallado' },
      { q: null, u: '', n: 'Sal, pimienta y cebollino' }
    ],
    steps: [
      { t: 'Separa las claras de las yemas con mucho cuidado, sin romper ninguna yema.' },
      { t: 'Monta las claras a punto de nieve firme con una pizca de sal.' },
      { t: 'Incorpora el queso y el cebollino con movimientos envolventes.' },
      { t: 'Forma nidos sobre papel de air fryer con un hueco en el centro.' },
      { t: 'Cocina a 175 °C durante 5 minutos, coloca una yema en cada hueco y cocina 3 minutos más.', timer: 3 },
      { t: 'Sirve inmediatamente: se bajan al enfriarse.' }
    ],
    tips: [
      'Un resto de yema en las claras y no montan: separa los huevos de uno en uno en un vaso aparte.',
      'La yema entra al final para que quede líquida.'
    ],
    tags: ['saludable', 'proteina', 'vegetariana', 'rapida', 'sin-gluten']
  },
  {
    id: 221, name: 'Tortilla de calabacín', emoji: '🥒', category: 'huevos',
    description: 'Más ligera que la de patata y con el mismo espíritu. Jugosa y de aprovechamiento.',
    prepTime: 15, cookTime: 22, temperature: 165, difficulty: 'Media',
    servings: 4, calories: 190, popularity: 70,
    ingredients: [
      { q: 3, u: 'ud', n: 'calabacines en láminas' },
      { q: 1, u: 'ud', n: 'cebolla en juliana' },
      { q: 6, u: 'ud', n: 'huevos' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal y pimienta al gusto' }
    ],
    steps: [
      { t: 'Mezcla el calabacín y la cebolla con el aceite y la sal.' },
      { t: 'Cocina a 190 °C durante 12 minutos agitando a mitad, hasta que estén tiernos.', timer: 12 },
      { t: 'Escurre bien el líquido que hayan soltado.' },
      { t: 'Bate los huevos con sal, mezcla las verduras y vierte en un molde engrasado.' },
      { t: 'Cocina a 165 °C durante 22 minutos.', timer: 22 },
      { t: 'Deja reposar 5 minutos y desmolda.', timer: 5 }
    ],
    tips: [
      'El calabacín suelta muchísima agua: escurrirlo es la diferencia entre una tortilla y una sopa.',
      'Si la quieres poco cuajada, retírala a los 18 minutos.'
    ],
    tags: ['saludable', 'vegetariana', 'proteina', 'economica', 'sin-gluten']
  },
  {
    id: 222, name: 'Croque madame', emoji: '🥪', category: 'huevos',
    description: 'Sándwich de jamón y queso gratinado con un huevo encima. Cena francesa en 15 minutos.',
    prepTime: 10, cookTime: 14, temperature: 180, difficulty: 'Media',
    servings: 2, calories: 480, popularity: 72,
    ingredients: [
      { q: 4, u: 'ud', n: 'rebanadas de pan de molde' },
      { q: 4, u: 'ud', n: 'lonchas de jamón cocido' },
      { q: 120, u: 'g', n: 'queso rallado' },
      { q: 2, u: 'ud', n: 'huevos' },
      { q: 20, u: 'g', n: 'mantequilla' },
      { q: null, u: '', n: 'Sal, pimienta y mostaza' }
    ],
    steps: [
      { t: 'Unta el pan con mantequilla y mostaza y monta los sándwiches con jamón y parte del queso.' },
      { t: 'Precalienta a 180 °C durante 3 minutos y cocina 8 minutos dando la vuelta a los 5.', timer: 8 },
      { t: 'Cubre con el resto del queso y cocina 3 minutos.', timer: 3 },
      { t: 'Casca un huevo sobre cada sándwich y cocina 3-4 minutos más.', timer: 3 },
      { t: 'Salpimienta y sirve al momento.' }
    ],
    tips: [
      'Haz un pequeño borde de queso alrededor: hace de dique y el huevo no se escurre.',
      'Baja a 160 °C si prefieres la yema muy líquida.'
    ],
    tags: ['proteina', 'familiar', 'rapida']
  },
  {
    id: 223, name: 'Huevos al horno con champiñones', emoji: '🍄', category: 'huevos',
    description: 'Cazuelitas de champiñones, nata y huevo. Desayuno salado de fin de semana.',
    prepTime: 10, cookTime: 14, temperature: 170, difficulty: 'Fácil',
    servings: 2, calories: 230, popularity: 65,
    ingredients: [
      { q: 4, u: 'ud', n: 'huevos' },
      { q: 200, u: 'g', n: 'champiñones laminados' },
      { q: 4, u: 'cda', n: 'nata para cocinar' },
      { q: 60, u: 'g', n: 'queso rallado' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal, pimienta y cebollino' }
    ],
    steps: [
      { t: 'Cocina los champiñones con el aceite y sal 8 minutos a 190 °C.', timer: 8 },
      { t: 'Repártelos en dos moldes con la nata.' },
      { t: 'Casca dos huevos en cada uno y añade el queso.' },
      { t: 'Cocina a 170 °C durante 10 minutos, hasta que la clara cuaje.', timer: 10 },
      { t: 'Espolvorea cebollino y sirve con pan tostado.' }
    ],
    tips: [
      'Los champiñones sueltan agua: cocínalos antes y escúrrelos.',
      'La nata evita que la clara quede correosa.'
    ],
    tags: ['proteina', 'vegetariana', 'rapida', 'sin-gluten']
  },

  /* ─────────────  PIZZA Y PANES (ampliación 3)  ───────────── */
  {
    id: 224, name: 'Stromboli de jamón y queso', emoji: '🌯', category: 'pizza',
    description: 'Masa de pizza enrollada con el relleno dentro, dorada y cortada en rodajas.',
    prepTime: 18, cookTime: 18, temperature: 180, difficulty: 'Media',
    servings: 4, calories: 400, popularity: 73,
    ingredients: [
      { q: 1, u: 'ud', n: 'masa de pizza' },
      { q: 150, u: 'g', n: 'jamón cocido en lonchas' },
      { q: 180, u: 'g', n: 'mozzarella rallada' },
      { q: 4, u: 'cda', n: 'salsa de tomate' },
      { q: 1, u: 'ud', n: 'huevo batido' },
      { q: 1, u: 'cdta', n: 'orégano seco' }
    ],
    steps: [
      { t: 'Extiende la masa en un rectángulo y unta el tomate dejando un borde libre.' },
      { t: 'Reparte el jamón, el queso y el orégano.' },
      { t: 'Enrolla apretando desde el lado largo y sella los extremos.' },
      { t: 'Pinta con huevo y haz cortes diagonales en la superficie.' },
      { t: 'Precalienta a 180 °C durante 3 minutos y cocina 18 minutos dando la vuelta a los 11.', timer: 18 },
      { t: 'Deja templar 8 minutos y corta en rodajas.', timer: 8 }
    ],
    tips: [
      'Los cortes de arriba dejan salir el vapor y evitan que reviente por un lado.',
      'Cortar en caliente hace que se desmonte: espera esos minutos.'
    ],
    tags: ['familiar', 'proteina']
  },
  {
    id: 225, name: 'Pretzels caseros', emoji: '🥨', category: 'pizza',
    description: 'Lazos de pan con corteza brillante y sal gruesa. Su baño de bicarbonato marca la diferencia.',
    prepTime: 25, cookTime: 12, temperature: 180, difficulty: 'Difícil',
    servings: 4, calories: 260, popularity: 68,
    ingredients: [
      { q: 300, u: 'g', n: 'harina de fuerza' },
      { q: 180, u: 'ml', n: 'agua templada' },
      { q: 5, u: 'g', n: 'levadura seca de panadería' },
      { q: 1, u: 'cdta', n: 'azúcar' },
      { q: 3, u: 'cda', n: 'bicarbonato' },
      { q: 1, u: 'ud', n: 'huevo batido' },
      { q: null, u: '', n: 'Sal gruesa' }
    ],
    steps: [
      { t: 'Amasa la harina con el agua, la levadura, el azúcar y una cucharadita de sal. Deja levar 1 hora.', timer: 60 },
      { t: 'Divide en 6, forma cuerdas largas y dales forma de lazo.' },
      { t: 'Sumérgelos 30 segundos en agua hirviendo con el bicarbonato y escúrrelos.' },
      { t: 'Pinta con huevo y espolvorea sal gruesa.' },
      { t: 'Precalienta a 180 °C durante 3 minutos y cocina 12 minutos.', timer: 12 },
      { t: 'Come calientes, con mostaza o queso fundido.' }
    ],
    tips: [
      'El baño en agua con bicarbonato es lo que da el color y el sabor característicos: no lo saltes.',
      'No los dejes más de 30 segundos en el agua o cogerán sabor metálico.'
    ],
    tags: ['vegetariana', 'economica', 'familiar']
  },
  {
    id: 226, name: 'Grissini con parmesano', emoji: '🥖', category: 'pizza',
    description: 'Palitos de pan finos y quebradizos, para el aperitivo o para acompañar.',
    prepTime: 20, cookTime: 12, temperature: 175, difficulty: 'Media',
    servings: 6, calories: 150, popularity: 62,
    ingredients: [
      { q: 250, u: 'g', n: 'harina' },
      { q: 140, u: 'ml', n: 'agua templada' },
      { q: 4, u: 'g', n: 'levadura seca de panadería' },
      { q: 3, u: 'cda', n: 'aceite de oliva' },
      { q: 50, u: 'g', n: 'queso parmesano rallado' },
      { q: null, u: '', n: 'Sal y semillas de sésamo' }
    ],
    steps: [
      { t: 'Amasa todos los ingredientes hasta obtener una masa lisa. Deja reposar 40 minutos.', timer: 40 },
      { t: 'Estira la masa y corta tiras finas de 1 cm.' },
      { t: 'Retuérce cada tira y espolvorea sésamo.' },
      { t: 'Precalienta a 175 °C durante 3 minutos y cocina 12 minutos dando la vuelta a los 7.', timer: 12 },
      { t: 'Deja enfriar por completo: es al enfriarse cuando quedan quebradizos.' }
    ],
    tips: [
      'Cuanto más finos, más crujientes; los gruesos quedan como pan normal.',
      'Aguantan una semana en un bote hermético.'
    ],
    tags: ['vegetariana', 'economica', 'crujiente']
  },
  {
    id: 227, name: 'Panecillos de leche', emoji: '🍞', category: 'pizza',
    description: 'Bollos tiernos y ligeramente dulces, perfectos para bocadillos o desayuno.',
    prepTime: 25, cookTime: 14, temperature: 165, difficulty: 'Media',
    servings: 6, calories: 210, popularity: 71,
    ingredients: [
      { q: 350, u: 'g', n: 'harina de fuerza' },
      { q: 150, u: 'ml', n: 'leche templada' },
      { q: 6, u: 'g', n: 'levadura seca de panadería' },
      { q: 40, u: 'g', n: 'azúcar' },
      { q: 40, u: 'g', n: 'mantequilla en pomada' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: null, u: '', n: 'Sal y huevo batido para pintar' }
    ],
    steps: [
      { t: 'Mezcla la harina, la leche, la levadura, el azúcar, el huevo y la sal. Amasa 10 minutos.', timer: 10 },
      { t: 'Añade la mantequilla poco a poco y sigue amasando hasta que la masa esté lisa.' },
      { t: 'Deja levar tapada 1 hora, hasta que doble.', timer: 60 },
      { t: 'Forma 6 bolas, colócalas separadas y deja levar 30 minutos más.', timer: 30 },
      { t: 'Pinta con huevo y cocina a 165 °C durante 14 minutos.', timer: 14 },
      { t: 'Deja enfriar sobre una rejilla.' }
    ],
    tips: [
      'Temperatura baja: a 180 °C se doran por fuera antes de cocerse por dentro.',
      'Cocina 3 por tanda como máximo, crecen bastante.'
    ],
    tags: ['vegetariana', 'economica', 'familiar']
  },
  {
    id: 228, name: 'Coca de verduras', emoji: '🫓', category: 'pizza',
    description: 'Masa fina con pimiento, cebolla y calabacín. La pizza mediterránea sin queso.',
    prepTime: 20, cookTime: 20, temperature: 180, difficulty: 'Media',
    servings: 4, calories: 260, popularity: 66,
    ingredients: [
      { q: 1, u: 'ud', n: 'masa de pizza fina' },
      { q: 1, u: 'ud', n: 'pimiento rojo en tiras' },
      { q: 1, u: 'ud', n: 'calabacín en rodajas finas' },
      { q: 1, u: 'ud', n: 'cebolla en juliana' },
      { q: 3, u: 'cda', n: 'aceite de oliva virgen extra' },
      { q: null, u: '', n: 'Sal, pimienta y orégano' }
    ],
    steps: [
      { t: 'Mezcla las verduras con 2 cucharadas de aceite y sal y cocínalas 10 minutos a 190 °C.', timer: 10 },
      { t: 'Extiende la masa ajustándola a la cesta y pínchala con un tenedor.' },
      { t: 'Cocina la masa sola 4 minutos a 180 °C.', timer: 4 },
      { t: 'Reparte las verduras por encima con su jugo y el orégano.' },
      { t: 'Cocina 10 minutos más y riega con el aceite restante al sacarla.', timer: 10 }
    ],
    tips: [
      'Adelantar las verduras evita que suelten agua sobre la masa y la ablanden.',
      'Está buenísima fría al día siguiente.'
    ],
    tags: ['vegetariana', 'saludable', 'economica', 'familiar']
  },
  {
    id: 229, name: 'Pizza barbacoa', emoji: '🍕', category: 'pizza',
    description: 'Base con salsa barbacoa, pollo, bacon y cebolla morada. Dulce y ahumada.',
    prepTime: 15, cookTime: 11, temperature: 180, difficulty: 'Media',
    servings: 2, calories: 540, popularity: 82,
    ingredients: [
      { q: 1, u: 'ud', n: 'base de pizza' },
      { q: 4, u: 'cda', n: 'salsa barbacoa' },
      { q: 150, u: 'g', n: 'pollo cocinado desmenuzado' },
      { q: 60, u: 'g', n: 'bacon en tiras' },
      { q: 150, u: 'g', n: 'mozzarella rallada' },
      { q: 0.5, u: 'ud', n: 'cebolla morada en aros finos' }
    ],
    steps: [
      { t: 'Precalienta a 180 °C durante 3 minutos y cocina la base sola 3 minutos.', timer: 3 },
      { t: 'Unta la salsa barbacoa y reparte el pollo, el bacon, la cebolla y el queso.' },
      { t: 'Cocina 8 minutos más hasta que el queso burbujee.', timer: 8 },
      { t: 'Añade un hilo de barbacoa al servir.' }
    ],
    tips: [
      'La cebolla morada en aros muy finos: gruesa se queda cruda en 8 minutos.',
      'Precocinar la base es lo que evita el centro húmedo.'
    ],
    tags: ['familiar', 'proteina']
  },
  {
    id: 230, name: 'Pan de pita casero', emoji: '🫓', category: 'pizza',
    description: 'Se hinchan como globos y quedan huecos por dentro. Con tres ingredientes.',
    prepTime: 20, cookTime: 8, temperature: 200, difficulty: 'Media',
    servings: 4, calories: 200, popularity: 69,
    ingredients: [
      { q: 300, u: 'g', n: 'harina de fuerza' },
      { q: 180, u: 'ml', n: 'agua templada' },
      { q: 5, u: 'g', n: 'levadura seca de panadería' },
      { q: 1, u: 'cda', n: 'aceite de oliva' },
      { q: null, u: '', n: 'Sal al gusto' }
    ],
    steps: [
      { t: 'Amasa todos los ingredientes 8 minutos hasta obtener una masa lisa.', timer: 8 },
      { t: 'Deja levar tapada 1 hora.', timer: 60 },
      { t: 'Divide en 6 y estira cada porción en un disco de 5 mm.' },
      { t: 'Precalienta a 200 °C durante 5 minutos: el golpe de calor es lo que las hincha.', timer: 5 },
      { t: 'Cocina cada pita 8 minutos, dándole la vuelta a los 5.', timer: 8 },
      { t: 'Envuélvelas en un paño al salir para que queden tiernas.' }
    ],
    tips: [
      'Sin un buen precalentado no se hinchan y quedan como tortas planas.',
      'De una en una: necesitan espacio para inflarse.'
    ],
    tags: ['vegetariana', 'economica', 'familiar']
  },

  /* ─────────────  SNACKS (ampliación 3)  ───────────── */
  {
    id: 231, name: 'Camembert al horno', emoji: '🧀', category: 'snacks',
    description: 'Queso entero fundido con romero y miel, para mojar pan. Cinco minutos de trabajo.',
    prepTime: 5, cookTime: 12, temperature: 180, difficulty: 'Fácil',
    servings: 4, calories: 280, popularity: 81,
    ingredients: [
      { q: 1, u: 'ud', n: 'queso camembert entero en su caja de madera' },
      { q: 1, u: 'ud', n: 'diente de ajo laminado' },
      { q: 1, u: 'cdta', n: 'romero seco' },
      { q: 1, u: 'cda', n: 'miel' },
      { q: null, u: '', n: 'Pan y picos para mojar' }
    ],
    steps: [
      { t: 'Retira el envoltorio y devuelve el queso a su caja de madera (sin la tapa).' },
      { t: 'Haz cortes en cruz en la superficie e introduce las láminas de ajo y el romero.' },
      { t: 'Precalienta a 180 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 12 minutos hasta que el centro esté completamente líquido.', timer: 12 },
      { t: 'Riega con miel y sirve enseguida con pan.' }
    ],
    tips: [
      'Si tu queso no trae caja de madera, envuélvelo en papel de aluminio formando un cuenco.',
      'Se disfruta recién hecho: al enfriarse vuelve a cuajar.'
    ],
    tags: ['vegetariana', 'rapida', 'familiar', 'sin-gluten']
  },
  {
    id: 232, name: 'Feta al horno con tomates', emoji: '🍅', category: 'snacks',
    description: 'El feta se funde entre tomatitos y se convierte en salsa. Sirve como cena con pasta.',
    prepTime: 8, cookTime: 18, temperature: 185, difficulty: 'Fácil',
    servings: 4, calories: 240, popularity: 79,
    ingredients: [
      { q: 200, u: 'g', n: 'queso feta en bloque' },
      { q: 400, u: 'g', n: 'tomates cherry' },
      { q: 3, u: 'cda', n: 'aceite de oliva' },
      { q: 2, u: 'ud', n: 'dientes de ajo' },
      { q: 1, u: 'cdta', n: 'orégano seco' },
      { q: null, u: '', n: 'Pimienta y albahaca fresca' }
    ],
    steps: [
      { t: 'Pon los tomates y los ajos en un molde con el aceite, el orégano y la pimienta.' },
      { t: 'Coloca el bloque de feta en el centro y riégalo también con aceite.' },
      { t: 'Precalienta a 185 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 18 minutos, hasta que los tomates revienten y el queso esté cremoso.', timer: 18 },
      { t: 'Aplasta y mezcla todo, añade albahaca y sirve con pan o pasta.' }
    ],
    tips: [
      'No añadas sal: el feta ya es muy salado.',
      'Con 200 g de pasta cocida y el jugo del molde tienes una cena completa.'
    ],
    tags: ['vegetariana', 'saludable', 'rapida', 'sin-gluten', 'familiar']
  },
  {
    id: 233, name: 'Rollitos de jamón y queso', emoji: '🥪', category: 'snacks',
    description: 'Pan de molde enrollado con jamón y queso, dorado y crujiente. Merienda exprés.',
    prepTime: 10, cookTime: 8, temperature: 190, difficulty: 'Fácil',
    servings: 4, calories: 200, popularity: 77,
    ingredients: [
      { q: 8, u: 'ud', n: 'rebanadas de pan de molde sin corteza' },
      { q: 8, u: 'ud', n: 'lonchas de jamón cocido' },
      { q: 8, u: 'ud', n: 'lonchas de queso' },
      { q: 30, u: 'g', n: 'mantequilla derretida' },
      { q: null, u: '', n: 'Orégano al gusto' }
    ],
    steps: [
      { t: 'Aplana cada rebanada con un rodillo.' },
      { t: 'Coloca el jamón y el queso encima y enrolla apretando.' },
      { t: 'Pinta con la mantequilla y espolvorea orégano.' },
      { t: 'Precalienta a 190 °C durante 2 minutos y cocina 8 minutos dando la vuelta a los 5.', timer: 8 },
      { t: 'Deja templar 2 minutos: el queso quema.', timer: 2 }
    ],
    tips: [
      'Aplanar el pan es imprescindible para que el rollito no se abra.',
      'Colócalos con el cierre hacia abajo en la cesta.'
    ],
    tags: ['rapida', 'familiar', 'economica', 'proteina']
  },
  {
    id: 234, name: 'Gyozas crujientes', emoji: '🥢', category: 'snacks',
    description: 'Empanadillas japonesas con relleno de cerdo y col, doradas por una cara.',
    prepTime: 30, cookTime: 12, temperature: 190, difficulty: 'Difícil',
    servings: 4, calories: 260, popularity: 71,
    ingredients: [
      { q: 24, u: 'ud', n: 'obleas de gyoza' },
      { q: 300, u: 'g', n: 'carne picada de cerdo' },
      { q: 150, u: 'g', n: 'col china muy picada' },
      { q: 2, u: 'ud', n: 'cebolletas picadas' },
      { q: 1, u: 'cdta', n: 'jengibre rallado' },
      { q: 2, u: 'cda', n: 'salsa de soja' },
      { q: 1, u: 'cdta', n: 'aceite de sésamo' },
      { q: null, u: '', n: 'Agua para sellar y aceite en espray' }
    ],
    steps: [
      { t: 'Sala la col picada y déjala 10 minutos; escúrrela apretando muy fuerte.', timer: 10 },
      { t: 'Mézclala con la carne, la cebolleta, el jengibre, la soja y el aceite de sésamo.' },
      { t: 'Rellena las obleas, humedece el borde y ciérralas haciendo pliegues.' },
      { t: 'Precalienta a 190 °C durante 3 minutos y pulveriza aceite generosamente.', timer: 3 },
      { t: 'Cocina 12 minutos dando la vuelta a los 8 minutos.', timer: 12 },
      { t: 'Sirve con salsa de soja, vinagre de arroz y un poco de picante.' }
    ],
    tips: [
      'Escurrir la col es lo que evita que el relleno quede aguado y rompa la oblea.',
      'Los pliegues son estéticos: lo importante es que el cierre quede bien sellado.'
    ],
    tags: ['proteina', 'crujiente', 'familiar']
  },
  {
    id: 235, name: 'Empanadillas de carne', emoji: '🥩', category: 'snacks',
    description: 'Rellenas de carne picada con sofrito y huevo duro. Las de toda la vida, sin freír.',
    prepTime: 25, cookTime: 14, temperature: 180, difficulty: 'Media',
    servings: 4, calories: 300, popularity: 78,
    ingredients: [
      { q: 12, u: 'ud', n: 'obleas para empanadillas' },
      { q: 300, u: 'g', n: 'carne picada' },
      { q: 1, u: 'ud', n: 'cebolla picada' },
      { q: 150, u: 'ml', n: 'tomate frito' },
      { q: 2, u: 'ud', n: 'huevos cocidos picados' },
      { q: 1, u: 'ud', n: 'huevo batido para pintar' },
      { q: null, u: '', n: 'Sal, pimienta y aceite de oliva' }
    ],
    steps: [
      { t: 'Sofríe la cebolla y la carne 10 minutos, añade el tomate y salpimienta.', timer: 10 },
      { t: 'Mezcla con el huevo cocido y deja enfriar por completo.' },
      { t: 'Rellena las obleas y ciérralas sellando con un tenedor.' },
      { t: 'Pinta con huevo batido.' },
      { t: 'Precalienta a 180 °C durante 3 minutos y cocina 14 minutos dando la vuelta a los 8.', timer: 14 },
      { t: 'Deja templar antes de servir.' }
    ],
    tips: [
      'El relleno tibio o caliente ablanda la masa y las abre: enfríalo del todo.',
      'Se congelan crudas: van directas a la cesta con 4 minutos más.'
    ],
    tags: ['proteina', 'familiar', 'economica']
  },
  {
    id: 236, name: 'Chips de plátano macho', emoji: '🍌', category: 'snacks',
    description: 'Tostones o patacones: rodajas de plátano macho crujientes y saladas.',
    prepTime: 12, cookTime: 16, temperature: 195, difficulty: 'Media',
    servings: 4, calories: 170, popularity: 64,
    ingredients: [
      { q: 2, u: 'ud', n: 'plátanos macho verdes' },
      { q: 2, u: 'cda', n: 'aceite de oliva' },
      { q: 1, u: 'ud', n: 'diente de ajo picado' },
      { q: null, u: '', n: 'Sal gruesa al gusto' }
    ],
    steps: [
      { t: 'Pela los plátanos y córtalos en rodajas de 2 cm.' },
      { t: 'Mézclalas con la mitad del aceite y cocina 8 minutos a 195 °C.', timer: 8 },
      { t: 'Sácalas y aplasta cada rodaja con el fondo de un vaso hasta dejarlas planas.' },
      { t: 'Pincélalas con el resto del aceite, el ajo y la sal.' },
      { t: 'Cocina 8 minutos más dándoles la vuelta a los 4.', timer: 8 },
      { t: 'Sirve calientes con guacamole o salsa rosa.' }
    ],
    tips: [
      'Deben ser plátanos macho VERDES: los maduros quedan dulces y blandos.',
      'El doble paso (asar, aplastar, volver a asar) es lo que los hace crujientes.'
    ],
    tags: ['vegetariana', 'economica', 'crujiente', 'sin-gluten']
  },
  {
    id: 237, name: 'Palitos de pan con queso', emoji: '🥖', category: 'snacks',
    description: 'Tiras de masa con mozzarella y ajo, para partir con la mano y mojar en tomate.',
    prepTime: 12, cookTime: 12, temperature: 185, difficulty: 'Fácil',
    servings: 4, calories: 240, popularity: 75,
    ingredients: [
      { q: 1, u: 'ud', n: 'masa de pizza' },
      { q: 150, u: 'g', n: 'mozzarella rallada' },
      { q: 30, u: 'g', n: 'mantequilla derretida' },
      { q: 2, u: 'ud', n: 'dientes de ajo picados' },
      { q: 1, u: 'cdta', n: 'orégano seco' },
      { q: null, u: '', n: 'Salsa de tomate para mojar' }
    ],
    steps: [
      { t: 'Extiende la masa ajustándola a la cesta.' },
      { t: 'Mezcla la mantequilla con el ajo y el orégano y pinta toda la superficie.' },
      { t: 'Cubre con la mozzarella.' },
      { t: 'Precalienta a 185 °C durante 3 minutos y cocina 12 minutos.', timer: 12 },
      { t: 'Corta en tiras con un cortapizzas y sirve con salsa de tomate caliente.' }
    ],
    tips: [
      'Corta después de cocinar, nunca antes: las tiras se separarían y se secarían.',
      'Si la masa sube demasiado en el centro, pínchala con un tenedor antes.'
    ],
    tags: ['vegetariana', 'familiar', 'rapida']
  },
  {
    id: 238, name: 'Mini quiches de verduras', emoji: '🧁', category: 'snacks',
    description: 'Tartaletas individuales de huevo y verduras. Aguantan bien y se comen con la mano.',
    prepTime: 20, cookTime: 18, temperature: 170, difficulty: 'Media',
    servings: 6, calories: 190, popularity: 67,
    ingredients: [
      { q: 1, u: 'ud', n: 'lámina de masa quebrada' },
      { q: 3, u: 'ud', n: 'huevos' },
      { q: 150, u: 'ml', n: 'nata para cocinar' },
      { q: 1, u: 'ud', n: 'calabacín en dados pequeños' },
      { q: 1, u: 'ud', n: 'pimiento en dados pequeños' },
      { q: 80, u: 'g', n: 'queso rallado' },
      { q: null, u: '', n: 'Sal, pimienta y nuez moscada' }
    ],
    steps: [
      { t: 'Corta discos de masa y forra moldes de magdalena.' },
      { t: 'Cocina las verduras 6 minutos a 190 °C y escúrrelas.', timer: 6 },
      { t: 'Bate los huevos con la nata, el queso y las especias y añade las verduras.' },
      { t: 'Rellena las tartaletas hasta 3/4.' },
      { t: 'Cocina a 170 °C durante 18 minutos.', timer: 18 },
      { t: 'Deja templar 5 minutos antes de desmoldar.', timer: 5 }
    ],
    tips: [
      'No las llenes del todo: el huevo sube al cocinarse.',
      'Aguantan 3 días en la nevera y se comen frías o templadas.'
    ],
    tags: ['vegetariana', 'proteina', 'familiar']
  },

  /* ─────────────  POSTRES (ampliación 3)  ───────────── */
  {
    id: 239, name: 'Tarta de queso', emoji: '🍰', category: 'postres',
    description: 'Cremosa por dentro y tostada por fuera, al estilo de La Viña. La reina de los postres.',
    prepTime: 15, cookTime: 30, temperature: 180, difficulty: 'Media',
    servings: 6, calories: 380, popularity: 92,
    ingredients: [
      { q: 500, u: 'g', n: 'queso crema' },
      { q: 150, u: 'g', n: 'azúcar' },
      { q: 3, u: 'ud', n: 'huevos' },
      { q: 200, u: 'ml', n: 'nata para montar' },
      { q: 15, u: 'g', n: 'harina' },
      { q: 1, u: 'pizca', n: 'sal' }
    ],
    steps: [
      { t: 'Bate el queso con el azúcar hasta que quede liso, sin batir de más.' },
      { t: 'Añade los huevos de uno en uno, luego la nata, la harina y la sal.' },
      { t: 'Forra un molde con papel de horno dejando que sobresalga por los lados.' },
      { t: 'Vierte la mezcla y cocina a 180 °C durante 30 minutos.', timer: 30 },
      { t: 'Debe quedar muy tostada por arriba y temblorosa en el centro.' },
      { t: 'Enfría a temperatura ambiente y luego 4 horas en la nevera antes de cortar.' }
    ],
    tips: [
      'El centro tembloroso es correcto: cuaja al enfriarse. Si la cocinas hasta que esté firme, quedará seca.',
      'No batas en exceso: el aire incorporado la hace subir y luego agrietarse.',
      'El reposo en frío no es opcional, es parte de la receta.'
    ],
    tags: ['vegetariana', 'familiar']
  },
  {
    id: 240, name: 'Tarta de Santiago', emoji: '🌰', category: 'postres',
    description: 'Almendra, huevo y azúcar. Sin harina, húmeda y con su cruz de azúcar glas.',
    prepTime: 15, cookTime: 25, temperature: 165, difficulty: 'Fácil',
    servings: 6, calories: 320, popularity: 74,
    ingredients: [
      { q: 250, u: 'g', n: 'almendra molida' },
      { q: 250, u: 'g', n: 'azúcar' },
      { q: 4, u: 'ud', n: 'huevos' },
      { q: 1, u: 'ud', n: 'ralladura de limón' },
      { q: 1, u: 'cdta', n: 'canela molida' },
      { q: null, u: '', n: 'Azúcar glas para decorar' }
    ],
    steps: [
      { t: 'Bate los huevos con el azúcar hasta que blanqueen.' },
      { t: 'Añade la almendra, la ralladura y la canela y mezcla con movimientos envolventes.' },
      { t: 'Vierte en un molde engrasado y forrado.' },
      { t: 'Cocina a 165 °C durante 25 minutos.', timer: 25 },
      { t: 'Comprueba con un palillo y deja enfriar por completo.' },
      { t: 'Espolvorea azúcar glas usando una plantilla de cruz de Santiago.' }
    ],
    tips: [
      'Naturalmente sin gluten: no lleva ni un gramo de harina.',
      'Cúbrela con aluminio si se dora demasiado antes de tiempo.'
    ],
    tags: ['vegetariana', 'sin-gluten', 'familiar']
  },
  {
    id: 241, name: 'Palmeritas de hojaldre', emoji: '🥐', category: 'postres',
    description: 'Dos ingredientes, diez minutos y quedan caramelizadas y crujientes.',
    prepTime: 10, cookTime: 12, temperature: 180, difficulty: 'Fácil',
    servings: 6, calories: 180, popularity: 82,
    ingredients: [
      { q: 1, u: 'ud', n: 'lámina de hojaldre' },
      { q: 100, u: 'g', n: 'azúcar' },
      { q: 1, u: 'cdta', n: 'canela molida (opcional)' }
    ],
    steps: [
      { t: 'Espolvorea la mitad del azúcar sobre la mesa y extiende el hojaldre encima.' },
      { t: 'Cubre con el resto del azúcar y la canela y pasa el rodillo para que se pegue.' },
      { t: 'Enrolla los dos lados largos hacia el centro y refrigera 15 minutos.', timer: 15 },
      { t: 'Corta rodajas de 1 cm y colócalas separadas sobre papel de air fryer.' },
      { t: 'Cocina a 180 °C durante 12 minutos dando la vuelta a los 8.', timer: 12 },
      { t: 'Déjalas enfriar sobre una rejilla: al salir están blandas.' }
    ],
    tips: [
      'El azúcar va debajo y encima, nunca harina: es lo que las caramelizará.',
      'Se expanden mucho: no más de 5 por tanda.'
    ],
    tags: ['vegetariana', 'rapida', 'economica', 'familiar', 'crujiente']
  },
  {
    id: 242, name: 'Mug cake de chocolate', emoji: '☕', category: 'postres',
    description: 'Bizcocho individual en taza. De la nevera a la boca en menos de 15 minutos.',
    prepTime: 5, cookTime: 10, temperature: 175, difficulty: 'Fácil',
    servings: 1, calories: 340, popularity: 80,
    ingredients: [
      { q: 4, u: 'cda', n: 'harina' },
      { q: 3, u: 'cda', n: 'azúcar' },
      { q: 2, u: 'cda', n: 'cacao en polvo' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 3, u: 'cda', n: 'leche' },
      { q: 2, u: 'cda', n: 'aceite de girasol' },
      { q: 0.5, u: 'cdta', n: 'levadura química' }
    ],
    steps: [
      { t: 'Mezcla todos los ingredientes directamente en una taza apta para horno.' },
      { t: 'Remueve hasta que no queden grumos, sin llenar más de dos tercios.' },
      { t: 'Precalienta a 175 °C durante 3 minutos.', timer: 3 },
      { t: 'Cocina 10 minutos; el centro debe quedar ligeramente húmedo.', timer: 10 },
      { t: 'Deja templar 3 minutos y come directamente de la taza.', timer: 3 }
    ],
    tips: [
      'Comprueba que la taza es apta para horno (cerámica sin dorados ni metal).',
      'Un trozo de chocolate hundido en el centro antes de cocinar le da corazón fundido.'
    ],
    tags: ['vegetariana', 'rapida', 'economica']
  },
  {
    id: 243, name: 'Bizcocho de limón', emoji: '🍋', category: 'postres',
    description: 'Esponjoso y con glaseado cítrico. El aroma llena toda la cocina.',
    prepTime: 15, cookTime: 28, temperature: 160, difficulty: 'Media',
    servings: 6, calories: 300, popularity: 78,
    ingredients: [
      { q: 3, u: 'ud', n: 'huevos' },
      { q: 180, u: 'g', n: 'azúcar' },
      { q: 200, u: 'g', n: 'harina' },
      { q: 120, u: 'ml', n: 'aceite de girasol' },
      { q: 2, u: 'ud', n: 'limones (zumo y ralladura)' },
      { q: 8, u: 'g', n: 'levadura química' },
      { q: 80, u: 'g', n: 'azúcar glas' }
    ],
    steps: [
      { t: 'Bate los huevos con el azúcar hasta que blanqueen y doblen su volumen.' },
      { t: 'Añade el aceite en hilo, la ralladura y la mitad del zumo.' },
      { t: 'Incorpora la harina con la levadura tamizadas con movimientos envolventes.' },
      { t: 'Vierte en un molde engrasado y cocina a 160 °C durante 28 minutos.', timer: 28 },
      { t: 'Mezcla el azúcar glas con el zumo restante y glasea el bizcocho ya frío.' }
    ],
    tips: [
      'La ralladura solo de la parte amarilla: la blanca amarga.',
      'Glasea en frío o el glaseado se absorberá y desaparecerá.'
    ],
    tags: ['vegetariana', 'familiar', 'economica']
  },
  {
    id: 244, name: 'Cocadas de coco', emoji: '🥥', category: 'postres',
    description: 'Montañitas de coco doradas por fuera y tiernas dentro. Tres ingredientes.',
    prepTime: 10, cookTime: 12, temperature: 160, difficulty: 'Fácil',
    servings: 4, calories: 190, popularity: 69,
    ingredients: [
      { q: 200, u: 'g', n: 'coco rallado' },
      { q: 150, u: 'g', n: 'leche condensada' },
      { q: 1, u: 'ud', n: 'clara de huevo' },
      { q: 1, u: 'cdta', n: 'extracto de vainilla' }
    ],
    steps: [
      { t: 'Mezcla el coco con la leche condensada y la vainilla.' },
      { t: 'Monta ligeramente la clara e incorpórala con suavidad.' },
      { t: 'Forma montañitas con dos cucharas sobre papel de air fryer.' },
      { t: 'Cocina a 160 °C durante 12 minutos, hasta que las puntas estén doradas.', timer: 12 },
      { t: 'Deja enfriar por completo antes de despegarlas.' }
    ],
    tips: [
      'Temperatura baja: el coco se quema con una facilidad pasmosa.',
      'En caliente están blandas y frágiles; solo se despegan bien ya frías.'
    ],
    tags: ['vegetariana', 'sin-gluten', 'rapida', 'familiar']
  },
  {
    id: 245, name: 'Galletas de mantequilla', emoji: '🍪', category: 'postres',
    description: 'Galletas quebradizas para cortar con moldes. La receta base para decorar.',
    prepTime: 20, cookTime: 10, temperature: 160, difficulty: 'Fácil',
    servings: 6, calories: 170, popularity: 76,
    ingredients: [
      { q: 250, u: 'g', n: 'harina' },
      { q: 125, u: 'g', n: 'mantequilla fría en dados' },
      { q: 100, u: 'g', n: 'azúcar glas' },
      { q: 1, u: 'ud', n: 'huevo' },
      { q: 1, u: 'cdta', n: 'extracto de vainilla' },
      { q: 1, u: 'pizca', n: 'sal' }
    ],
    steps: [
      { t: 'Mezcla la harina con la mantequilla fría hasta obtener migas.' },
      { t: 'Añade el azúcar, el huevo, la vainilla y la sal y forma una bola sin amasar de más.' },
      { t: 'Refrigera 30 minutos.', timer: 30 },
      { t: 'Estira la masa a 5 mm y corta con moldes.' },
      { t: 'Cocina a 160 °C durante 10 minutos, máximo 5 por tanda.', timer: 10 },
      { t: 'Deja enfriar sobre rejilla: endurecen al enfriarse.' }
    ],
    tips: [
      'Mantequilla fría y masa fría: es lo que impide que se deformen al cocinarse.',
      'Amasar de más desarrolla el gluten y quedan duras en vez de quebradizas.'
    ],
    tags: ['vegetariana', 'familiar', 'economica']
  },
  {
    id: 246, name: 'Suflé de chocolate', emoji: '☁️', category: 'postres',
    description: 'Sube como una nube y se come a cucharadas. Hay que servirlo al instante.',
    prepTime: 20, cookTime: 14, temperature: 165, difficulty: 'Difícil',
    servings: 2, calories: 330, popularity: 70,
    ingredients: [
      { q: 100, u: 'g', n: 'chocolate negro' },
      { q: 40, u: 'g', n: 'mantequilla' },
      { q: 3, u: 'ud', n: 'huevos (claras y yemas separadas)' },
      { q: 60, u: 'g', n: 'azúcar' },
      { q: 1, u: 'cda', n: 'harina' },
      { q: null, u: '', n: 'Mantequilla y azúcar para los moldes' }
    ],
    steps: [
      { t: 'Engrasa los moldes con mantequilla y espolvoréalos con azúcar hasta cubrirlos.' },
      { t: 'Funde el chocolate con la mantequilla y añade las yemas y la harina.' },
      { t: 'Monta las claras con el azúcar hasta punto de nieve firme.' },
      { t: 'Incorpóralas al chocolate en tres veces, con movimientos envolventes.' },
      { t: 'Llena los moldes hasta 3/4 y cocina a 165 °C durante 14 minutos SIN ABRIR.', timer: 14 },
      { t: 'Sirve inmediatamente: empieza a bajar en cuanto sale.' }
    ],
    tips: [
      'Abrir la air fryer durante la cocción hace que se desinfle de golpe. Ni un vistazo.',
      'El azúcar en las paredes del molde es la escalera por la que el suflé sube.',
      'Que baje al enfriarse es normal, no es un fallo tuyo.'
    ],
    tags: ['vegetariana']
  },
  {
    id: 247, name: 'Napolitanas de chocolate', emoji: '🥐', category: 'postres',
    description: 'Hojaldre relleno de chocolate, dorado y hojaldrado. Desayuno de panadería en casa.',
    prepTime: 12, cookTime: 14, temperature: 180, difficulty: 'Fácil',
    servings: 4, calories: 290, popularity: 84,
    ingredients: [
      { q: 1, u: 'ud', n: 'lámina de hojaldre' },
      { q: 120, u: 'g', n: 'chocolate negro en barritas' },
      { q: 1, u: 'ud', n: 'huevo batido' },
      { q: 1, u: 'cda', n: 'azúcar' }
    ],
    steps: [
      { t: 'Corta el hojaldre en 4 rectángulos.' },
      { t: 'Pon el chocolate en un extremo y enrolla, dejando el cierre debajo.' },
      { t: 'Pinta con huevo y espolvorea azúcar.' },
      { t: 'Precalienta a 180 °C durante 3 minutos y cocina 14 minutos.', timer: 14 },
      { t: 'Deja templar 5 minutos antes de comer.', timer: 5 }
    ],
    tips: [
      'Cierre hacia abajo o se abrirán y el chocolate acabará en la cesta.',
      'Se congelan crudas: directas a la cesta con 4 minutos más.'
    ],
    tags: ['vegetariana', 'rapida', 'familiar']
  },
  {
    id: 248, name: 'Hojaldres rellenos de crema', emoji: '🥐', category: 'postres',
    description: 'Milhojas individuales con crema pastelera y azúcar glas.',
    prepTime: 25, cookTime: 14, temperature: 180, difficulty: 'Media',
    servings: 4, calories: 320, popularity: 71,
    ingredients: [
      { q: 1, u: 'ud', n: 'lámina de hojaldre' },
      { q: 400, u: 'ml', n: 'leche' },
      { q: 3, u: 'ud', n: 'yemas de huevo' },
      { q: 80, u: 'g', n: 'azúcar' },
      { q: 30, u: 'g', n: 'maicena' },
      { q: 1, u: 'ud', n: 'piel de limón' },
      { q: null, u: '', n: 'Azúcar glas para decorar' }
    ],
    steps: [
      { t: 'Corta el hojaldre en rectángulos, pínchalos y cocina 14 minutos a 180 °C con un peso encima.', timer: 14 },
      { t: 'Calienta la leche con la piel de limón sin que hierva.' },
      { t: 'Bate las yemas con el azúcar y la maicena, añade la leche colada y cuece removiendo hasta que espese.' },
      { t: 'Deja enfriar la crema tapada a piel.' },
      { t: 'Rellena los hojaldres con la crema y espolvorea azúcar glas.' }
    ],
    tips: [
      'El peso encima del hojaldre (otro molde, por ejemplo) evita que suba desigual.',
      'Tapar la crema "a piel" con film evita que se forme costra.'
    ],
    tags: ['vegetariana', 'familiar']
  },
  {
    id: 249, name: 'Manzana en hojaldre', emoji: '🍎', category: 'postres',
    description: 'Media manzana envuelta en tiras de hojaldre con canela. Muy vistoso y fácil.',
    prepTime: 15, cookTime: 20, temperature: 175, difficulty: 'Fácil',
    servings: 4, calories: 240, popularity: 73,
    ingredients: [
      { q: 2, u: 'ud', n: 'manzanas' },
      { q: 1, u: 'ud', n: 'lámina de hojaldre' },
      { q: 2, u: 'cda', n: 'azúcar moreno' },
      { q: 1, u: 'cdta', n: 'canela molida' },
      { q: 20, u: 'g', n: 'mantequilla derretida' },
      { q: null, u: '', n: 'Azúcar glas para decorar' }
    ],
    steps: [
      { t: 'Corta las manzanas por la mitad y descorazónalas.' },
      { t: 'Espolvorea el azúcar moreno y la canela sobre el hueco.' },
      { t: 'Corta el hojaldre en tiras de 2 cm y envuelve cada media manzana en espiral.' },
      { t: 'Pinta con mantequilla derretida.' },
      { t: 'Precalienta a 175 °C durante 3 minutos y cocina 20 minutos.', timer: 20 },
      { t: 'Espolvorea azúcar glas y sirve templado con helado.' }
    ],
    tips: [
      'Manzanas que aguanten el horneado (Golden, Reineta); las blandas se deshacen.',
      'Cubre con aluminio si el hojaldre se dora antes de que la manzana esté tierna.'
    ],
    tags: ['vegetariana', 'familiar', 'economica']
  },
  {
    id: 250, name: 'Bizcocho de chocolate y calabacín', emoji: '🍫', category: 'postres',
    description: 'El calabacín no se nota y lo deja jugosísimo. Con menos azúcar de lo habitual.',
    prepTime: 20, cookTime: 30, temperature: 160, difficulty: 'Media',
    servings: 6, calories: 270, popularity: 66,
    ingredients: [
      { q: 200, u: 'g', n: 'calabacín rallado y escurrido' },
      { q: 200, u: 'g', n: 'harina' },
      { q: 50, u: 'g', n: 'cacao en polvo' },
      { q: 120, u: 'g', n: 'azúcar moreno' },
      { q: 3, u: 'ud', n: 'huevos' },
      { q: 100, u: 'ml', n: 'aceite de girasol' },
      { q: 8, u: 'g', n: 'levadura química' },
      { q: 80, u: 'g', n: 'pepitas de chocolate' }
    ],
    steps: [
      { t: 'Ralla el calabacín y escúrrelo apretando con un paño.' },
      { t: 'Bate los huevos con el azúcar y añade el aceite.' },
      { t: 'Incorpora la harina, el cacao y la levadura tamizados, y después el calabacín.' },
      { t: 'Añade las pepitas y vierte en un molde engrasado.' },
      { t: 'Cocina a 160 °C durante 30 minutos sin abrir los primeros 22.', timer: 30 },
      { t: 'Comprueba con un palillo y enfría sobre rejilla.' }
    ],
    tips: [
      'Escurrir bien el calabacín: si no, el bizcocho queda crudo por dentro.',
      'Es la mejor forma de colar verdura a quien no quiere ni verla.'
    ],
    tags: ['vegetariana', 'saludable', 'familiar']
  }
];

/* Total de recetas disponibles en la aplicación */
const RECIPE_COUNT = RECIPES.length;
