Die lexikografische Ordnung leitet die Ordnung von Elemente aus dem [[kartesische Produkt|kartesischen Produkt]] zweier [[Mengen]] $M \times N$ aus der Kombination zweier [[strenge Ordnung (Striktordnung)|strenger Ordnungen]] $(M, \prec_M), (N, \prec_N)$ auf eben diesen Mengen her.

> [!definition] lexikografische Ordnung
> Für zwei strenge Ordnungen $(M, \prec_M), (N, \prec_N)$  ist $\prec_{lex} = (\prec_M, \prec_N)$ eine strenge Ordnung auf $M \times N$ genau dann, wenn 
> - $\forall (m, n), (m', n') \in M \times N: \\ (m, n) \prec_{lex} (m', n') \leftrightarrow m \prec_M m' \lor (m = m' \land n \prec_N n')$
>   
>   gilt.

> [!note] Eigenschaften von $\prec_{lex}$
> 
> 1. $\prec_{lex}$ ist eine strenge Ordnung auf $M \times N$
> 2. wenn $(M, \prec_M)$ und $(N, \prec_N)$ [[Wohlfundiertheit|wohlfundiert]] sind, dann gilt das auch für $\prec_{lex}$<sup>*</sup>
> 3. wenn $(M, \prec_M)$ und $(N, \prec_N)$ [[totale Ordnung|total]] sind, dann gilt das auch für $\prec_{lex}$ 

<small><sup>*</sup>Beachte, dass dies gilt, weil wir Tupel fester endlicher Länge betrachen. Auf M*, der Menge aller endlichen Wörter beliebiger Länge, muss die lexikografische Ordnung dagegen nicht wohlfundiert sein.</small> 

> [!example]-
> Ein Beispiel für eine lexikografische Ordnung ist die Ordnung von zwei-buchstabigen Wörtern aus der Ordnung von unseren 26 Buchstaben herzuleiten.