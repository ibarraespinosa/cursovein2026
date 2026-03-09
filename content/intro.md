# Inventários de emissões

![](https://ibarraespinosa.github.io/2023PERU/td.png)

Um inventário de emissoes e quantificacao da massas emitidas de poluentes atmosfericos
para uma regiao e durante um periodo de tempo.

![](https://assets.cambridge.org/97811071/46969/cover/9781107146969.jpg)

Para entender melhor o que e um inventario de emissoes, vamos considerar a aproximacao com
assimilacao de dados. Aplicando o teorema de bayes e filtro de kalman, temos uma estimativa de emissoes como mostrado na parte da dereita da figura. Para mas detalhes, por favor ver o [Brasseur e Jacob (2017)](https://www.cambridge.org/core/books/atmospheric-chemistry-and-transport/1107146969). Estas estimativas sao chamadas de _posterior_,otimizadas ou _top down_, e sao as estimativas que temos apos a assimilacao de dados. Basicamente, isto representa que a estimativa posterior e assimilando observacoes novas (torres, satelites, etc), com informacao previo _priori_, que corresponde a parte esquerda da figura.
Na parte esqueda da figura temos as estimativas _priori_, neste caso divididas como _bottom-up_ quando temos informacao de fluxo veicular nas ruas e _top-down_ quando temos informacao de estatistica da frota por area de estudo. Neste curso vamos trabalhar com a informacao priori, que e a informacao que temos antes de fazer a assimilacao de dados.

Varios inventarios globais sao disponiveis:

- [GAINS](https://gains.iiasa.ac.at/models/gains_models4.html).
- [EDGAR](https://edgar.jrc.ec.europa.eu/).
- [CEDS](https://www.pnnl.gov/projects/ceds).

e mais, por em, os inventarios no geral tem resultados muito diferentes para paises em America do sul, veja [Ibarra Espinosa et al., 2026](https://pubs.acs.org/doi/full/10.1021/acs.est.5c08400).
