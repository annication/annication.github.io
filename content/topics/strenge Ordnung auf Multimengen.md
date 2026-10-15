> [!definition] [[strenge Ordnung (Striktordnung)|strenge Ordnung]] auf [[Multimenge|Multimengen]]
>   Sei $(M,\prec)$ eine strenge Ordnung. Die Multimengenordnung $\prec_{mul}$ auf der Menge aller [[Operationen auf Multimengen|endlichen]] Multimengen über $M$ definieren wir für beliebige $S_1, S_2: M \rightarrow \mathbb N$ durch:
>  
> - $S_1 \prec_{mul} S_2 \leftrightarrow \\ S_1 \neq S_2 \land \forall m \in M: (S_2(m) < S_1(m) \rightarrow (\exists m' \in M: (m' \prec m \land S_1(m') < S_2(m')))$

> [!note] Eigenschaften von $\prec_{mul}$
> 
> 1. $\prec_{mul}$ ist eine strenge Ordnung auf Multimengen über $M$
> 2. wenn $(M, \prec)$ [[Wohlfundiertheit|wohlfundiert]] ist, dann gilt das auch für $\prec_{mul}$
> 3. wenn $(M, \prec)$ [[totale Ordnung|total]] ist, dann gilt das auch für $\prec_{mul}$ 