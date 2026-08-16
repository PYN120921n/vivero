-- ============================================================================
-- Catálogo real de semillas de reforestación de Vivero Chaka.
--
-- Estos 32 registros existían en el código original (js/seed-loader.js) pero
-- la clase que los cargaba nunca se instanciaba en ningún lugar de la app: la
-- app real arrancaba con 2 semillas de ejemplo (tomate, lechuga). Aquí se usa
-- el catálogo real por primera vez.
--
-- Se conservan tal cual los nombres científicos y meses de cosecha del
-- archivo original; solo se corrigieron dos filas donde una coma de más
-- dentro del nombre científico ("Thevetia, peruviana" y "Gliricidia sepium,
-- (Jacq.)...") desalineaba las columnas siguientes al separar por comas, y
-- se capitalizó la primera letra del género en cada nombre científico
-- (convención tipográfica estándar para nomenclatura binomial).
--
-- stock_kg se deja en 0 para todas: el original nunca tuvo una cifra real de
-- inventario (usaba un valor de relleno de 1.00 para todas), así que aquí se
-- captura honestamente como "sin existencias registradas" — captúralas desde
-- el módulo de Semillas con las cantidades reales de bodega.
-- ============================================================================

insert into public.seeds (common_name, scientific_name, classification, available_months, seeds_per_kilo, unit_price, stock_kg) values
('achiote', 'Bixa orellana', 'intermedia', 'diciembre-febrero', 30000, 504, 0),
('anacahuita', 'Cordia sebestena L.', 'intermedia', 'mayo-junio', 700, 358, 0),
('balché', 'Lonchocarpus punctatus Kunth / sinónimo Lonchocarpus longistylus Pittier', 'intermedia', 'febrero-junio', 3000, 560, 0),
('campanita amarilla', 'Thevetia peruviana', 'intermedia', 'mayo-junio', 320, 392, 0),
('campanita de monte', 'Cascabela gaumeri (Hemsl.) Lippol', 'intermedia', 'mayo-junio', 300, 392, 0),
('caoba', 'Swietenia macrophylla', 'intermedia', 'febrero-marzo', 1600, 817, 0),
('cedro', 'Cedrela odorata', 'ortodoxa', 'febrero-marzo', 25000, 817, 0),
('ceiba', 'Ceiba pentandra (L.) Gaertn.', 'recalcitrante', 'mayo', 4000, 1680, 0),
('chac bojón', 'Colubrina arborescens (Milli.) Sarg.', 'recalcitrante', 'mayo', 50000, 560, 0),
('chacsikin', 'Caesalpinia pulcherrima (L.) Sw.', 'intermedia', 'junio-julio', 5300, 537, 0),
('chacteviga/chacte', 'Coulteria mollis Kunth', 'intermedia', 'abril-mayo', 5000, 560, 0),
('chaka', 'Bursera simaruba (L.) Sarg.', 'vareta', 'todo el año', 1, 5, 0),
('ciricote', 'Cordia dodecandra Dc.', 'intermedia', 'abril-agosto', 350, 358, 0),
('huano/hoja grande', 'Sabal mexicana', 'recalcitrante', 'agosto', 1500, 358, 0),
('huano macho/hoja pequeña', 'Sabal yapa', 'recalcitrante', 'julio-agosto', 4000, 358, 0),
('huaxin/tumbapelo', 'Leucaena leucocephala', 'recalcitrante', 'agosto-septiembre', 12000, 560, 0),
('jabín', 'Piscidia piscipula (L.) Sarg.', 'intermedia', 'marzo-abril', 25000, 1680, 0),
('katalox', 'Swatzia cubensis (Britton & P. Wilson) Standl. var. cubensis', 'recalcitrante', 'abril-mayo', 700, 784, 0),
('kaniste', 'Pouteria campecheania', 'recalcitrante', 'marzo-abril', 550, 616, 0),
('lipia/lipia brasileña', 'Aloysia virgata (Ruiz & Pav.) Juss. / sinónimo Lippia virgata', 'vareta', 'todo el año', 1, 5, 0),
('maculis rosado', 'Tabebuia rosea (Bertol.) Dc.', 'recalcitrante', 'febrero-marzo', 20000, 716, 0),
('pasak/negrito/falso pistache', 'Simarouba glaucac Dc.', 'recalcitrante', 'abril-mayo', 1200, 560, 0),
('pich', 'Enterolobium cyclocarpum (Jacq.) Griseb.', 'ortodoxa', 'marzo-abril', 1000, 358, 0),
('pixoy', 'Guazuma ulmifolia Lam', 'intermedia', 'mayo-junio', 100000, 1680, 0),
('ramón', 'Brosimum alicastrum Sw', 'recalcitrante', 'mayo-agosto', 350, 358, 0),
('roble', 'Erethia tinifolia L.', 'intermedia', 'julio-agosto', 16000, 560, 0),
('sak ya''ap', 'Gliricidia sepium (Jacq.) Kunth. ex Walp.', 'vareta', 'todo el año', 1, 5, 0),
('tzalam', 'Lysiloma latissiliquum (L.) Benth.', 'recalcitrante', 'septiembre', 20000, 1680, 0),
('uva de mar', 'Coccoloba uvifera (L.) L.', 'recalcitrante', 'agosto-septiembre', 1200, 560, 0),
('xkanlol', 'Tecoma stans (L.) Juss. ex Kunth var. stans', 'recalcitrante', 'abril', 181000, 616, 0),
('caracolillo', 'Sideroxylon capiri tempisque', 'recalcitrante', 'abril', 400, 504, 0),
('zapote/zapote de huevo de chivo', 'Manilkara zapota (L.) P. Royen', 'recalcitrante', 'mayo-junio', 1500, 672, 0);
