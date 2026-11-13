// Biblioteca de artículos editoriales de fondo, historia del tenis argentino, reglamento y táctica
// Todos los artículos son originales, extensos y diseñados bajo estándares periodísticos E-E-A-T.

export const SEED_NEWS = [
  {
    id: 'como-funciona-sistema-puntos-ranking-atp',
    slug: 'como-funciona-sistema-puntos-ranking-atp',
    title: 'Guía Completa: Cómo funciona el sistema de puntos, las 52 semanas y el Ranking ATP y WTA',
    excerpt: 'El ranking mundial es el termómetro del tenis profesional. Te explicamos en detalle cómo se defienden los puntos cada lunes, el corte de los 19 mejores torneos, la Race a Turín y la escala desde Grand Slams hasta Challengers.',
    category: 'Reglas y Análisis',
    readTime: '7 min',
    publishedAt: '2026-10-28',
    author: 'Redacción DobleFalta',
    imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=900&q=80',
    content: `
      <p>El Ranking oficial de la ATP (Asociación de Tenistas Profesionales) y de la WTA (Women's Tennis Association) es mucho más que una tabla de posiciones: es el mecanismo matemático y mérito deportivo que define quién ingresa directamente a los cuadros principales de los torneos, quiénes deben atravesar la exigente fase de clasificación (qualy) y cómo se distribuyen los cabezas de serie para evitar que las máximas figuras se enfrenten en las primeras rondas.</p>
      
      <p>Para cualquier aficionado que sigue día a día a los tenistas argentinos en el circuito internacional, comprender la ingeniería detrás de cada actualización de los lunes resulta indispensable para entender por qué un jugador sube o baja de puesto incluso en semanas donde no compite o donde gana partidos.</p>

      <h2>El principio del sistema rodante de 52 semanas</h2>
      <p>A diferencia de la mayoría de las ligas de fútbol o básquetbol, donde todos los equipos arrancan con cero puntos en enero, el ranking oficial de tenis opera bajo una ventana móvil de <strong>52 semanas exactas</strong> (con la única excepción de las ATP y WTA Finals, cuyos puntos se descuentan antes de disputarse la edición del año siguiente). Esto significa que cada punto obtenido en un torneo tiene una "fecha de vencimiento" de exactamente un año calendario.</p>
      <p>De allí surge el famoso concepto de <strong>"defender puntos"</strong>. Si un tenista argentino alcanza las semifinales del Argentina Open en febrero y suma 100 puntos, esas 100 unidades permanecerán en su cuenta durante 52 semanas. Cuando llega la edición del año siguiente, esos 100 puntos antiguos se restan automáticamente el lunes posterior al torneo y se reemplazan por lo que haya cosechado en la nueva edición: si gana el título (250 puntos), su saldo neto aumenta en +150; si pierde en primera ronda (0 puntos), sufre una caída neta de -100 unidades en el escalafón mundial.</p>

      <h2>La jerarquía de los torneos y el reparto de puntos</h2>
      <p>El calendario profesional está organizado en pirámides claramente diferenciadas según la envergadura, el premio económico y la dificultad del cuadro:</p>
      <ul>
        <li><strong>Grand Slams (Australian Open, Roland Garros, Wimbledon y US Open):</strong> Son la cúspide del deporte. Otorgan <strong>2.000 puntos</strong> al campeón, 1.300 al finalista, 800 a los semifinalistas, 400 a los cuartofinalistas, 200 por octavos de final, 100 por tercera ronda y 50 por avanzar a segunda ronda. Además, superar la clasificación premia con puntos adicionales.</li>
        <li><strong>ATP Masters 1000 y WTA 1000:</strong> Los nueve certámenes anuales de máxima categoría de la ATP (Indian Wells, Miami, Montecarlo, Madrid, Roma, Canadá, Cincinnati, Shanghái y París) entregan <strong>1.000 puntos</strong> al ganador, 650 al finalista y 400 a los semifinalistas.</li>
        <li><strong>ATP 500 y ATP 250:</strong> Representan la columna vertebral del circuito semanal. Torneos históricos como Río de Janeiro, Viena, Basilea o Acapulco reparten 500 unidades al campeón, mientras que citas tradicionales como Buenos Aires, Santiago, Ginebra o Estocolmo entregan 250 puntos.</li>
        <li><strong>ATP Challenger Tour:</strong> Dividido en categorías Challenger 175, 125, 100, 75 y 50. Es el terreno donde los tenistas ubicados entre el puesto 70 y el 350 del mundo construyen su ranking para irrumpir en el Top 100 y asegurarse el ingreso directo a los cuatro Grand Slams.</li>
        <li><strong>ITF World Tennis Tour (M15, M25, W15, W35, W50, W75, W100):</strong> El primer escalón profesional, clave para que los juveniles sumen sus primeras unidades oficiales.</li>
      </ul>

      <h2>La regla de los 19 mejores resultados</h2>
      <p>Un jugador no puede inflar su ranking simplemente anotándose en 35 torneos al año. La sumatoria total de un tenista de élite en la ATP se compone de sus <strong>19 mejores resultados</strong> obtenidos a lo largo de las últimas 52 semanas (20 en el caso de clasificar a las Finals de Turín). Para los jugadores que finalizaron el año anterior dentro del Top 30, esa cuenta incluye obligatoriamente los puntos de los cuatro Grand Slams, los ocho Masters 1000 obligatorios (todos menos Montecarlo) y sus siete mejores actuaciones adicionales en torneos ATP 500, 250, United Cup o Challenger.</p>

      <h2>Diferencia entre el Ranking de 52 semanas y la Carrera (Race)</h2>
      <p>Durante toda la temporada conviven dos tablas oficiales: el <strong>Ranking ATP/WTA</strong> (que mira los últimos 365 días y define las preclasificaciones de cada semana) y la <strong>Race to Turin / Race to Riyadh</strong>, que empieza de cero el 1 de enero y acumula exclusivamente los puntos ganados en el año en curso. Al finalizar el Masters 1000 de París en noviembre, ambas tablas convergen y quien termina número 1 de la Race se consagra también como el Número 1 del mundo de fin de temporada.</p>
    `
  },
  {
    id: 'argentinos-circuito-atp-desafio-polvo-ladrillo',
    slug: 'argentinos-circuito-atp-desafio-polvo-ladrillo',
    title: 'El presente de la Legión Argentina: Consolidación en el Top 50 y el recambio generacional',
    excerpt: 'Con Francisco Cerúndolo, Sebastián Báez, Tomás Martín Etcheverry y Mariano Navone como estandartes, analizamos cómo la camada nacida entre 1999 y 2002 sostiene a la Argentina como potencia mundial.',
    category: 'Tenis Argentino',
    readTime: '6 min',
    publishedAt: '2026-10-26',
    author: 'Redacción DobleFalta',
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=900&q=80',
    content: `
      <p>Hablar del tenis argentino en la década de 2020 es hablar de resiliencia, método de trabajo y una inagotable capacidad de regeneración competitiva. Tras el retiro progresivo de la generación que conquistó la Copa Davis en 2016 y de referentes como Juan Martín del Potro y Diego Schwartzman, muchos analistas se preguntaban cuánto tiempo tardaría el país en volver a poblar la primera página del ranking mundial. La respuesta llegó desde las canchas de los clubes formadores: una camada prolífica nacida entre 1999 y 2002 tomó la posta con autoridad.</p>

      <h2>Francisco Cerúndolo y la adaptación al tenis moderno</h2>
      <p>Francisco Cerúndolo se ha establecido como uno de los jugadores sudamericanos más completos de la actualidad. Poseedor de una derecha explosiva capaz de generar tiros ganadores desde cualquier sector de la cancha, su gran mérito ha sido romper el molde del especialista exclusivo de polvo de ladrillo. Sus actuaciones memorables en el Masters 1000 de Miami, su título sobre el césped de Eastbourne, sus victorias ante jugadores del Top 5 en París y Roland Garros y su presencia constante en la segunda semana de los grandes torneos demuestran una madurez táctica preparada para competir de igual a igual en superficies rápidas e indoor.</p>

      <h2>Sebastián Báez: Intensidad, contragolpe y mentalidad ganadora</h2>
      <p>Formado bajo una ética de trabajo implacable, Sebastián Báez representa la quintaesencia del guerrero de canchas lentas con recursos modernos. Su velocidad de piernas, capacidad para tomar la pelota temprano sobre la línea de base y su lectura táctica en los momentos de presión lo han llevado a cosechar múltiples títulos ATP en diferentes continentes, desde Estoril y Kitzbühel hasta Río de Janeiro, Córdoba y Santiago. Báez no solo gana partidos por desgaste físico, sino por su notable eficacia en los puntos de quiebre.</p>

      <h2>Tomás Etcheverry, Mariano Navone y la profundidad de la base</h2>
      <p>El diferencial de la Argentina frente a la mayoría de las naciones tenísticas radica en su volumen de jugadores competitivos. Tomás Martín Etcheverry, con casi dos metros de estatura, combina un primer servicio potente con la movilidad y consistencia de fondo propia de la escuela platense, alcanzando cuartos de final en Roland Garros y finales en el circuito ATP. A su lado, la irrupción meteórica de Mariano Navone, sumada al empuje de Facundo Díaz Acosta, Camilo Ugo Carabelli, Francisco Comesaña, Thiago Agustín Tirante, Juan Manuel Cerúndolo y Román Burruchaga, garantiza una competencia interna feroz.</p>

      <h2>El rol estratégico de los Challengers en Sudamérica</h2>
      <p>Uno de los factores determinantes de este fenómeno ha sido la multiplicación de torneos Challenger e ITF en suelo argentino y sudamericano (Buenos Aires, Villa María, Santa Fe, Tucumán, Guayaquil, Lima, Cali, Curitiba y Costa do Sauípe). Esta estructura regional permite que los jugadores jóvenes compitan por puntos valiosos cerca de casa, reduciendo el impacto económico de las giras europeas y acelerando su maduración profesional.</p>
    `
  },
  {
    id: 'superficies-tenis-diferencias-estrategia-rebote',
    slug: 'superficies-tenis-diferencias-estrategia-rebote',
    title: 'Polvo de ladrillo vs. Cemento y Césped: Física del pique, biomecánica y táctica en cada superficie',
    excerpt: 'Desde el coeficiente de fricción en la arcilla de Roland Garros hasta la velocidad rasante del césped en Wimbledon. Descubrí cómo cambia la geometría del punto según el suelo.',
    category: 'Análisis Táctico',
    readTime: '7 min',
    publishedAt: '2026-10-24',
    author: 'Redacción DobleFalta',
    imageUrl: 'https://images.unsplash.com/photo-1530915534664-4ac642379740?auto=format&fit=crop&w=900&q=80',
    content: `
      <p>El tenis profesional posee una particularidad única dentro del deporte de alta competencia: mientras el campo de juego mide exactamente lo mismo (23,77 metros de largo por 8,23 metros de ancho en singles) en todos los rincones del planeta, el material sobre el que pica la pelota transforma radicalmente las leyes de la física, las demandas fisiológicas y el libreto táctico de los jugadores.</p>

      <h2>1. Polvo de ladrillo (Tierra batida): Fricción alta y construcción geométrica</h2>
      <p>Compuesta por capas de piedra triturada, grava, clinker y una cubierta superior de ladrillo cerámico finamente molido, la cancha de polvo de ladrillo presenta el coeficiente de fricción horizontal más elevado del circuito. Cuando la pelota impacta contra la arcilla, "muerde" el suelo: pierde cerca del 40% de su velocidad de traslación hacia adelante, pero conserva y amplifica el giro vertical (<em>topspin</em>), provocando un bote alto y pesado que empuja al rival varios metros detrás de la línea de base.</p>
      <p>En este escenario, el saque directo pierde eficacia relativa y gana protagonismo el saque con efecto <em>kick</em> abierto para sacar al receptor de la cancha. La biomecánica del desplazamiento exige dominar el arte de patinar hacia la pelota mientras se ejecuta el golpe, ahorrando energía en el frenado y permitiendo recuperar el centro de la pista rápidamente.</p>

      <h2>2. Canchas duras (Cemento y acrílico): El equilibrio entre potencia y anticipación</h2>
      <p>Las pistas duras representan más del 60% del calendario anual de la ATP y la WTA, incluyendo el Abierto de Australia, el US Open y siete de los nueve Masters 1000. Construidas sobre bases de asfalto u hormigón recubiertas por múltiples capas de pintura acrílica mezclada con sílice, su velocidad varía según la cantidad de arena incorporada en la capa superficial y las condiciones climáticas (humedad y temperatura).</p>
      <p>El bote en cemento es el más uniforme y predecible. Premia a quienes impactan la pelota en subida, utilizan tiros planos o con <em>topspin</em> moderado y dominan el centro de la cancha con la combinación de primer servicio más primer golpe de derecha. En las canchas duras bajo techo (<em>indoor</em>), la ausencia de viento y sol convierte la precisión del saque y el bloqueo de devolución en las armas definitivas.</p>

      <h2>3. Césped natural: Rebote bajo, velocidad pura y juego de red</h2>
      <p>Durante las cinco semanas de la gira europea sobre hierba, coronada en el All England Club de Wimbledon, el césped cortado a exactamente 8 milímetros de altura ofrece la menor fricción superficial. La pelota apenas se frena al tocar el suelo y su ángulo de salida es sumamente bajo, resbalando hacia el jugador que recibe.</p>
      <p>Esto reduce el tiempo de reacción en fracciones críticas de segundo. Los armados de golpe largos (<em>backswings</em> amplios) suelen llegar tarde en césped; por eso triunfan los tenistas con preparaciones compactas, excelente revés con <em>slice</em> (que hace que la pelota casi no levante del pasto), servicio cortado al cuerpo y decisión para cerrar los puntos en la volea.</p>
    `
  },
  {
    id: 'guillermo-vilas-legado-historia-tenis-argentino',
    slug: 'guillermo-vilas-legado-historia-tenis-argentino',
    title: 'Guillermo Vilas y la revolución del tenis en Argentina: El mítico 1977, sus 62 títulos y un legado eterno',
    excerpt: 'Antes de Vilas, el tenis era un deporte de nicho en el país. Repasamos cómo el zurdo formado en Mar del Plata popularizó la raqueta, perfeccionó el topspin y marcó récords históricos.',
    category: 'Historia y Leyendas',
    readTime: '8 min',
    publishedAt: '2026-10-22',
    author: 'Redacción DobleFalta',
    imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=80',
    content: `
      <p>Si hoy la Argentina cuenta con decenas de jugadores compitiendo cada semana en torneos ATP, WTA y Challenger alrededor del planeta, la explicación histórica tiene un punto de partida indiscutible: <strong>Guillermo Vilas</strong>. En la década de 1970, el joven zurdo criado en Mar del Plata transformó para siempre la cultura deportiva nacional, llevando al tenis desde los clubes tradicionales hacia cada barrio y rincón del país.</p>

      <h2>La reinvención del topspin y la alianza con Ion Tiriac</h2>
      <p>En una época en la que predominaban las raquetas de madera de aro pequeño y el juego clásico de saque y volea o golpes planos, Vilas introdujo una revolución física y técnica. Junto al entrenador rumano Ion Tiriac, sometió su cuerpo a rutinas de entrenamiento de seis y siete horas diarias jamás vistas hasta entonces en el circuito.</p>
      <p>Su sello técnico fue el uso sistemático del <em>topspin</em> pesado tanto de drive como de revés a una mano, dándole a la pelota un margen de seguridad enorme por encima de la red y un pique alto que desgastaba física y mentalmente a sus oponentes. A eso le sumó su célebre creación patentada en 1975: la <strong>"Gran Willy"</strong>, el golpe entre las piernas de espaldas a la red inspirado en un anuncio publicitario de polo.</p>

      <h2>1977: La temporada más dominante de la historia</h2>
      <p>El año 1977 de Guillermo Vilas permanece en los libros dorados del deporte mundial como una de las gestas individuales más impresionantes de todos los tiempos. En aquel calendario, el argentino conquistó <strong>16 títulos oficiales</strong> (incluidos Roland Garros, donde demolió a Brian Gottfried por 6-0, 6-3 y 6-0 en la final, y el US Open en Forest Hills derrotando a Jimmy Connors en cuatro sets), además de encadenar una racha invicta de <strong>46 partidos consecutivos en todas las superficies</strong> y 53 victorias seguidas en polvo de ladrillo, un récord que duró casi tres décadas hasta la aparición de Rafael Nadal.</p>

      <h2>Los 62 títulos y el impacto cultural</h2>
      <p>A lo largo de su extraordinaria carrera profesional, Vilas levantó <strong>62 trofeos de la Era Abierta</strong>, incluyendo cuatro coronas de Grand Slam (Roland Garros 1977, US Open 1977, Australian Open 1978 y Australian Open 1979) y el Torneo de Maestros de Melbourne en 1974, donde venció a Ilie Nastase en cinco sets sobre césped. Más allá de las estadísticas y de su histórica lucha por el reconocimiento del número 1 del ranking, su verdadero triunfo fue sembrar la pasión por el tenis en millones de argentinos.</p>
    `
  },
  {
    id: 'juan-martin-del-potro-us-open-epopeya-olimpica',
    slug: 'juan-martin-del-potro-us-open-epopeya-olimpica',
    title: 'Juan Martín del Potro: Del trueno de Tandil en el US Open 2009 a la epopeya olímpica y la Copa Davis',
    excerpt: 'Dueño de una de las derechas más potentes de la historia del tenis, Del Potro fue el único capaz de destronar al Big Four en su apogeo y protagonizó los regresos más emocionantes del deporte.',
    category: 'Historia y Leyendas',
    readTime: '7 min',
    publishedAt: '2026-10-20',
    author: 'Redacción DobleFalta',
    imageUrl: 'https://images.unsplash.com/photo-1542144582-1ba00456b5e3?auto=format&fit=crop&w=900&q=80',
    content: `
      <p>En la era más competitiva de toda la historia del tenis masculino, dominada con puño de hierro por Roger Federer, Rafael Nadal y Novak Djokovic, hubo un gigante de 1,98 metros nacido en Tandil que logró mirarlos a los ojos y derrotarlos en los escenarios más imponentes del planeta. <strong>Juan Martín del Potro</strong> no solo dejó una huella imborrable por su talento descomunal, sino por una resiliencia sobrehumana frente a las lesiones de muñeca y rodilla.</p>

      <h2>Flushing Meadows 2009: La derecha que sacudió Nueva York</h2>
      <p>Con apenas 20 años, Del Potro llegó al US Open de 2009 decidido a dar el golpe. Tras superar a Marin Cilic en cuartos de final, protagonizó una semifinal antológica frente a Rafael Nadal, a quien barrió por un triple 6-2 con una exhibición de potencia pura. Al día siguiente, en el estadio Arthur Ashe, se midió ante un Roger Federer que acumulaba cinco títulos consecutivos en Nueva York.</p>
      <p>Luego de estar un set y quiebre abajo, la "Torre de Tandil" desató un vendaval de derechas invertidas y paralelas que alcanzaron velocidades superiores a los 160 km/h, imponiéndose por 3-6, 7-6(5), 4-6, 7-6(4) y 6-2. Fue su consagración definitiva en la élite mundial.</p>

      <h2>Londres 2012 y Río 2016: El romance con los Juegos Olímpicos</h2>
      <p>Pocas páginas del deporte argentino resultan tan conmovedoras como las actuaciones olímpicas de Del Potro. En Londres 2012, sobre el césped de Wimbledon, cayó ante Federer por 19-17 en el tercer set de la semifinal más larga de la historia olímpica, pero tuvo la fortaleza anímica para derrotar al día siguiente a Novak Djokovic y colgarse la medalla de bronce.</p>
      <p>Cuatro años más tarde, en Río de Janeiro 2016, tras haber pasado por tres cirugías en su muñeca izquierda y ubicado fuera del Top 140 del ranking, eliminó a Djokovic en primera ronda y a Nadal en semifinales para conquistar una inolvidable medalla de plata.</p>

      <h2>2016-2018: La Ensaladera, Indian Wells y el Número 3 del mundo</h2>
      <p>Aquel renacimiento de 2016 culminó en noviembre en Zagreb, liderando al equipo argentino hacia su primera Copa Davis tras remontar dos sets de desventaja ante Marin Cilic en el cuarto punto. Dos años después, en 2018, Del Potro alcanzó el puesto <strong>N° 3 del ranking ATP</strong>, ganó su primer Masters 1000 en Indian Wells salvando tres puntos de partido ante Federer y volvió a disputar la final del US Open, sellando una carrera legendaria con 22 títulos ATP.</p>
    `
  },
  {
    id: 'copa-davis-2016-zagreb-hazana-historica-argentina',
    slug: 'copa-davis-2016-zagreb-hazana-historica-argentina',
    title: 'Zagreb 2016: Crónica táctica y emocional de la primera Copa Davis en la historia del tenis argentino',
    excerpt: 'Tras cuatro finales esquivas (1981, 2006, 2008 y 2011), el equipo capitaneado por Daniel Orsanic ganó las cuatro series de visitante para levantar la Ensaladera de Plata en Croacia.',
    category: 'Historia y Leyendas',
    readTime: '7 min',
    publishedAt: '2026-10-18',
    author: 'Redacción DobleFalta',
    imageUrl: 'https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?auto=format&fit=crop&w=900&q=80',
    content: `
      <p>Durante casi un siglo, la Copa Davis fue la gran obsesión y la herida abierta del tenis argentino. Cuatro generaciones distintas habían acariciado la Ensaladera de Plata sin poder levantarla: Vilas y Clerc en Cincinnati 1981; Nalbandian, Calleri, Acasuso y Chela en Moscú 2006; la dolorosa final de Mar del Plata 2008; y la batalla de Sevilla en 2011. Todo cambió en la temporada 2016, cuando un grupo unido bajo la conducción serena de <strong>Daniel Orsanic</strong> escribió la página más gloriosa del tenis nacional.</p>

      <h2>Cuatro series como visitante: Gdańsk, Pesaro, Glasgow y Zagreb</h2>
      <p>El camino de Argentina en 2016 tuvo el mérito inédito de disputarse íntegramente fuera de casa. En primera ronda, en Gdańsk sobre carpeta rápida bajo techo, Leonardo Mayer y el debutante Guido Pella sellaron el 3-1 ante Polonia. En cuartos de final, sobre el polvo de ladrillo de Pesaro frente a Italia, Federico Delbonis fue el héroe con dos puntos individuales y el regreso de Juan Martín del Potro aportó un triunfo clave en el dobles junto a Pella.</p>
      <p>La semifinal en Glasgow ante Gran Bretaña, vigente campeona liderada por Andy Murray, ofreció uno de los partidos más épicos de la historia de la competencia: Del Potro derrotó a Andy Murray en cinco sets tras más de cinco horas de juego en el primer punto del viernes, y el domingo Leonardo Mayer definió la serie venciendo a Daniel Evans en cuatro parciales.</p>

      <h2>El domingo eterno en el Arena Zagreb</h2>
      <p>En la final del 25 al 27 de noviembre en Croacia, el equipo local conducido por Marin Cilic e Ivo Karlovic se adelantó 2-1 tras imponerse en el dobles del sábado. El domingo, con Argentina contra las cuerdas, Del Potro salió a enfrentar a Cilic y quedó rápidamente dos sets abajo (6-7, 2-6). Lo que siguió fue una remontada inmortal: jugando incluso el quinto set con una fisura en el dedo meñique de su mano izquierda tras atajar una pelota, el tandilense dio vuelta el partido por 6-7(4), 2-6, 7-5, 6-4 y 6-3 en casi cinco horas.</p>
      <p>Con la serie igualada 2-2, <strong>Federico Delbonis</strong> jugó el partido perfecto de su vida ante el gigante Ivo Karlovic. Con una devolución quirúrgica, pasando por ambos lados y sin ceder jamás su servicio, el azuleño se impuso por 6-3, 6-4 y 6-2 para desatar el festejo más esperado de la historia del tenis argentino.</p>
    `
  },
  {
    id: 'gabriela-sabatini-paola-suarez-historia-tenis-femenino-argentino',
    slug: 'gabriela-sabatini-paola-suarez-historia-tenis-femenino-argentino',
    title: 'De Gabriela Sabatini y Paola Suárez a la nueva generación: Historia y presente del tenis femenino argentino',
    excerpt: 'Desde el US Open 1990 y los dos Masters de Sabatini hasta los 8 Grand Slams de Suárez, las semifinales de Podoroska en París y el empuje actual de Sierra, Riera, Carlé y Ortenzi.',
    category: 'Tenis Argentino',
    readTime: '7 min',
    publishedAt: '2026-10-16',
    author: 'Redacción DobleFalta',
    imageUrl: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=900&q=80',
    content: `
      <p>El tenis femenino argentino posee una rica tradición de talento, carisma y conquistas en los mayores escenarios del planeta. A lo largo de las últimas cuatro décadas, las jugadoras nacionales han protagonizado gestas inolvidables que inspiraron a miles de jóvenes a empuñar una raqueta en los clubes de todo el país.</p>

      <h2>Gabriela Sabatini: Elegancia y gloria en Nueva York</h2>
      <p>El nombre de <strong>Gabriela Sabatini</strong> trasciende las fronteras del deporte. Irrumpió en el circuito mundial siendo apenas una adolescente de 15 años, alcanzando las semifinales de Roland Garros en 1985. Dueña de un revés a una mano con <em>topspin</em> considerado entre los más estéticos de la historia y una gran vocación para subir a la red, Gaby protagonizó rivalidades memorables frente a Steffi Graf, Martina Navratilova, Monica Seles y Arantxa Sánchez Vicario.</p>
      <p>Su consagración máxima llegó en el <strong>US Open de 1990</strong>, cuando derrotó en la final a Steffi Graf por 6-2 y 7-6(4) atacando constantemente la red. Además, conquistó dos veces el prestigioso WTA Tour Championships (Masters femenino de fin de año en 1988 y 1994), obtuvo la medalla de plata en los Juegos Olímpicos de Seúl 1988, alcanzó el N° 3 del mundo y sumó 27 títulos individuales antes de ingresar al Salón de la Fama del Tenis Internacional.</p>

      <h2>Paola Suárez y Gisela Dulko: Número 1 del mundo y medallas</h2>
      <p>En la década del 2000, el tenis femenino argentino volvió a la cima absoluta gracias a <strong>Paola Suárez</strong> y <strong>Gisela Dulko</strong>. Suárez no solo fue Top 10 en singles (semifinalista en Roland Garros 2004) y medalla de bronce olímpica en Atenas 2004 junto a Patricia Tarabini, sino que formó con la española Virginia Ruano Pascual una de las mejores parejas de dobles de todos los tiempos, ganando <strong>8 títulos de Grand Slam</strong> y liderando el ranking mundial durante 87 semanas. Años después, Gisela Dulko repitió la hazaña de alcanzar el <strong>N° 1 del mundo en dobles</strong> y conquistar el Abierto de Australia 2011 junto a Flavia Pennetta.</p>

      <h2>El presente: Podoroska, Carlé, Riera, Sierra y la gira sudamericana</h2>
      <p>En los últimos años, la histórica semifinal de <strong>Nadia Podoroska</strong> en Roland Garros 2020 (partiendo desde la clasificación) revitalizó el impulso de las tenistas argentinas. Hoy, jugadoras como María Lourdes Carlé, Julia Riera, Solana Sierra, Jazmín Ortenzi, Martina Capurro Taborda y Julieta Estable compiten semana a semana en los cuadros de Grand Slam, WTA 125 y el circuito ITF, fortalecidas por la realización del Argentina Open WTA y múltiples torneos W50 y W75 en la región.</p>
    `
  },
  {
    id: 'circuito-challenger-sudamerica-semillero-tenis-argentino',
    slug: 'circuito-challenger-sudamerica-semillero-tenis-argentino',
    title: 'La gira sudamericana del ATP Challenger Tour: Cómo se forjan los tenistas argentinos rumbo al Top 100',
    excerpt: 'Villa María, Buenos Aires, Santa Fe, Guayaquil, Lima, Cali y Costa do Sauípe conforman un corredor estratégico. Analizamos cómo funciona el circuito que impulsa a la Legión.',
    category: 'Tenis Argentino',
    readTime: '6 min',
    publishedAt: '2026-10-14',
    author: 'Redacción DobleFalta',
    imageUrl: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?auto=format&fit=crop&w=900&q=80',
    content: `
      <p>Detrás de las luces de los estadios centrales de París, Londres o Nueva York existe un ecosistema feroz, apasionante y decisivo para la carrera de cualquier tenista profesional: el <strong>ATP Challenger Tour</strong>. Para los jugadores argentinos y sudamericanos, este circuito representa el puente indispensable entre las promesas juveniles y la consolidación económica y deportiva dentro de los 100 mejores del planeta.</p>

      <h2>¿Por qué el puesto 100 del ranking cambia la carrera de un tenista?</h2>
      <p>En la economía del tenis profesional, la barrera del Top 100 es el gran objetivo estratégico de cada temporada. Quien logra ubicarse entre los primeros 98 o 100 jugadores del listado mundial al momento del cierre de inscripciones (seis semanas antes de cada torneo) obtiene el <strong>ingreso directo al cuadro principal de los cuatro Grand Slams</strong> (Australian Open, Roland Garros, Wimbledon y US Open).</p>
      <p>Disputar la primera ronda de los cuatro Majors garantiza un piso de ingresos anuales que permite financiar un equipo completo de trabajo (entrenador, preparador físico, kinesiólogo y viajes internacionales) durante toda la temporada.</p>

      <h2>La revolución de los torneos en Argentina y Sudamérica</h2>
      <p>Históricamente, los tenistas argentinos que se ubicaban entre el puesto 150 y el 350 debían afrontar larguísimas giras por Europa o Estados Unidos, pagando en dólares o euros semanas de alojamiento y pasajes aéreos con premios muy ajustados. En la última década, el desarrollo de una gira sudamericana estructurada a lo largo de todo el año transformó radicalmente esa realidad.</p>
      <p>Certámenes disputados en ciudades como <strong>Buenos Aires, Villa María, Córdoba, Santa Fe, San Miguel de Tucumán y Corrientes</strong>, articulados en calendario continuo con paradas en <strong>Guayaquil (Ecuador), Lima (Perú), Cali y Bogotá (Colombia), Santiago y Antofagasta (Chile), Montevideo (Uruguay) y Costa do Sauípe, Campinas o Curitiba (Brasil)</strong>, permiten que decenas de tenistas nacionales compitan sobre polvo de ladrillo sin cambiar de huso horario.</p>

      <h2>Dominio argentino en títulos Challenger</h2>
      <p>No es casualidad que la Argentina lidere año tras año la estadística mundial de campeones en el circuito Challenger, superando incluso a potencias con presupuestos diez veces mayores como Francia, Estados Unidos o Italia. Jugadores como Camilo Ugo Carabelli, Federico Coria, Juan Pablo Ficovich, Facundo Bagnis, Román Burruchaga, Lautaro Midón, Santiago Rodríguez Taverna, Andrea Collarini y Nicolás Kicker protagonizan verdaderas batallas tácticas cada semana que nutren de jerarquía a toda la pirámide del tenis nacional.</p>
    `
  },
  {
    id: 'historia-argentina-open-buenos-aires-lawn-tennis',
    slug: 'historia-argentina-open-buenos-aires-lawn-tennis',
    title: 'La Catedral del tenis sudamericano: Historia y campeones del Argentina Open en el Buenos Aires Lawn Tennis',
    excerpt: 'Desde las gestas de Guillermo Vilas hasta las visitas de Carlos Alcaraz y Rafael Nadal, pasando por las consagraciones de Coria, Gaudio, Nalbandian, Schwartzman y Díaz Acosta.',
    category: 'Historia y Leyendas',
    readTime: '6 min',
    publishedAt: '2026-10-12',
    author: 'Redacción DobleFalta',
    imageUrl: 'https://images.unsplash.com/photo-1560012057-4372e14c5085?auto=format&fit=crop&w=900&q=80',
    content: `
      <p>Cada mes de febrero, cuando el calor del verano porteño cae sobre los bosques de Palermo, las tribunas del histórico <strong>Buenos Aires Lawn Tennis Club (BALTC)</strong> vuelven a latir con uno de los certámenes de mayor tradición en el mundo del deporte blanco: el <strong>Argentina Open</strong>. Con raíces que se remontan a finales del siglo XIX y consolidado en la Era Abierta como una parada emblemática del ATP Tour sobre polvo de ladrillo, el torneo porteño es considerado unánimemente como "La Catedral del tenis sudamericano".</p>

      <h2>El patio de la casa de Guillermo Vilas</h2>
      <p>La cancha central del Buenos Aires Lawn Tennis lleva con total justicia el nombre de Guillermo Vilas. El marplatense levantó el trofeo de campeón en <strong>ocho oportunidades</strong> entre 1973 y 1982 (incluyendo dos ediciones disputadas en el año 1977), estableciendo una comunión irrepetible con el público argentino que desbordaba las gradas para ver sus batallas ante figuras internacionales como Björn Borg, Víctor Pecci o José Luis Clerc.</p>

      <h2>La época dorada de la Legión en Palermo</h2>
      <p>Tras su regreso fijo al calendario ATP en 2001, el torneo fue testigo directo del esplendor de la Legión Argentina. En 2004, <strong>Guillermo Coria</strong> desplegó un tenis de altísimo vuelo para derrotar a Carlos Moyá en la final; un año más tarde, en 2005, <strong>Gastón Gaudio</strong> (flamante campeón de Roland Garros) se coronó ante Mariano Puerta en una definición íntegramente nacional. En 2007 fue el turno de <strong>Juan Mónaco</strong> y en 2008 <strong>David Nalbandian</strong> alzó la copa tras vencer a José Acasuso en un domingo lluvioso e inolvidable.</p>

      <h2>De Nadal y Alcaraz a los campeones argentinos recientes</h2>
      <p>El prestigio del certamen atrajo a leyendas mundiales de la talla de Gustavo Kuerten, Carlos Moyá, David Ferrer (tricampeón consecutivo entre 2012 y 2014), Dominic Thiem, Casper Ruud, <strong>Rafael Nadal</strong> (campeón en 2015) y <strong>Carlos Alcaraz</strong> (campeón en 2023). En los últimos años, el público local volvió a celebrar títulos bien argentinos con las consagraciones de <strong>Diego Schwartzman</strong> en 2021 y la recordada semana de <strong>Facundo Díaz Acosta</strong> en 2024.</p>
    `
  },
  {
    id: 'legion-argentina-anos-2000-nalbandian-coria-gaudio-canas',
    slug: 'legion-argentina-anos-2000-nalbandian-coria-gaudio-canas',
    title: 'La Era Dorada de la Legión Argentina: Nalbandian, Coria, Gaudio, Cañas y el dominio mundial en los años 2000',
    excerpt: 'Hubo un tiempo en que la Argentina llegó a tener cuatro jugadores en el Top 10, protagonizó una final 100% nacional en Roland Garros y conquistó el Torneo de Maestros en Shanghái.',
    category: 'Historia y Leyendas',
    readTime: '7 min',
    publishedAt: '2026-10-10',
    author: 'Redacción DobleFalta',
    imageUrl: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=900&q=80',
    content: `
      <p>Entre los años 2001 y 2008, el tenis mundial vivió un fenómeno deportivo sin precedentes en Sudamérica: la explosión de la llamada <strong>"Legión Argentina"</strong>. Un grupo de más de quince jugadores contemporáneos, formados en el rigor del circuito satélite y Challenger de los años noventa, asaltó la élite de la ATP hasta convertir al país en la nación más dominante de los cuadros principales junto con España y Estados Unidos.</p>

      <h2>Roland Garros 2004: París teñido de celeste y blanco</h2>
      <p>El punto cúlmine de aquella hegemonía sobre polvo de ladrillo ocurrió en junio de 2004 en el Bois de Boulogne. Tres argentinos alcanzaron las semifinales de Roland Garros (Guillermo Coria, Gastón Gaudio y David Nalbandian), dando paso a la única final 100% argentina en la historia de los torneos de Grand Slam.</p>
      <p><strong>Guillermo Coria</strong>, el "Mago" de Venado Tuerto, llegaba como el número 3 del mundo y claro favorito tras haber ganado Montecarlo y Hamburgo. Sin embargo, <strong>Gastón Gaudio</strong>, dueño de uno de los reveses a una mano más puros de todos los tiempos, protagonizó una remontada cinematográfica: levantó dos puntos de campeonato en el quinto set para imponerse por 0-6, 3-6, 6-4, 6-1 y 8-6.</p>

      <h2>David Nalbandian y la obra maestra de Shanghái 2005</h2>
      <p>Si Coria y Gaudio brillaban con luz propia en arcilla, <strong>David Nalbandian</strong> era el talento todoterreno capaz de brillar en el césped de Wimbledon (donde fue finalista en 2002 con apenas 20 años), en el cemento del US Open y bajo techo. En noviembre de 2005, el cordobés de Unquillo acudió a la Copa Masters de Shanghái como suplente de último momento y escribió una página inmortal al derrotar en la final al número 1 del mundo, Roger Federer, por 6-7(4), 6-7(11), 6-2, 6-1 y 7-6(3), cortándole una racha de 35 victorias seguidas en finales.</p>
      <p>Dos años más tarde, en el otoño europeo de 2007, Nalbandian logró la hazaña inédita de ganar los Masters 1000 de Madrid y París-Bercy venciendo sucesivamente a Federer, Nadal y Djokovic en ambos torneos.</p>

      <h2>Cañas, Puerta, Zabaleta, Chela, Calleri y Acasuso</h2>
      <p>La grandeza de la Legión no se explicaba solo por sus líderes, sino por un pelotón temible en cualquier superficie: <strong>Guillermo Cañas</strong> (campeón del Masters 1000 de Toronto 2002 y verdugo de Federer dos veces seguidas en Indian Wells y Miami 2007), Mariano Puerta (finalista de Roland Garros 2005), Franco Squillari, Mariano Zabaleta, Juan Ignacio Chela, Agustín Calleri, José Acasuso y Juan Mónaco hicieron que en el año 2006 la Argentina llegara a tener simultáneamente a cuatro representantes dentro del Top 12 del ranking mundial.</p>
    `
  },
  {
    id: 'tactica-tenis-moderno-saque-devolucion-estadisticas',
    slug: 'tactica-tenis-moderno-saque-devolucion-estadisticas',
    title: 'Estadísticas avanzadas en el tenis moderno: Cómo leer un partido a través de los datos',
    excerpt: 'Más allá de los aces y las dobles faltas: por qué el porcentaje de puntos ganados con el segundo servicio y los intercambios de 0 a 4 golpes definen al ganador del 80% de los partidos.',
    category: 'Análisis Táctico',
    readTime: '6 min',
    publishedAt: '2026-10-08',
    author: 'Redacción DobleFalta',
    imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80',
    content: `
      <p>Cuando observamos la planilla de estadísticas de un partido en vivo en <strong>DobleFalta</strong>, es habitual que la mirada vaya primero a la cantidad de <em>aces</em> o de errores no forzados. Sin embargo, los analistas de datos de los equipos técnicos del circuito ATP y WTA saben que el verdadero desenlace de un encuentro se esconde en tres indicadores específicos.</p>

      <h2>1. La regla del 0-4 golpes: Donde se gana el 70% del tenis</h2>
      <p>Aunque los resúmenes televisivos suelen mostrar peloteos espectaculares de 25 o 30 impactos, los estudios biomecánicos y estadísticos de Grand Slams demuestran que <strong>aproximadamente el 70% de todos los puntos de un partido profesional terminan dentro de los primeros 4 golpes</strong> (saque, devolución, primer tiro del sacador y primer tiro del restador).</p>
      <p>Por eso el entrenamiento moderno dedica tanto tiempo al patrón <strong>"Saque + 1"</strong> (el primer golpe de derecha o revés inmediatamente posterior al servicio) y a la <strong>"Devolución + 1"</strong> (neutralizar el saque rival con profundidad al medio para evitar que el sacador tome la iniciativa en su segundo impacto).</p>

      <h2>2. Puntos ganados con el segundo servicio: El termómetro real</h2>
      <p>Un tenista puede meter el 70% de primeros saques y conectar 12 <em>aces</em>, pero aun así perder el partido. ¿La razón? La vulnerabilidad de su <strong>segundo servicio</strong>. En el nivel de élite, el umbral mágico del segundo saque es el <strong>50% de puntos ganados</strong>. Cuando un jugador logra sostener más del 52-55% de eficacia con su segundo envío, obliga al rival a arriesgar de más en la devolución y protege sus turnos de saque ante las situaciones de 30-30 o 30-40.</p>

      <h2>3. Conversión de Break Points vs. Break Points generados</h2>
      <p>En muchos encuentros parejos, el jugador que pierde termina sumando casi la misma cantidad de puntos totales que el ganador. La diferencia radica en la eficiencia bajo presión: generar diez oportunidades de quiebre y concretar solo una suele ser síntoma de apuro táctico o falta de selección de tiro en las ventajas. Los mejores competidores del circuito juegan los <em>break points</em> con alto porcentaje de primeros saques al cuerpo o a la T y priorizan meter la devolución en juego antes que buscar un tiro ganador directo.</p>
    `
  },
  {
    id: 'historia-doblismo-argentino-zeballos-molteni-gonzalez',
    slug: 'historia-doblismo-argentino-zeballos-molteni-gonzalez',
    title: 'Especialistas en la red: El auge de los doblistas argentinos con Horacio Zeballos, Andrés Molteni y Machi González',
    excerpt: 'Con Horacio Zeballos alcanzando el N° 1 del mundo y la dupla González-Molteni conquistando grandes torneos, el dobles argentino vive el ciclo más exitoso de su historia.',
    category: 'Tenis Argentino',
    readTime: '6 min',
    publishedAt: '2026-10-06',
    author: 'Redacción DobleFalta',
    imageUrl: 'https://images.unsplash.com/photo-1519311965067-36d3e5f33d39?auto=format&fit=crop&w=900&q=80',
    content: `
      <p>Si bien la escuela argentina se caracterizó históricamente por formar grandes batalladores desde el fondo de la cancha para la modalidad individual, la última década produjo una auténtica edad de oro en el circuito mundial de dobles masculino, llevando a representantes albicelestes a lo más alto del escalafón de la ATP.</p>

      <h2>Horacio Zeballos: De vencer a Nadal en singles a ser Número 1 del mundo</h2>
      <p>La trayectoria del marplatense <strong>Horacio Zeballos</strong> es un ejemplo brillante de reinvención deportiva. Luego de una destacada carrera como singlista —cuyo punto cumbre fue derrotar a Rafael Nadal en la final del ATP de Viña del Mar 2013—, Zeballos decidió volcar toda su sensibilidad de mano zurda, su servicio con efecto y sus reflejos de volea al circuito de dobles.</p>
      <p>Su sociedad con el español Marcel Granollers se transformó en una de las duplas más dominantes de la última década, conquistando múltiples trofeos de categoría <strong>Masters 1000</strong> (Madrid, Roma, Montreal, Cincinnati, Shanghái), alcanzando finales de Grand Slam en Wimbledon y el US Open y logrando en mayo de 2024 el hito histórico de convertirse en el <strong>primer hombre argentino en alcanzar el puesto N° 1 del ranking mundial de dobles de la ATP</strong>.</p>

      <h2>Máximo González y Andrés Molteni: Química pura y Copa Davis</h2>
      <p>En paralelo, la dupla cien por ciento nacional integrada por el tandilense <strong>Máximo "Machi" González</strong> y el porteño <strong>Andrés Molteni</strong> demostró que la coordinación y el entendimiento táctico pueden vencer a cualquier pareja de sacadores. Juntos han levantado títulos de enorme jerarquía como el Masters 1000 de Cincinnati, los ATP 500 de Río de Janeiro, Barcelona y Washington, además de clasificar a las prestigiosas Nitto ATP Finals de Turín y convertirse en un punto casi seguro para el equipo argentino de Copa Davis.</p>

      <h2>La tradición de Frana y el nuevo recambio</h2>
      <p>Siguiendo la huella que en los años noventa trazó Javier Frana (medallista olímpico en Barcelona 1992 y campeón de Roland Garros en dobles mixto) y luego Lucas Arnold Ker, Sebastián Prieto o Eduardo Schwank, hoy el circuito Challenger muestra un recambio constante de doblistas argentinos como Guido Andreozzi, Guillermo Durán, Mariano Kestelboim, Facundo Mena y Santiago Rodríguez Taverna.</p>
    `
  },
  {
    id: 'preparacion-fisica-mental-tenis-profesional-viajes',
    slug: 'preparacion-fisica-mental-tenis-profesional-viajes',
    title: 'El lado invisible del circuito: Preparación física, fortaleza mental y el desafío de viajar desde Sudamérica',
    excerpt: '¿Cómo entrena un tenista profesional durante las 35 semanas de competencia anual y cómo gestiona la presión psicológica de un deporte donde no existe el empate ni el reloj?',
    category: 'Análisis Táctico',
    readTime: '6 min',
    publishedAt: '2026-10-04',
    author: 'Redacción DobleFalta',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
    content: `
      <p>Cuando un espectador enciende la pantalla o revisa el marcador en directo de un partido de tenis, observa únicamente la punta del iceberg: dos horas y media de impactos a alta velocidad. Sin embargo, la estructura que sostiene a un tenista profesional durante un calendario de diez meses y medio de competencia continua exige una ingeniería física, nutricional y psicológica de altísima precisión.</p>

      <h2>Un deporte sin reloj ni sustituciones</h2>
      <p>Desde el punto de vista fisiológico, el tenis es un deporte intermitente de esfuerzos explosivos anaeróbicos repetidos sobre una base aeróbica de larga duración. Un jugador realiza entre 300 y 500 cambios bruscos de dirección por partido, con sprints cortos de 4 a 12 segundos separados por pausas reglamentarias de apenas 25 segundos entre punto y punto.</p>
      <p>Además, existe una variable única: <strong>no hay límite de tiempo</strong>. Un tenista debe estar preparado para resolver un partido en 70 minutos o sostener la misma lucidez coordinativa tras cuatro horas y media de batalla bajo 35 grados de calor, sin posibilidad de pedir un cambio ni recibir ayuda dentro de la cancha.</p>

      <h2>El desafío logístico de los jugadores argentinos</h2>
      <p>Para los tenistas nacidos en la Argentina, la exigencia se multiplica por la distancia geográfica. Mientras un jugador europeo puede regresar a su hogar en tren o en un vuelo de una hora cada vez que pierde en un torneo, los representantes sudamericanos suelen encadenar giras de seis a ocho semanas consecutivas lejos de sus familias, adaptándose constantemente a cambios de huso horario, diferentes pelotas oficiales, alturas sobre el nivel del mar y velocidades de superficie.</p>

      <h2>La gestión del error y los 25 segundos</h2>
      <p>En el tenis profesional, incluso el número 1 del mundo gana apenas el <strong>54% o 55% de los puntos que disputa</strong> a lo largo de una temporada. Eso significa que hasta los más grandes campeones pierden casi la mitad de los puntos que juegan. Por ello, el trabajo con psicólogos deportivos se enfoca en las rutinas entre puntos: usar los 25 segundos para regular la frecuencia cardíaca mediante la respiración, soltar la frustración del error no forzado anterior y diseñar el patrón táctico del próximo saque.</p>
    `
  },
  {
    id: 'reglamento-tenis-tiebreak-ojo-halcon-coaching',
    slug: 'reglamento-tenis-tiebreak-ojo-halcon-coaching',
    title: 'Evolución del reglamento en el tenis: Del supertiebreak de Grand Slam al Ojo de Halcón en vivo y el coaching',
    excerpt: 'El deporte blanco ha modernizado sus normas en los últimos años: el fin de los quintos sets infinitos, el canto electrónico de líneas (ELC Live) y las nuevas reglas de tiempo.',
    category: 'Reglas y Análisis',
    readTime: '6 min',
    publishedAt: '2026-10-02',
    author: 'Redacción DobleFalta',
    imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=900&q=80',
    content: `
      <p>Aunque el tenis es célebre por custodiar celosamente sus tradiciones centenarias —como el código de vestimenta blanco en Wimbledon o el sistema de puntuación 15, 30, 40—, las entidades rectoras del deporte (ITF, ATP, WTA y los cuatro Grand Slams) han implementado en los últimos años una serie de reformas reglamentarias profundas orientadas a agilizar el juego, proteger la salud de los atletas y eliminar los fallos arbitrales dudosos.</p>

      <h2>La unificación del Tie-break de 10 puntos en el quinto set</h2>
      <p>Durante décadas, cada torneo de Grand Slam tenía una regla distinta para definir el último set en caso de empate en 6-6. Aquello dio lugar a partidos maratónicos como el histórico 70-68 entre John Isner y Nicolas Mahut en Wimbledon 2010, que dejaban a los ganadores físicamente agotados para la ronda siguiente.</p>
      <p>A partir de 2022, los cuatro Majors (Australian Open, Roland Garros, Wimbledon y US Open) acordaron por primera vez una regla unificada: cuando el set decisivo (el quinto en hombres o el tercero en mujeres) llega a <strong>6-6 en games, se disputa un supertiebreak a 10 puntos</strong> con diferencia mínima de dos unidades.</p>

      <h2>Electronic Line Calling Live (Ojo de Halcón en tiempo real)</h2>
      <p>Otra transformación histórica en el circuito ATP ha sido el reemplazo progresivo de los jueces de línea humanos por el sistema electrónico <strong>ELC Live (Hawk-Eye Live)</strong>. Mediante un conjunto de cámaras de alta velocidad que triangulan la trayectoria y la huella de compresión de la pelota al milímetro, un audio automatizado canta <em>"Out"</em> o <em>"Fault"</em> en una fracción de segundo, eliminando las discusiones con el juez de silla y haciendo innecesario el antiguo sistema de "challenges" o pedidos de revisión.</p>

      <h2>Reloj de saque (Shot Clock) y habilitación del Coaching</h2>
      <p>Para evitar las demoras excesivas entre puntos, todos los estadios cuentan hoy con un reloj visible en cancha de <strong>25 segundos</strong> que se activa automáticamente apenas el juez de silla anuncia el marcador en el micrófono. Asimismo, se reglamentó el <strong>coaching desde el banco</strong>: los entrenadores pueden dar indicaciones breves a sus jugadores cuando estos se encuentran del mismo lado de la cancha, sin interrumpir el ritmo del rival.</p>
    `
  },
  {
    id: 'calendario-atp-wta-estructura-temporada-giras',
    slug: 'calendario-atp-wta-estructura-temporada-giras',
    title: 'Anatomía del calendario anual de tenis: Cómo se divide la temporada desde Oceanía hasta las Finals',
    excerpt: 'De la gira australiana en enero y el Golden Swing sudamericano en febrero a la primavera europea de polvo de ladrillo, el césped británico y el cierre bajo techo en noviembre.',
    category: 'Reglas y Análisis',
    readTime: '6 min',
    publishedAt: '2026-09-29',
    author: 'Redacción DobleFalta',
    imageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=900&q=80',
    content: `
      <p>Entender el calendario anual del tenis profesional es recorrer el mapa mundial siguiendo las estaciones climáticas. A lo largo de once meses ininterrumpidos, desde los primeros días de enero hasta mediados de noviembre, la caravana de la ATP y la WTA atraviesa siete etapas bien definidas, cada una con su propia superficie, pelotas y desafíos estratégicos.</p>

      <h2>Enero: El verano oceánico y el Abierto de Australia</h2>
      <p>La temporada se pone en marcha en el hemisferio sur con torneos sobre cemento al aire libre como la United Cup, Brisbane, Adelaida y Auckland, que sirven de puesta a punto para el primer Grand Slam del año en Melbourne Park: el <strong>Australian Open</strong>.</p>

      <h2>Febrero y Marzo: El Golden Swing sudamericano y el Sunshine Double</h2>
      <p>En febrero, el circuito se divide. Mientras Europa juega bajo techo (Rotterdam) y Medio Oriente disputa Doha y Dubái, Sudamérica vive su fiesta anual sobre polvo de ladrillo con el <strong>Golden Swing</strong> (Argentina Open en Buenos Aires, ATP 500 de Río de Janeiro y Santiago de Chile), una gira clave donde los jugadores argentinos suelen cosechar una parte fundamental de sus puntos anuales. En marzo, toda la élite converge en Estados Unidos para disputar el llamado <em>Sunshine Double</em>: los Masters 1000 de <strong>Indian Wells</strong> y <strong>Miami</strong>.</p>

      <h2>Abril a Julio: De la tierra batida europea al césped de Wimbledon</h2>
      <p>Abril inaugura la gira europea de polvo de ladrillo en Montecarlo, continuando por Barcelona, los Masters 1000 de Madrid y Roma hasta desembocar a fines de mayo en <strong>Roland Garros</strong>. Apenas cae el telón en París, los tenistas tienen solo días para cambiar el calzado y adaptarse al césped de Stuttgart, Halle y Queen's rumbo a <strong>Wimbledon</strong> en julio.</p>

      <h2>Agosto a Noviembre: Norteamérica, Asia y el cierre Indoor en Europa</h2>
      <p>El verano boreal sobre cancha dura en Canadá y Cincinnati prepara el terreno para el último Grand Slam en Nueva York: el <strong>US Open</strong>. Finalmente, tras la gira asiática encabezada por Pekín y el Masters 1000 de Shanghái, el año se traslada a las canchas rápidas bajo techo de Europa (Viena, Basilea, Estocolmo, París-Bercy) antes de coronar a los maestros en las <strong>ATP Finals de Turín</strong> y las finales de la <strong>Copa Davis</strong>.</p>
    `
  }
];

