> [!quote]-
> 
> - Vereinigung = *union*
> - Schnitt = *intersection*
> - Differenz = *difference*
> - Teilmenge = *subset*
> - endliche Multimenge = *finite multiset*

Auf [[Multimenge|Multimengen]] können wir die bekannten [[Mengenoperationen|Mengenoperationen]] anwenden, wir müssen diese in ihrer Definition nur auf die Eigenschaften einer Multimenge anpassen.

> [!definition] Vereinigung
> Für die Vereinigung zweier Multimengen $S_1, S_2$ gilt $(S_1 \cup S_2)(m) = S_1(m) + S_2(m)$.

> [!definition] Schnitt
> Für den Schnitt zweier Multimengen $S_1, S_2$ gilt $(S_1 \cap S_2)(m) = min(S_1(m), S_2(m))$.

> [!definition] Differenz
> Für die Differenz von einer Multimenge $S_1$ mit einer Multimenge $S_2$ gilt $(S_1 \setminus S_2)(m) = max(0, S_1(m) - S_2(m))$.

> [!definition] Teilmenge
> Für zwei Multimengen $S_1, S_2$ gilt $S_1 \subseteq S_2 \leftrightarrow  \forall m \in M: S_1(m) \leq S_2(m)$.

> [!definition] echte Teilmenge
> Für zwei Multimengen $S_1, S_2$ gilt $S_1 \subset S_2 \leftrightarrow  \forall m \in M: S_1(m) \leq S_2(m) \land S_1 \neq S_2$.

> [!definition] Element
> Für ein Element $m$ und eine Multimenge $S$ gilt $m \in S \leftrightarrow S(m) > 0$.

> [!definition] Endlichkeit
> Für ein Element eine Multimenge $S$ gilt $|S| < \infty \leftrightarrow |\{ m| S(m) > 0 \}| < \infty$.

