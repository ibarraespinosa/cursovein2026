# Módulo 1: Introdução ao VEIN

Bem-vindo ao _curso_ do VEIN. Nesta lição, exploraremos o que é o pacote R **VEIN** e como começar.

## O que é o VEIN?

VEIN (Vehicular Emissions Inventories) é um pacote R desenvolvido para estimar emissões veiculares de forma abrangente. Ele abrange a modelagem bottom-up:

- Entrada de dados espaciais precisos de tráfego (classe `sf`)
- Associação de matrizes temporais aos segmentos de tráfego
- Estimativa de fatores de emissão baseados em combustível, tecnologia e definições locais
- Cálculo dinâmico de emissões

## Instalação

Para começar, você precisa instalar o pacote a partir do CRAN.

```r
# Instalar via CRAN
install.packages("vein")

# Alternativamente, instalar a versão de desenvolvimento do GitHub
install.packages("remotes")
remotes::install_github("atmoschem/vein")
```

Uma vez instalado, basta carregar o pacote:

```r
library(vein)
packageVersion("vein")
```

## Estrutura Básica

A compilação de um inventário inclui várias etapas sequenciais dentro do VEIN:

1. **Modelagem de Tráfego:** Preparar uma rede viária explicitamente.
2. **Distribuição de Velocidade:** Associar dados de velocidade aos veículos em cada segmento.
3. **Frota de Veículos:** Especificar idades, uso e degradação dos veículos.
4. **Fatores de Emissão:** Selecionar equações ou tabelas apropriadas que representam as emissões (por exemplo, dados da CETESB para o Brasil).
5. **Emissões:** Calcular resultados precisos em unidades de massa.
6. **Alocação Espacial (Gridding):** Agregar resultados em unidades espaciais para modelagem atmosférica.

### Exemplo: Plotando Dados

O VEIN, usando sf, fornece métodos fáceis de usar para plotar dados espaciais:

```r
plot(net["capacity"], main="Capacidade da Rede Viária", axes = T)
```

![](content/figs/iB39c0q.png)

## Projetos

VEIN tem muitos projetos que podem ser carregados facilmente. Mas neste curso a gente vai trabalhar com dois, especificamente:

- "brazil": que e o projeto de Sao Paulo
- "brazil_td": que e o projeto do Brasil

> **Plano de Trabalho**: O primeiro dia vamos rodar o projeto de Sao Paulo, que e um projeto menor e mais facil de entender. Como tarefa, os estudantes vao rodar o segundo projeto que toma mais tempo e na semana a seguir, vamos analiar os resultados. Os estudantes vao apresnetar os resultados.

```r
get_project(directory = "brazil_bu", case = "brazil")
```

```r
get_project(directory = "brazil_td", case = "brazil_td")
```
