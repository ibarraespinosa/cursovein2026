# main.R

Aqui vamos rodar o main.R do projeto brazil_td. Este

A primeira parte consiste em baixar as ruas de OpenStreetMap
para Brasil. Estos arquivos estão na para cada estado do Brasil em formato [GPKG](https://gdal.org/en/stable/drivers/vector/gpkg.html).

Logos vamos rodar os scripts para rodar

- frota
- combustivel
- quilometragem
- meteorologia
- pre_main

```r
system("git clone https://gitlab.com/ibarraespinosa/brazil_roads")

source("config/01_fleet_brazil_v4_full.R")
rm(list = ls())
gc()


source("config/02_fuel_v3.R")
rm(list = ls())
gc()

source("config/03_mileage.R")
rm(list = ls())
gc()

source("config/04_metv2.R")
rm(list = ls())
gc()

source("config/05_pre_main.R")
rm(list = ls())
gc()
```
