# fuel_eval.R

Embaixo do header está o código para fuel_eval.R. Os arquivos rds foram gerados durante a etapa de configuração. `factor_emi` é o fator para converter os fatores de emissão horários em fatores de emissão anuais. `pol` é o poluente a ser estimado, FC.

```
# 3) Estimation ####
language <- "portuguese" # english spanish
metadata <- readRDS("config/metadata.rds")
mileage <- readRDS("config/mileage.rds")
tfs <- readRDS("config/tfs.rds")
veh <- readRDS("config/fleet_age.rds")
met <- readRDS("config/met.rds")
net <- readRDS("network/net.rds")
lkm <- net$lkm
verbose <- FALSE
s <- readRDS("config/s.rds")

# Fuel eval
language <- "portuguese" # english spanish
fuel <- readRDS("config/fuel.rds")
pol <- "FC"
factor_emi <- 365 / (nrow(tfs) / 24) # daily to annual
source("scripts/fuel_eval.R", encoding = "UTF-8")
rm(list = ls())
gc()
```

Embaixo mostro a URL onde baixo os dados de consumo de combustivel. Pode ter mudado. [ef_cetesb](https://atmoschem.github.io/vein/reference/ef_cetesb.html) da aceso aos fatores de emissão por categoria veicular e ano da CETESB. Estos fatores tem algumas mudancas em comparacao a CETESB original. Por exemplo, o fator de emissao mais velho sempre emite mais. Tambem eu adicionei particoes nos poluentes para ter mais poluentes, como NO e NO2 a partir de NOx. Tambem transformei a economia em consumo de combustivel.

A funcao [emis](https://atmoschem.github.io/vein/reference/emis.html) calcula as emissões. Esta funcao tem muitos argumentos e o usuario deveria testar esta funcao. `emis` tem argument fortran para usar Fortran e nao R. Tambem tem `nt` que e o numero de threads no caso que fortran e usado, a traves de OpenMP.

A saida de emis e um [EmissionsArray](https://atmoschem.github.io/vein/reference/EmissionsArray.html) que tem metodos de print, summary e plot.

A funcao [emis_post](https://atmoschem.github.io/vein/reference/emis_post.html) transforma o EmissionsArray em um data.frame.

O proceso fuel_eval calcula os valores de k, inicilamente 1, para que a estimativa de combustivel bater com as vendas. Neste sentido a atividade e recalculada.

```
# calibração combustivel http://dadosenergeticos.energia.sp.gov.br/portalcev2/intranet/PetroGas/index.html
suppressWarnings(file.remove("emi/EXHAUST_FC.csv"))

# tfs
tfs <- as.data.frame(tfs)

# Escapamento ####
for (i in seq_along(metadata$vehicles)) {
  cat(
    "\n",
    metadata$vehicles[i],
    rep("", max(nchar(metadata$vehicles) + 1) - nchar(metadata$vehicles[i]))
  )

  x <- readRDS(paste0("veh/", metadata$vehicles[i], ".rds"))

  for (j in seq_along(pol)) {
    cat(pol[j], " ")

    ef <- ef_cetesb(
      p = pol[j],
      veh = metadata$vehicles[i],
      year = 2018,
      agemax = nrow(x),
      verbose = verbose
    )

    array_x <- emis(
      veh = x,
      lkm = lkm,
      ef = ef,
      profile = tfs[[metadata$vehicles[i]]],
      fortran = TRUE,
      nt = check_nt() / 2,
      simplify = TRUE,
      verbose = verbose
    )

    x_DF <- emis_post(
      arra = array_x,
      veh = metadata$vehicles[i],
      size = metadata$size[i],
      fuel = metadata$fuel[i],
      pollutant = pol[j],
      type_emi = "Exhaust",
      by = "veh"
    )

    fwrite(x_DF, "emi/EXHAUST_FC_FIRST.csv", append = TRUE)
  }
  rm(array_x, ef, x, x_DF)
}

switch(
  language,
  "portuguese" = message("\nArquivos em: /emi/*:"),
  "english" = message("\nFiles in: /emi/*"),
  "spanish" = message("\nArchivos en: /emi/*")
)

# data.table ####

dt <- fread("emi/EXHAUST_FC_FIRST.csv")
dt$pollutant <- as.character(dt$pollutant)
dt$g <- units::set_units(dt$g, g)
dt$t <- units::set_units(dt$g, t)

dt0 <- dt[pollutant == "FC", round(sum(t) * factor_emi, 2), by = .(fuel)]

data.table::setkey(dt0, "fuel")

names(dt0)[2] <- "estimation_t"

dtf <- dt0[fuel]
dtf$density_tm3 <- units::set_units(dtf$density_tm3, "t/m^3")
dtf$consumption_lt <- units::set_units(dtf$consumption_lt, "l")
dtf$consumption_m3 <- units::set_units(dtf$consumption_lt, "m^3")
dtf$consumption_t <- dtf$consumption_m3 * dtf$density_tm3
dtf$estimation_consumption <- dtf$estimation_t / dtf$consumption_t
print(dtf)

dtf$k <- 1 / dtf$estimation_consumption |> as.numeric()

k_G <- dtf[fuel == "G"]$k
k_E <- dtf[fuel == "E"]$k
k_D <- dtf[fuel == "D"]$k

# traffic again ####
language <- "portuguese" # english spanish
net <- readRDS("network/net.rds")
metadata <- readRDS("config/metadata.rds")
categories <- c("pc", "lcv", "trucks", "bus", "mc") # in network/net.gpkg
veh <- readRDS("config/fleet_age.rds")
verbose <- FALSE
theme <- "black" # dark clean ink
survival <- FALSE
source("scripts/traffic.R")

# fuel consumption again ####
language <- "portuguese" # english spanish
metadata <- readRDS("config/metadata.rds")
mileage <- readRDS("config/mileage.rds")
tfs <- readRDS("config/tfs.rds")
veh <- readRDS("config/fleet_age.rds")
met <- readRDS("config/met.rds")
net <- readRDS("network/net.rds")
lkm <- net$lkm
scale <- "tunnel"
verbose <- FALSE
year <- 2018
s <- readRDS("config/s.rds")

# Fuel eval
language <- "portuguese" # english spanish
fuel <- readRDS("config/fuel.rds")
pol <- "FC"
factor_emi <- 365 / (nrow(tfs) / 24) # daily to annual
# calibração combustivel http://dadosenergeticos.energia.sp.gov.br/portalcev2/intranet/PetroGas/index.html
suppressWarnings(file.remove("emi/EXHAUST_FC.csv"))

# tfs
tfs <- as.data.frame(tfs)

# Escapamento ####
for (i in seq_along(metadata$vehicles)) {
  cat(
    "\n",
    metadata$vehicles[i],
    rep("", max(nchar(metadata$vehicles) + 1) - nchar(metadata$vehicles[i]))
  )

  x <- readRDS(paste0("veh/", metadata$vehicles[i], ".rds"))

  for (j in seq_along(pol)) {
    cat(pol[j], " ")

    ef <- ef_cetesb(
      p = pol[j],
      veh = metadata$vehicles[i],
      year = 2018,
      agemax = nrow(x),
      verbose = verbose
    )

    array_x <- emis(
      veh = x,
      lkm = lkm,
      ef = ef,
      profile = tfs[[metadata$vehicles[i]]],
      fortran = TRUE,
      nt = check_nt() / 2,
      simplify = TRUE,
      verbose = verbose
    )

    x_DF <- emis_post(
      arra = array_x,
      veh = metadata$vehicles[i],
      size = metadata$size[i],
      fuel = metadata$fuel[i],
      pollutant = pol[j],
      type_emi = "Exhaust",
      by = "veh"
    )

    fwrite(x_DF, "emi/EXHAUST_FC_FINAL.csv", append = TRUE)
  }
  rm(array_x, ef, x, x_DF)
}

switch(
  language,
  "portuguese" = message("\nArquivos em: /emi/*:"),
  "english" = message("\nFiles in: /emi/*"),
  "spanish" = message("\nArchivos en: /emi/*")
)

# data.table ####

dt <- fread("emi/EXHAUST_FC_FINAL.csv")
dt$pollutant <- as.character(dt$pollutant)
dt$g <- units::set_units(dt$g, g)
dt$t <- units::set_units(dt$g, t)

dt0 <- dt[pollutant == "FC", round(sum(t) * factor_emi, 2), by = .(fuel)]

data.table::setkey(dt0, "fuel")

names(dt0)[2] <- "estimation_t"

dtf <- dt0[fuel]
dtf$density_tm3 <- units::set_units(dtf$density_tm3, "t/m^3")
dtf$consumption_lt <- units::set_units(dtf$consumption_lt, "l")
dtf$consumption_m3 <- units::set_units(dtf$consumption_lt, "m^3")
dtf$consumption_t <- dtf$consumption_m3 * dtf$density_tm3
dtf$estimation_consumption <- dtf$estimation_t / dtf$consumption_t
print(dtf)


switch(
  language,
  "portuguese" = message("Limpando..."),
  "english" = message("Cleaning..."),
  "spanish" = message("Limpiando...")
)

suppressWarnings(rm(i, j, pol, dt, dt0, dtf, factor_emi, fuel))

ls()
invisible(gc())
```
