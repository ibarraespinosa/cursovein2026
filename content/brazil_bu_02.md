# config.R

```
options(encoding = "UTF-8")
library(vein) # vein
library(sf) # spatial data
library(cptcity) # 7120 colour palettes
library(ggplot2) # plots
library(eixport) # WRF Chem
library(data.table) # blasting speed
library(units)
sessionInfo()

# 0 Configuration

language <- "portuguese" # english spanish
path <- "config/inventory.xlsx"
readxl::excel_sheets(path) # For libre office, readODS::read_ods()
metadata <- readxl::read_xlsx(path = path, sheet = "metadata")
mileage <- readxl::read_xlsx(path = path, sheet = "mileage")
tfs <- readxl::read_xlsx(path = path, sheet = "tfs")
veh <- readxl::read_xlsx(path = path, sheet = "fleet_age")
fuel <- readxl::read_xlsx(path = path, sheet = "fuel")
met <- readxl::read_xlsx(path = path, sheet = "met")
s <- readxl::read_xlsx(path = path, sheet = "s")
im_ok <- readxl::read_xlsx(path = path, sheet = "im_ok")
im_co <- readxl::read_xlsx(path = path, sheet = "im_co")
im_hc <- readxl::read_xlsx(path = path, sheet = "im_hc")
im_nox <- readxl::read_xlsx(path = path, sheet = "im_nox")
im_pm <- readxl::read_xlsx(path = path, sheet = "im_pm")
year <- 2018
theme <- "black" # dark clean ink
scale <- "default"
delete_directories <- TRUE
source("config/config.R", encoding = "UTF-8")
rm(list = ls())
gc()

```

A confiuracao do inventario estao no arquivo excel config/inventory.xlsx, com as seguintes folhas:

- metadata: Inclui as definicoes dos tipos de veiculos.
- fleet_age: Inclui as definicoes da frota de veiculos.
- tfs: Inclui fatores de expansao temporal.
- mileage: Inclui o quilometragem dos veiculos.
- fuel: Inclui as vendas de combustivel.
- met: Inclui informacao meteorologica.
- s: Inclui as informacoes de enxofre.
- im_ok: Inclui a percentagem dos veiculos que passariam uma inspeção veicular.
- im_co: Inclui as dos veiculos que passariam uma inspeção veicular.
- im_hc: Inclui as dos veiculos que passariam uma inspeção veicular.
- im_nox: Inclui as dos veiculos que passariam uma inspeção veicular.
- im_pm: Inclui as dos veiculos que passariam uma inspeção veicular.
