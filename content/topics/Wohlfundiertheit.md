> [!quote]-
>
> - wohlfundiert = *well-founded*

Wohlfundiertheit ist für [[binäre Relationen]] definiert. Eine binäre Relation $\mathcal R \: \subseteq M \times M$ ist genau dann wohlfundiert, wenn für jede nicht-leere Teilmenge $X \subseteq M$ ein $\mathcal R$-[[minimales Element|minimales Element]] existiert.

Es gibt also keine unendliche [[Folge|Folge]] $m_0, m_1, m_2, ...$ von Elementen in $M$ mit $(m_{i+1}, m_i) \in \mathcal R$ und $m_{i+1} \neq m_i$ für alle $i$. (Diese Aussage gilt auch umgekehrt, solange das [[Auswahlaxiom|Auswahlaxiom]] gilt.)

> [!definition] wohlfundierte Relation
> Eine binäre Relation $\mathcal R \: \subseteq M \times M$ ist wohlfundiert genau dann, wenn sie
>
> - $\forall X \subseteq M: X \neq \emptyset \rightarrow \exists x \in X: \forall y \in X: (y,x) \notin \mathcal R \lor x = y$
>   
> erfüllt.

Eine wohlfundierte Relation $\mathcal R \: \subseteq M \times M$ erlaubt [[wohlfundierte Induktion|wohlfundierte Induktion]] auf $M$.