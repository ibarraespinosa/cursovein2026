# Instalação e Configuração

## Pré-requisitos

Para usar o VEIN e acompanhar este curso, você precisará ter o seguinte instalado:

- R (baixe pelo [CRAN](https://cran.r-project.org/))
- RStudio (baixe pelo [Posit](https://posit.co/download/rstudio-desktop/))

## Pacotes Obrigatórios

Para iniciar o curso, certifique-se de instalar todas as bibliotecas espaciais das quais o VEIN depende.

```R
install.packages(c("sf", "stars", "units", "lwgeom"))
```

Em seguida, instale o VEIN a partir do GitHub ou do CRAN:

```R
install.packages("remotes")
remotes::install_github("atmoschem/vein")
```

Verifique a instalação:

```R
library(vein)
packageVersion("vein")
```

Uma vez verificada a instalação, você estará pronto para começar a lição **Introdução ao VEIN**.
