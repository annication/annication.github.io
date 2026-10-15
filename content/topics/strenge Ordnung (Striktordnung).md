> [!quote]-
> 
> - strenge Ordnung = *strict order*
> - Irreflexivität = *irreflexive property*
> - Asymetrie = *asymetric property*

> [!definition] strenge Ordnung
> Eine [[binäre Relation|binäre Relation]] $\prec$ auf einer [[Menge|Menge]] $M$ ist eine strenge Ordnung genau dann, wenn sie
>
>- $\forall a \in M: a \nprec a$ (Irreflexivität)
>- $\forall a,b,c \in M: a \prec b \land b \prec c \rightarrow a \prec c$ (Transitivität)
>
> erfüllt.

> [!note] Asymmetrie und Antisymmetrie
> Allgemein gilt 
>
> $$ \text Irreflexivität + \text Transitivität \implies \text Asymmetrie \implies \text Antisymmetrie $$
> 
> Damit folgt die Antisymmetrie einer Striktordnung implizit aus ihrer Definition.

> [!note] Striktordnung und Ordnung
> Wie dir vielleicht auffällt, ist eine Striktordnung nach dieser Definition **keine** [[Ordnungsrelation|Ordnungsrelation]], denn sie verletzt die Reflexivitätseigenschaft. Vielmehr ist jede strenge Ordnung die [[strikte Variante einer Ordnungsrelation|strikte Variante]] einer eindeutig bestimmten (reflexiven) Ordnungsrelation.

> [!example]-
> Ein paar einfache Beispiele für strenge Ordnungsrelationen sind
>
> - $< \subset \mathbb N \times \mathbb N$ (Die kleiner Relation auf den natürlichen Zahlen ist eine strenge [[totale Ordnung|totale Ordnung]])
> - Die Mitarbeiterhierarchie ($a$ ist $b$ direkt oder indirekt unterstellt) in einem Unternehmen ist eine strenge partielle Ordnung
